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
import {postEvent, getEvents} from "@/services/calendar";
import { EventData, CalendarEvent } from "@/types/calendar";
import EventCard from "@/components/calendar/EventCard.vue";
import LineGraph from "@/components/graphs/LineGraph.vue";

const currentEvents = ref<any[]>([]);
const isModalOpen = ref(false);
const selectedRange = ref<DateSelectArg | null>(null);

const calendarRef = ref<any>(null)
const tab = ref('schedule')

const formatDate = (date: Date) =>
    date.toISOString().slice(0, 10);


const handleWeekendsToggle = () => {
  calendarOptions.value.weekends = !calendarOptions.value.weekends
}

const handleDateSelect = (selectInfo: DateSelectArg) => {
  selectedRange.value = selectInfo
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
  if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    clickInfo.event.remove()
  }
}

const handleEvents = (events: EventApi[]) => {
  const now = new Date();

  currentEvents.value = events.filter(event => {
    const end = event.end || event.start
    const completed = event.extendedProps?.completed
    if (!end) return false;
    return new Date(end) <= now && completed === false
  })
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
      const events = await getEvents(
          formatDate(info.start),
          formatDate(info.end)
      );
      successCallback(events)
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
<!--      <div class="demo-app-sidebar-section">-->
<!--        <h2>Instructions</h2>-->
<!--        <ul>-->
<!--          <li>Select dates and you will be prompted to create a new event</li>-->
<!--          <li>Drag, drop, and resize events</li>-->
<!--          <li>Click an event to delete it</li>-->
<!--        </ul>-->
<!--      </div>-->
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
      <event-card
          title="All Events"
          :events="currentEvents"
      />
    </div>
    <div class="demo-app-main">
      <q-tabs
          v-model="tab"
          dense
          align="left"
          class="text-primary"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
      >
        <q-tab name="schedule" label="Schedule" />
        <q-tab name="graph" label="Income Graph" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="schedule">
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
        </q-tab-panel>

        <q-tab-panel name="graph">
          <line-graph />
        </q-tab-panel>
      </q-tab-panels>
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
  padding: 2em;
  width: 300px;
  line-height: 1.5;
  background: #eaf9ff;
  border-right: 1px solid #d3e2e8;
}

.demo-app-main {
  flex-grow: 1;
  padding: 3em;
}
</style>
