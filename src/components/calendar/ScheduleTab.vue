<script setup lang="ts">
import { ref } from 'vue'
import { Notify } from 'quasar'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventApi,
  CalendarOptions,
} from '@fullcalendar/core'
import type { EventDragStartArg, EventResizeDoneArg } from '@fullcalendar/interaction'
import { DateTime } from 'luxon'

import ScheduleFormModal from '@/components/calendar/ScheduleFormModal.vue'
import ShowEventModal from '@/components/calendar/ShowEventModal.vue'

import { postEvent } from '@/services/calendar'
import { useCalendarStore } from '@/store/calendar'
import type { EventData, EventDataCreate } from '@/types/calendar'

/* ===================== STORE ===================== */

const calendarStore = useCalendarStore()

/* ===================== UI STATE ===================== */

const calendarRef = ref<any>(null)

const isFormModalOpen = ref(false)
const isEventModalOpen = ref(false)

const mode = ref<'create' | 'edit'>('create')
const formModel = ref<EventDataCreate | null>(null)
const editId = ref<number | null>(null)

const selectedEvent = ref<EventData | null>(null)
const isCopyDrag = ref(false)
const copyDropHandled = ref(false)
let copyPlaceholderEl: HTMLElement | null = null

function setCopyDragActive(active: boolean) {
  const calendarEl = calendarRef.value?.$el as HTMLElement | undefined
  calendarEl?.classList.toggle('fc-copy-drag-active', active)
}

function createCopyPlaceholder(sourceEl: HTMLElement) {
  const harness = sourceEl.closest('.fc-daygrid-event-harness, .fc-timegrid-event-harness') as HTMLElement | null
  const placeholder = sourceEl.cloneNode(true) as HTMLElement

  placeholder.classList.add('fc-event-copy-placeholder')
  placeholder.setAttribute('aria-hidden', 'true')

  if (!harness) {
    sourceEl.parentElement?.insertBefore(placeholder, sourceEl)
    copyPlaceholderEl = placeholder
    return
  }

  const placeholderHarness = document.createElement('div')
  placeholderHarness.className = `${harness.className} fc-event-copy-placeholder-harness`
  if (harness.style.cssText) {
    placeholderHarness.style.cssText = harness.style.cssText
  }
  placeholderHarness.appendChild(placeholder)
  harness.parentElement?.insertBefore(placeholderHarness, harness.nextSibling)
  copyPlaceholderEl = placeholderHarness
}

function cleanupCopyDrag() {
  copyPlaceholderEl?.remove()
  copyPlaceholderEl = null
  isCopyDrag.value = false
  setCopyDragActive(false)
}

function buildEventPayload(event: EventApi): EventDataCreate {
  const start = DateTime.fromJSDate(event.start!)
  const end = DateTime.fromJSDate(event.end!)
  const extendedProps = event.extendedProps

  return {
    title: event.title,
    description: String(extendedProps.description ?? ''),
    price: Number(extendedProps.price ?? 0),
    currency_id: Number(extendedProps.currency_id ?? 1),
    date_start: start.toFormat('yyyy-MM-dd'),
    date_end: end.toFormat('yyyy-MM-dd'),
    time_start: start.toFormat('HH:mm'),
    time_end: end.toFormat('HH:mm'),
    timezone_id: extendedProps.timezone?.id ?? extendedProps.student?.timezone?.id ?? null,
    student_id: extendedProps.student?.id ?? null,
  }
}

async function saveEventMove(event: EventApi, revert: () => void) {
  const result = await calendarStore.patchEvent(buildEventPayload(event), event.id)

  if (!result) {
    revert()
  }
}

function refetchCalendarEvents() {
  calendarRef.value?.getApi()?.refetchEvents()
}

async function saveEventCopy(event: EventApi, revert: () => void) {
  const payload = buildEventPayload(event)

  cleanupCopyDrag()
  revert()

  const dismiss = Notify.create({
    type: 'ongoing',
    message: 'Copying lesson…',
    spinner: true,
    timeout: 0,
  })

  try {
    const result = await postEvent(payload)

    if (!result) {
      Notify.create({
        type: 'negative',
        message: 'Failed to copy lesson',
      })
      return
    }

    Notify.create({
      type: 'positive',
      message: 'Lesson copied',
      timeout: 2000,
    })
    refetchCalendarEvents()
  } finally {
    dismiss()
  }
}

function handleEventDragStart(dragInfo: EventDragStartArg) {
  const isCopy = dragInfo.jsEvent.altKey
  isCopyDrag.value = isCopy
  copyDropHandled.value = false

  if (!isCopy) return

  setCopyDragActive(true)
  createCopyPlaceholder(dragInfo.el)
}

function handleEventDragStop() {
  if (!isCopyDrag.value) return

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (!copyDropHandled.value) {
        cleanupCopyDrag()
      }
    })
  })
}

async function handleEventDrop(dropInfo: EventDropArg) {
  const shouldCopy = isCopyDrag.value || dropInfo.jsEvent.altKey

  if (shouldCopy) {
    copyDropHandled.value = true
    await saveEventCopy(dropInfo.event, dropInfo.revert)
    return
  }

  await saveEventMove(dropInfo.event, dropInfo.revert)
}

async function handleEventResize(resizeInfo: EventResizeDoneArg) {
  await saveEventMove(resizeInfo.event, resizeInfo.revert)
}

/* ===================== CALENDAR HANDLERS ===================== */

function handleDateSelect(selectInfo: DateSelectArg) {
  const isAllDay = !selectInfo.startStr.includes('T')

  const start = DateTime.fromISO(selectInfo.startStr)
  const end = isAllDay
      ? DateTime.fromISO(selectInfo.endStr).minus({ days: 1 })
      : DateTime.fromISO(selectInfo.endStr)

  mode.value = 'create'
  editId.value = null

  formModel.value = {
    title: '',
    description: '',
    price: 0,
    currency_id: 1,
    date_start: start.toFormat('yyyy-MM-dd'),
    date_end: end.toFormat('yyyy-MM-dd'),
    timezone_id: null,
    student_id: null,
    time_start: isAllDay ? '00:00' : start.toFormat('HH:mm'),
    time_end: isAllDay ? '01:00' : end.toFormat('HH:mm'),
  }

  isFormModalOpen.value = true
}


function handleEventClick(clickInfo: EventClickArg) {
  const event = clickInfo.event

  selectedEvent.value = {
    id: event.id,
    title: event.title,
    start: event.startStr,
    end: event.endStr,
    extendedProps: {
      price: Number(event.extendedProps.price ?? 0),
      description: String(event.extendedProps.description ?? ''),
      currency_id: Number(event.extendedProps.currency_id ?? 1),
      completed: Boolean(event.extendedProps.completed ?? false),
      student: event.extendedProps.student ?? null,
      timezone: event.extendedProps.timezone ?? null,
    },
  }

  isEventModalOpen.value = true
}

function editEventForm(data: EventDataCreate, id: number) {
  mode.value = 'edit'
  editId.value = id
  formModel.value = { ...data }

  isEventModalOpen.value = false
  isFormModalOpen.value = true
}

async function deleteEvent(id: number) {
  try {
    await calendarStore.deleteEvent(id)

    // закрываем show modal
    isEventModalOpen.value = false
    selectedEvent.value = null

    // обновляем календарь
    const calendarApi = calendarRef.value?.getApi()
    calendarApi?.refetchEvents()

  } catch (error) {
    console.error('Delete failed:', error)
  }
}

/* ===================== FORM SUBMIT ===================== */

async function onSubmitForm(data: EventDataCreate) {
  if (mode.value === 'create') {
    await postEvent(data)
  } else if (editId.value !== null) {

    await calendarStore.patchEvent(data, editId.value)
  }

  isFormModalOpen.value = false

  const calendarApi = calendarRef.value?.getApi()
  calendarApi?.refetchEvents()
}

/* ===================== CALENDAR OPTIONS ===================== */

const calendarOptions = ref<CalendarOptions>({
  firstDay:1,
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  initialView: 'dayGridMonth',
  initialEvents: [],
  editable: true,
  selectable: true,
  selectMirror: true,
  dragRevertDuration: 0,
  dayMaxEvents: true,
  weekends: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDragStart: handleEventDragStart,
  eventDragStop: handleEventDragStop,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  eventsSet: () => {},
  eventDidMount: (info: any) => {
    const color = info.event.extendedProps?.student?.color || 'gray'
    info.el.style.background = color
    info.el.style.color = 'white'
  },
  events: async (info, successCallback, failureCallback) => {
    try {
      const start = DateTime.fromJSDate(info.start).toFormat('yyyy-MM-dd')
      const end = DateTime.fromJSDate(info.end).toFormat('yyyy-MM-dd')

      await calendarStore.getEvents(start, end)
      successCallback(calendarStore.events)
    } catch (error: any) {
      console.error('Error fetching events:', error)
      failureCallback(error)
    }
  },
})
</script>

<template>
  <FullCalendar
    ref="calendarRef"
    class="demo-app-calendar"
    :options="calendarOptions"
  >
    <template #eventContent="{ event, timeText }">
      <b>{{ timeText }}</b>
      <b>{{ event.extendedProps?.student?.name ?? '—' }}</b> -
      <i>{{ event.title }}</i>
    </template>
  </FullCalendar>

  <ScheduleFormModal
    v-model="isFormModalOpen"
    :model="formModel"
    :mode="mode"
    @submit="onSubmitForm"
  />

  <ShowEventModal
    v-model="isEventModalOpen"
    :event="selectedEvent"
    @unselect="selectedEvent = null"
    @edit="editEventForm"
    @delete="deleteEvent"
  />
</template>

<style scoped>
b {
  margin-right: 3px;
}

.demo-app-calendar :deep(.fc-copy-drag-active .fc-event-mirror) {
  opacity: 0.85;
  outline: 2px dashed #1976d2;
  outline-offset: 1px;
}

.demo-app-calendar :deep(.fc-copy-drag-active .fc-event-dragging:not(.fc-event-mirror):not(.fc-event-copy-placeholder)) {
  opacity: 0.75;
  outline: 2px dashed #1976d2;
  outline-offset: 1px;
}

.demo-app-calendar :deep(.fc-event-copy-placeholder) {
  opacity: 0.55;
  pointer-events: none;
  filter: saturate(0.85);
}

.demo-app-calendar :deep(.fc-event-copy-placeholder-harness) {
  pointer-events: none;
  z-index: 5;
}
</style>