<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useCalendarStore } from '@/store/calendar'
import ScheduleTab from "@/components/calendar/ScheduleTab.vue";
import EventCard from "@/components/calendar/EventCard.vue";
import GraphTab from "@/components/calendar/GraphTab.vue";
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
      <event-card
        title="All Events"
      />
    </div>
    <div class="demo-app-main">
      <q-tabs
        v-model="tab"
        dense
        align="left"
        class="text-primary q-mb-md"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
      >
        <q-tab
          name="schedule"
          label="Schedule"
        />
        <q-tab
          name="graph"
          label="Income Graph"
        />
      </q-tabs>

      <div class="calendar-tab-panels block-wrapper">
        <div
          v-show="tab === 'schedule'"
          class="calendar-tab-panels__pane"
        >
          <ScheduleTab class="" />
        </div>
        <div
          v-if="tab === 'graph'"
          class="calendar-tab-panels__pane block-wrapper"
        >
          <GraphTab class="bg-white p-2" />
        </div>
      </div>
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
  height: calc(100vh - 64px);
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}
.demo-app-sidebar {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  min-height: 0;
  max-height: calc(100vh - 64px);
  overflow: hidden;
  line-height: 1.5;
  background: white;
  border-right: 1px solid #d3e2e8;
}

.demo-app-sidebar :deep(.event-card) {
  flex: 1;
  min-height: 0;
}

.demo-app-main {
  flex-grow: 1;
  padding: 20px;
  max-height: calc(100vh - 64px);
  overflow: auto;
}
</style>
