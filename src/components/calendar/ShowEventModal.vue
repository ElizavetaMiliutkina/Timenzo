<script setup lang="ts">
import {defineEmits, defineProps, ref, watch} from "vue";
import { EventData } from "@/types/calendar";
import { DateTime } from 'luxon';
import {useDictionariesStore} from "@/store/dictionaries";
import {storeToRefs} from "pinia";
import {Currency} from "@/types/dictionaries";

const props = defineProps<{
  modelValue: boolean;
  event: EventData | null;
}>()

const emit = defineEmits(['update:modelValue', 'edit', 'unselect'])

const isOpen = ref(false)

watch(() => props.modelValue, val => {
  isOpen.value = val
})

const dictionariesStore = useDictionariesStore()
const { currencies } = storeToRefs(dictionariesStore)

dictionariesStore.fetchCurrencies()

function closeModal() {
  emit('unselect')
  emit('update:modelValue', false)
}

const formatTime = (date: string) => {
  return DateTime.fromISO(date).toFormat('dd/MM/yy HH:mm')
}

const EditEvent = () => {
  if(props.event){

    let data = {
      title: props.event.title,
      description: props.event.extendedProps.description,
      price: props.event.extendedProps.price,
      currency_id: props.event.extendedProps.currency_id,
      date_start: DateTime.fromISO(props.event.start).toFormat('yyyy-MM-dd'),
      date_end: DateTime.fromISO(props.event.end).toFormat('yyyy-MM-dd'),
      time_start: DateTime.fromISO(props.event.start).toFormat('HH:mm'),
      time_end: DateTime.fromISO(props.event.end).toFormat('HH:mm'),
    };

    emit('edit', data, props.event.id)
  }
}

</script>

<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card
      v-if="event"
      class="card-info"
    >
      <div class="card-info__title">
        {{ event.title }}
      </div>
      <div class="card-info__date-interval">
        {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
      </div>
      <div class="card-info__price">
        Price: {{ event.extendedProps.price }} {{ currencies.find((currency: Currency)=> currency.id === event.extendedProps.currency_id).symbol }}
      </div>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="closeModal"
        />
        <q-btn
          label="Edit"
          color="primary"
          @click="EditEvent"
        />
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
