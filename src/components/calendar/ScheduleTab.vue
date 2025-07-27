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
  EventInput
} from '@fullcalendar/core';
import ScheduleFormModal from "@/components/calendar/ScheduleFormModal.vue";
import ShowEventModal from "@/components/calendar/ShowEventModal.vue";
import {postEvent} from "@/services/calendar";
import {EventData, CalendarEvent, ScheduleDataProps} from "@/types/calendar";
import { useCalendarStore } from '@/store/calendar'
import { format } from 'date-fns'

const calendarStore = useCalendarStore()

const isModalOpen = ref(false);
const isShowModalOpen = ref(false);
const selectedRange = ref<DateSelectArg | null>(null);
const selectedEvent = ref<EventData | null>(null)
const scheduleData = ref<ScheduleDataProps>({
  date_start: '',
  date_end: '',
  time_start: '',
  time_end: ''
})

const calendarRef = ref<any>(null)


const handleDateSelect = (selectInfo: DateSelectArg) => {
  selectedRange.value = selectInfo
  console.log(scheduleData.value, 'scheduleData')
  isModalOpen.value = true
}

const handleModalSubmit = async (formData: EventData) => {
  await postEvent(formData);
  const calendarApi = selectedRange.value!.view.calendar;
  calendarApi.unselect();
  calendarApi.refetchEvents();

  isModalOpen.value = false;
}

const handleEventClick = (clickInfo: EventClickArg) => {
  const event = clickInfo.event

  selectedEvent.value = {
    id: event.id,
    title: event.title,
    start: event.startStr,
    end: event.endStr,
    extendedProps: {
      ...event.extendedProps
    }
  }
  isShowModalOpen.value = true
  console.log('Event data:',isShowModalOpen.value)
}

const handleEvents = () => {

}

const calendarOptions = ref<{
  plugins: any[];
  headerToolbar: Record<string, string>;
  initialView: string;
  initialEvents: EventInput[];
  editable: boolean;
  selectable: boolean;
  selectMirror: boolean;
  dayMaxEvents: boolean;
  weekends: boolean;
  select: (info: DateSelectArg) => void;
  eventClick: (info: EventClickArg) => void;
  eventsSet: (events: EventApi[]) => void;
  events: (
      info: CalendarEvent,
      successCallback: (events: EventData[]) => void,
      failureCallback: (error: any) => void
  ) => void;
}>({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
  eventsSet: handleEvents,
  events: async (info, successCallback, failureCallback) => {
    try {
      const start = format(info.start, 'yyyy-MM-dd')
      const end = format(info.end, 'yyyy-MM-dd')
      await calendarStore.getEvents(start, end)
      successCallback(calendarStore.events)
    } catch (error) {
      console.error("Error fetching events:", error)
      failureCallback(error)
    }
  }
});
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
      v-model="isModalOpen"
      :start="selectedRange?.startStr"
      :end="selectedRange?.endStr"
      @submit="handleModalSubmit"
  />
  <ShowEventModal
      v-model="isShowModalOpen"
      :event="selectedEvent"
  />
</template>

<style scoped>

ul {
  margin: 0;
  padding: 0 0 0 1.5em;
}
li {
  margin: 1.5em 0;
  padding: 0;
}
b {
  margin-right: 3px;
}
</style>
