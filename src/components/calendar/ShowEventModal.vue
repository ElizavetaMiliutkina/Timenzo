<script setup lang="ts">
import {defineEmits, defineProps, ref, watch} from "vue";
import { EventData } from "@/types/calendar";
import { DateTime } from 'luxon';

const props = defineProps<{
  modelValue: boolean;
  event: EventData | null;
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

watch(() => props.modelValue, val => {
  isOpen.value = val
})

function closeModal() {
  emit('update:modelValue', false)
}

const formatTime = (date: string) => {
  return DateTime.fromISO(date).toFormat('dd/MM/yy HH:mm')
}
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card v-if="event" style="min-width: 400px; padding: 24px">
      <div> {{ event.title }}</div>
      <div> {{ formatTime(event.start) }} - {{formatTime(event.end)}}</div>
      <div> Price: {{event.extendedProps.price}}</div>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeModal" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>

</style>
