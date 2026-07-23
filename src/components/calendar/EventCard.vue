<script setup lang="ts">
import { DateTime } from 'luxon'
import { useCalendarStore } from '@/store/calendar'
import { useSettingsStore } from '@/store/settings'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBusyIds } from '@/composables/useBusyAction'

const calendarStore = useCalendarStore()
const settingsStore = useSettingsStore()
const { resolvedTimezone: userTimezone } = storeToRefs(settingsStore)
const { isBusy, runFor } = useBusyIds()

function eventInZone(iso: string) {
  return DateTime.fromISO(iso, { zone: 'utc' }).setZone(userTimezone.value)
}

const todayEvents = computed(() => {
  const today = DateTime.now().setZone(userTimezone.value).toISODate()
  return calendarStore.periodEvents.filter(
    (event) => eventInZone(event.start).toISODate() === today
  )
})

function formatEventDay(iso: string) {
  return eventInZone(iso).toFormat('dd.MM')
}

function formatEventTime(iso: string) {
  return eventInZone(iso).toFormat('HH:mm')
}

const completeEv = async (id: string) => {
  await runFor(`complete:${id}`, async () => {
    const response = await calendarStore.completeEvent(id)
    if (response) {
      await calendarStore.reloadEvents()
    }
  })
}
const deleteEv = async (id: string) => {
  await runFor(`delete:${id}`, async () => {
    await calendarStore.deleteEvent(id)
  })
}
</script>

<template>
  <div class="event-card">
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
            <div>{{ formatEventDay(event.start) }} - {{ formatEventTime(event.start) }}</div>
          </div>
          <div class="calendar-card__body">
            <div>{{ event.extendedProps.description }}</div>
          </div>
          <div class="calendar-card__footer">
            <q-btn
              color="primary"
              :loading="isBusy(`complete:${event.id}`)"
              :disable="isBusy(`complete:${event.id}`) || isBusy(`delete:${event.id}`)"
              @click="completeEv(event.id)"
            >
              Complete
            </q-btn>
            <q-btn
              color="red"
              :loading="isBusy(`delete:${event.id}`)"
              :disable="isBusy(`complete:${event.id}`) || isBusy(`delete:${event.id}`)"
              @click="deleteEv(event.id)"
            >
              Delete
            </q-btn>
          </div>
        </div>
      </div>
    </div>
    <div class="event-card__bottom">
      <h2 class="event-card__header">
        Work for today
      </h2>
      <div v-if="todayEvents.length">
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
            {{ formatEventTime(event.start) }}-{{ formatEventTime(event.end) }}
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
