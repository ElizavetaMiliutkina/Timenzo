<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { useCalendarStore } from '@/store/calendar'

const calendarStore = useCalendarStore()

const completeEv = async (id: string) => {
  const response = await calendarStore.completeEvent(id)
  if (response) {
    await calendarStore.reloadEvents()
  }
}
const deleteEv = async (id: string) => {
  const response = await calendarStore.deleteEvent(id)
  if (response) {
    await calendarStore.reloadEvents()
  }
}

</script>

<template>
  <div class="event-card">
    <h2 class="event-card__header">
      All Events ({{ calendarStore.periodEvents.length }})
    </h2>
    <div class="event-card__list">
      <div
        v-for="event in calendarStore.periodEvents"
        :key="event.id"
        class="calendar-card"
      >
        <div class="calendar-card__header">
          <div>{{ event.title }}</div>
          <div>{{ format(parseISO(event.start), 'dd.MM') }} - {{ format(parseISO(event.start), 'HH:mm') }}</div>
        </div>
        <div class="calendar-card__body">
          <div>{{ event.extendedProps.description }}</div>
        </div>
        <div class="calendar-card__footer">
          <q-btn
            color="primary"
            @click="completeEv(event.id)"
          >
            Complete
          </q-btn>
          <q-btn
            color="red"
            @click="deleteEv(event.id)"
          >
            Delete
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.event-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.event-card__header {
  flex-shrink: 0;
  margin: 0 0 1rem 0;
}

.event-card__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

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
  &__footer {
    display: flex;
    justify-content: space-between;
  }
}
</style>
