<script setup lang="ts">
import { defineProps } from 'vue'
import { EventApi } from "@fullcalendar/core";
import { completeEvent } from "@/services/calendar";
import { format, parseISO } from 'date-fns'

defineProps<{
  title: String,
  events: EventApi[],
}>()

const completeEv = async (id: string) => {
   await completeEvent(id)
}

</script>

<template>
  <div>
    <h2>All Events ({{ events.length }})</h2>

    <div v-for="event in events" :key="event.id" class="calendar-card">
      <div class="calendar-card__header">
        <div>{{ event.title }}</div>
        <div>{{ format(parseISO(event.startStr), 'dd.MM') }} - {{ format(parseISO(event.startStr), 'HH:mm') }}</div>
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
