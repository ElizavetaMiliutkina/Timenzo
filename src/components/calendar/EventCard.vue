<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { useCalendarStore } from '@/store/calendar'

const calendarStore = useCalendarStore()

const filteredEvents = computed(() => {
  const now = new Date()
  return calendarStore.events.filter(event => {
    const end = event.end ?? event.start
    const completed = event.extendedProps?.completed
    if (!end) return false
    return new Date(end) <= now && completed === false
  })
})

const completeEv = async (id: string) => {
  const response = await calendarStore.completeEvent(id)
  if (response) {
    await calendarStore.reloadEvents()
  }
}

</script>

<template>
  <div>
    <h2>All Events ({{ filteredEvents.length }})</h2>

    <div v-for="event in filteredEvents" :key="event.id" class="calendar-card">
      <div class="calendar-card__header">
        <div>{{ event.title }}</div>
        <div>{{ format(parseISO(event.start), 'dd.MM') }} - {{ format(parseISO(event.start), 'HH:mm') }}</div>
      </div>
      <div class="calendar-card__body">
        <div>{{ event.extendedProps.description }}</div>
      </div>
      <div class="calendar-card__footer">
        <q-btn color="primary" @click="completeEv(event.id)"> Complete </q-btn>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.calendar-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
  &__header {
    display: flex;
    justify-content: space-between;
  }
}
</style>
