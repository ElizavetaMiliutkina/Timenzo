<script setup lang="ts">
import { defineEmits, defineProps, computed } from "vue";
import { EventData } from "@/types/calendar";
import { DateTime } from 'luxon';
import { storeToRefs } from "pinia";
import {useDictionariesStore} from "@/store/dictionaries";
import { useSettingsStore } from "@/store/settings";
import {Currency} from "@/types/dictionaries";
import { toZoneParts } from "@/utils/datetimeZone";

const props = defineProps<{
  modelValue: boolean;
  event: EventData | null;
}>()

const emit = defineEmits(['update:modelValue', 'edit', 'unselect', 'delete'])

const dialogModel = computed({
  get: () => props.modelValue,
  set: (v: boolean) => {
    if (!v) {
      emit('unselect')
      emit('update:modelValue', false)
    } else {
      emit('update:modelValue', true)
    }
  },
})

const dictionariesStore = useDictionariesStore()
const { currencies } = storeToRefs(dictionariesStore)
const settingsStore = useSettingsStore()
const { resolvedTimezone: userTimezone } = storeToRefs(settingsStore)

dictionariesStore.fetchCurrencies()

function closeModal() {
  dialogModel.value = false
}

const formatTime = (iso: string) => {
  return DateTime.fromISO(iso, { zone: 'utc' })
    .setZone(userTimezone.value)
    .toFormat('dd/MM/yy HH:mm')
}

const EditEvent = () => {
  if (!props.event) return

  const start = toZoneParts(props.event.start, userTimezone.value)
  const end = toZoneParts(props.event.end, userTimezone.value)

  emit('edit', {
    title: props.event.title,
    description: props.event.extendedProps.description,
    price: props.event.extendedProps.price,
    currency_id: props.event.extendedProps.currency_id,
    student: props.event.extendedProps.student,
    timezone:
      props.event.extendedProps.student?.timezone
      ?? props.event.extendedProps.timezone,
    date_start: start.date,
    date_end: end.date,
    time_start: start.time,
    time_end: end.time,
  }, props.event.id)
}
</script>

<template>
  <q-dialog v-model="dialogModel">
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
        Price: {{ event.extendedProps.price }} {{ currencies.find((currency: Currency)=> currency.id === event?.extendedProps.currency_id)?.symbol }}
      </div>
      <q-card-actions align="right">
        <q-btn
          label="Cancel"
          color="grey"
          @click="closeModal"
        />
        <q-btn
          label="Delete"
          color="red"
          @click="() => {
            emit('delete', event?.id)
          }"
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
