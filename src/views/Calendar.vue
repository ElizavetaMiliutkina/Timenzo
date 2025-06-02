<script setup>
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { INITIAL_EVENTS, createEventId } from '../utils/event-utils.js'
import ScheduleFormModal from "@/components/calendar/ScheduleFormModal.vue";
import {postEvent} from "@/services/calendar.js";

const currentEvents = ref([])

const handleWeekendsToggle = () => {
  calendarOptions.value.weekends = !calendarOptions.value.weekends
}

const isModalOpen = ref(false)
const selectedRange = ref(null)

const handleDateSelect = (selectInfo) => {
  selectedRange.value = selectInfo
  isModalOpen.value = true
}

const handleModalSubmit = async (formData) => {
  console.log(formData, 'formData')
  await postEvent(formData)
  const calendarApi = selectedRange.value.view.calendar
  calendarApi.unselect()

  calendarApi.addEvent({
    id: createEventId(),
    title: formData.title,
    start: selectedRange.value.startStr,
    end: selectedRange.value.endStr,
    extendedProps: {
      price: formData.price,
      description: formData.description
    },
    allDay: selectedRange.value.allDay
  })

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

const handleEventClick = (clickInfo) => {
  if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    clickInfo.event.remove()
  }
}

const handleEvents = (events) => {
  currentEvents.value = events
}

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  initialView: 'dayGridMonth',
  initialEvents: INITIAL_EVENTS,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents
})
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
