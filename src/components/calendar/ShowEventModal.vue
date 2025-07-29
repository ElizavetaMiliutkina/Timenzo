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
  console.log(date, ';date')
  return DateTime.fromISO(date).toFormat('dd/MM/yy HH:mm')
}

const EditEvent = () => {
 console.log(props.event, 'EventData')
}

</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card v-if="event" class="card-info">
      <div class="card-info__title"> {{ event.title }}</div>
      <div class="card-info__date-interval"> {{ formatTime(event.start) }} - {{formatTime(event.end)}}</div>
      <div class="card-info__price"> Price: {{event.extendedProps.price}}</div>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeModal" />
        <q-btn label="Edit" color="primary" @click="EditEvent" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.card-info {
  min-width: 400px;
  padding: 24px
}
</style>
