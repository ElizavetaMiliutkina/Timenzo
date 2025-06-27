<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
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
import { INITIAL_EVENTS, createEventId } from '../utils/event-utils'
import ScheduleFormModal from "@/components/calendar/ScheduleFormModal.vue";
import {postEvent, getEvents} from "@/services/calendar";
import {EventData} from "@/types/calendar";

const currentEvents = ref<any[]>([]);
const isModalOpen = ref(false);
const selectedRange = ref<DateSelectArg | null>(null);

const calendarRef = ref<any>(null)

const formatDate = (date: Date) =>
    date.toISOString().slice(0, 10);

onMounted(async () => {
  // const events = await getEvents()
  // const mapped: EventInput[] = events.map((e: EventData) => ({
  //   id: e.id?.toString() || createEventId(),
  //   title: e.title,
  //   start: `${e.date}T${e.time_start}`,
  //   end: `${e.date}T${e.time_end}`,
  //   extendedProps: { price: e.price, description: e.description }
  // }))
  //
  // await nextTick() // дождаться, пока FullCalendar отрендерится
  //
  // const calendarApi = calendarRef.value?.getApi?.()
  // if (calendarApi) {
  //   mapped.forEach(event => calendarApi.addEvent(event))
  // } else {
  //   console.error('calendarApi is not available')
  // }
})

const handleWeekendsToggle = () => {
  calendarOptions.value.weekends = !calendarOptions.value.weekends
}

const handleDateSelect = (selectInfo: DateSelectArg) => {
  console.log(selectInfo, 'selectInfo')
  selectedRange.value = selectInfo
  isModalOpen.value = true
}

const handleModalSubmit = async (formData: EventData) => {
  console.log(formData, 'formData')
  await postEvent(formData);
  const calendarApi = selectedRange.value!.view.calendar;
  calendarApi.unselect();

  calendarApi.addEvent({
    id: createEventId(),
    title: formData.title,
    start: selectedRange.value!.startStr,
    end: selectedRange.value!.endStr,
    extendedProps: {
      price: formData.price,
      description: formData.description
    },
    allDay: selectedRange.value!.allDay
  });

  isModalOpen.value = false
}

// const handleDateSelect = (selectInfo) => {
//   console.log(selectInfo, 'selectInfo')
//   const title = prompt('Please enter a new title for your event')
//   const calendarApi = selectInfo.view.calendar
//
//   calendarApi.unselect()
//
//   if (title) {
//     calendarApi.addEvent({
//       id: createEventId(),
//       title,
//       start: selectInfo.startStr,
//       end: selectInfo.endStr,
//       allDay: selectInfo.allDay
//     })
//   }
// }

const handleEventClick = (clickInfo: EventClickArg) => {
  if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    clickInfo.event.remove()
  }
}

const handleEvents = (events: EventApi[]) => {
  currentEvents.value = events
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
      info: { start: Date; end: Date; startStr: string; endStr: string; timeZone: string },
      successCallback: (events: EventInput[]) => void,
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
    console.log(info, 'info')
    try {
      const events = await getEvents(
          formatDate(info.start),
          formatDate(info.end)
      );
      const mapped: EventInput[] = events.map((e: EventData) => ({
        id: e.id?.toString() || createEventId(),
        title: e.title,
        start: `${e.date}T${e.time_start}`,
        end: `${e.date}T${e.time_end}`,
        extendedProps: { price: e.price, description: e.description }
      }))
      successCallback(mapped)
    } catch (error) {
      console.error("Error fetching events:", error)
      failureCallback(error)
    }
  }
});
</script>

<template>
  <div class="demo-app">
    <div class="demo-app-sidebar">
      <div class="demo-app-sidebar-section">
        <h2>Instructions</h2>
        <ul>
          <li>Select dates and you will be prompted to create a new event</li>
          <li>Drag, drop, and resize events</li>
          <li>Click an event to delete it</li>
        </ul>
      </div>
      <div class="demo-app-sidebar-section">
        <label>
          <input
              type="checkbox"
              :checked="calendarOptions.weekends"
              @change="handleWeekendsToggle"
          />
          toggle weekends
        </label>
      </div>
      <div class="demo-app-sidebar-section">
        <h2>All Events ({{ currentEvents.length }})</h2>
        <ul>
          <li v-for="event in currentEvents" :key="event.id">
            <b>{{ event.startStr }}</b>
            <i>{{ event.title }}</i>
          </li>
        </ul>
      </div>
    </div>
    <div class="demo-app-main">
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
    </div>
  </div>
  <ScheduleFormModal
      v-model="isModalOpen"
      :start="selectedRange?.startStr"
      :end="selectedRange?.endStr"
      @submit="handleModalSubmit"
  />
</template>

<style scoped>
h2 {
  margin: 0;
  font-size: 16px;
}
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
.demo-app {
  display: flex;
  min-height: 100%;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}
.demo-app-sidebar {
  width: 300px;
  line-height: 1.5;
  background: #eaf9ff;
  border-right: 1px solid #d3e2e8;
}
.demo-app-sidebar-section {
  padding: 2em;
}
.demo-app-main {
  flex-grow: 1;
  padding: 3em;
}
.fc {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
