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
import { DateTime } from 'luxon';

const calendarStore = useCalendarStore()

const isModalOpen = ref(false);
const isEventCardModalOpen = ref(false);
const selectedRange = ref<DateSelectArg | null>(null);
const selectedEvent = ref<EventData | null>(null)
const scheduleData = ref<ScheduleDataProps>({
  date_start: '',
  date_end: '',
  time_start: '',
  time_end: '',
  duration: 0
})
const calendarRef = ref<any>(null)

const calculateHoursDifference = (startStr: string, endStr: string): number  => {
  const start = DateTime.fromISO(startStr);
  const end = DateTime.fromISO(endStr);
  const diff = end.diff(start, 'hours').toObject();
  return diff.hours || 0;
}

const handleDateSelect = (selectInfo: DateSelectArg) => {
  selectedRange.value = selectInfo;

  const start = DateTime.fromISO(selectInfo.startStr);
  const end = DateTime.fromISO(selectInfo.endStr);

  scheduleData.value = {
    date_start: start.toFormat('yyyy-MM-dd'),
    date_end: end.toFormat('yyyy-MM-dd'),
    time_start: selectInfo.startStr.includes('T') ? start.toFormat('HH:mm') : '',
    time_end: selectInfo.endStr.includes('T') ? end.toFormat('HH:mm') : '',
    duration: calculateHoursDifference(selectInfo.startStr, selectInfo.endStr)
  };

  setTimeout(() => isModalOpen.value = true, 500)

};

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
  isEventCardModalOpen.value = true
  console.log('Event data:',isEventCardModalOpen.value)
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
      const start = DateTime.fromJSDate(info.start).toFormat('yyyy-MM-dd');
      const end = DateTime.fromJSDate(info.end).toFormat('yyyy-MM-dd');
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
      v-bind="scheduleData"
      @submit="handleModalSubmit"
  />
  <ShowEventModal
      v-model="isEventCardModalOpen"
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
