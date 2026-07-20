<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  eventTitle?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', payload: { weeks: number; weekdays: number[] }): void
}>()

const weeks = ref(1)
const selectedWeekdays = ref<number[]>([])

const weekOptions = [1, 2, 3, 4]

const dayOptions = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
  { value: 6, label: 'Sun' },
]

const canSave = computed(
  () => weeks.value >= 1 && selectedWeekdays.value.length > 0
)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    weeks.value = 1
    selectedWeekdays.value = []
  }
)

function toggleDay(day: number) {
  const idx = selectedWeekdays.value.indexOf(day)
  if (idx === -1) {
    selectedWeekdays.value = [...selectedWeekdays.value, day].sort()
  } else {
    selectedWeekdays.value = selectedWeekdays.value.filter((d) => d !== day)
  }
}

function close() {
  emit('update:modelValue', false)
}

function onSave() {
  if (!canSave.value) return
  emit('confirm', {
    weeks: weeks.value,
    weekdays: [...selectedWeekdays.value],
  })
  close()
}
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="spread-modal">
      <q-card-section>
        <div class="text-h6">
          Spread lesson
        </div>
        <div
          v-if="eventTitle"
          class="text-body2 text-grey-7 q-mt-xs"
        >
          {{ eventTitle }}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          Period
        </div>
        <div class="spread-modal__weeks">
          <q-btn
            v-for="w in weekOptions"
            :key="w"
            :outline="weeks !== w"
            :unelevated="weeks === w"
            color="primary"
            :label="`${w} week${w > 1 ? 's' : ''}`"
            @click="weeks = w"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          Days
        </div>
        <div class="spread-modal__days">
          <button
            v-for="day in dayOptions"
            :key="day.value"
            type="button"
            class="spread-modal__day"
            :class="{ 'spread-modal__day--active': selectedWeekdays.includes(day.value) }"
            @click="toggleDay(day.value)"
          >
            {{ day.label }}
          </button>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="close"
        />
        <q-btn
          label="Save"
          color="primary"
          :disable="!canSave"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.spread-modal {
  min-width: 360px;
}

.spread-modal__weeks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spread-modal__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.spread-modal__day {
  aspect-ratio: 1;
  border: 1px solid #cfd8dc;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #37474f;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:hover {
    border-color: #1976d2;
  }

  &--active {
    background: #1976d2;
    border-color: #1976d2;
    color: #fff;
  }
}
</style>
