<script setup lang="ts">
import { startOfDay, endOfDay, format, parseISO } from 'date-fns'
import { useCalendarStore } from '@/store/calendar'
import { onMounted, ref, watch } from 'vue'
import type { EventData } from '@/types/calendar'

const calendarStore = useCalendarStore()

const todayEvents = ref<EventData[] | null>(null)

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

const getTodayEvents = async () => {
  const now = new Date()

  const start = format(startOfDay(now), "yyyy-MM-dd'T'HH:mm:ss")
  const end = format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss")
  todayEvents.value = await calendarStore.getPeriodEvents(start, end)
}

watch(() => calendarStore.periodEvents, () => {
  getTodayEvents()
})

onMounted(() => {
  getTodayEvents()
})

</script>

<template>
  <div class="event-card">
    <!-- Верх: flex:1 + min-height:0 — список скроллится, не съедая нижний блок -->
    <div class="event-card__top">
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
    <!-- Низ: всегда виден, не сжимается flex’ом -->
    <div class="event-card__bottom">
      <h2 class="event-card__header">
        Work for today
      </h2>
      <div v-if="todayEvents">
        <div
          v-for="(event, index) in todayEvents"
          :key="event.id"
        >
          <b>
            <q-badge
              color="primary"
              text-color="white"
              rounded
            >
              {{ index + 1 }}
            </q-badge>
            {{ format(event.start, 'HH:mm') }}-{{ format(event.end, 'HH:mm') }}
          </b>
          <br>
          <div class="q-ml-lg">
            <b>{{ event.extendedProps?.student?.name ?? '—' }}</b> -
            <i>{{ event.title }}</i>
          </div>

          <q-separator v-if="index !== todayEvents.length - 1" />
        </div>
      </div>
      <div v-else>
        No Work For Today
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

.event-card > div:first-of-type {
  padding: 0 2em;
}

.event-card > div:nth-of-type(2) {
  padding: 0 2em 2em 2em;
}

.event-card__top {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 0 1rem 0;
}

.event-card__bottom {
  flex-shrink: 0;
  padding-top: 1rem;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.08);
}

.event-card__header {
  font-weight: bold;
  font-size: 16px;
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
