<script setup lang="ts">
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import {
  DateSelectArg,
  EventClickArg,
  EventApi,
  EventInput,
} from '@fullcalendar/core'
import { DateTime } from 'luxon'

import ScheduleFormModal from '@/components/calendar/ScheduleFormModal.vue'
import ShowEventModal from '@/components/calendar/ShowEventModal.vue'

import { postEvent } from '@/services/calendar'
import { useCalendarStore } from '@/store/calendar'
import type { EventData, EventDataCreate, CalendarEvent } from '@/types/calendar'

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

const calendarOptions = ref<{
  plugins: any[]
  headerToolbar: Record<string, string>
  initialView: string
  initialEvents: EventInput[]
  editable: boolean
  selectable: boolean
  selectMirror: boolean
  dayMaxEvents: boolean
  weekends: boolean
  select: (info: DateSelectArg) => void
  eventClick: (info: EventClickArg) => void
  eventsSet: (events: EventApi[]) => void
  events: (
      info: CalendarEvent,
      successCallback: (events: EventData[]) => void,
      failureCallback: (error: any) => void
  ) => void
}>({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  initialView: 'dayGridMonth',
  initialEvents: [],
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: () => {},
  events: async (info, successCallback, failureCallback) => {
    try {
      const start = DateTime.fromJSDate(info.start).toFormat('yyyy-MM-dd')
      const end = DateTime.fromJSDate(info.end).toFormat('yyyy-MM-dd')

      await calendarStore.getEvents(start, end)
      successCallback(calendarStore.events)
    } catch (error) {
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
  />
</template>

<style scoped>
b {
  margin-right: 3px;
}
</style>
