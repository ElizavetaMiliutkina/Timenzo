<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import LineGraph from "@/components/graphs/LineGraph.vue";
import { useCalendarStore } from '@/store/calendar'
import ScheduleTab from "@/components/calendar/ScheduleTab.vue";
import EventCard from "@/components/calendar/EventCard.vue";
const calendarStore = useCalendarStore()

onMounted(async () => {
  const start = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const end = format(endOfMonth(new Date()), 'yyyy-MM-dd')
  await calendarStore.getEvents(start, end)
})

const tab = ref('schedule')


</script>

<template>
  <div class="demo-app">
    <div class="demo-app-sidebar">
      <div class="demo-app-sidebar-section">
<!--        <label>-->
<!--          <input-->
<!--              type="checkbox"-->
<!--              :checked="calendarOptions.weekends"-->
<!--              @change="handleWeekendsToggle"-->
<!--          />-->
<!--          toggle weekends-->
<!--        </label>-->
      </div>
      <event-card
          title="All Events"
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
          <ScheduleTab/>
        </q-tab-panel>

        <q-tab-panel name="graph">
          <line-graph />
        </q-tab-panel>
      </q-tab-panels>
    </div>

  </div>
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
