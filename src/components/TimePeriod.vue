<script setup lang="ts">
import {reactive, watch} from "vue";

const emit = defineEmits(['update:duration'])

interface TimePeriod {
  days: number;
  hours: number;
  minutes: number;
}

const form = reactive<TimePeriod>({
  days: 0,
  hours: 1,
  minutes: 0,
})

watch(form, () => {
  validateForm()
  emit('update:duration', { ...form })
}, { deep: true })

const validateForm = () => {
  if (form.days < 0 || isNaN(form.days)) form.days = 0;
  if (form.hours < 0 || isNaN(form.hours)) form.hours = 0;
  if (form.hours > 23) form.hours = 23;
  if (form.minutes < 0 || isNaN(form.minutes)) form.minutes = 0;
  if (form.minutes > 59) form.minutes = 59;
};
</script>

<template>
  <div class="time-period">
    <q-input
        v-model.number="form.days"
        label="Days"
        type="number"
        :min="0"
        :max="42"
        dense
        outlined
        @update:model-value="validateForm"
   />
    <q-input
        v-model.number="form.hours"
        label="Hours"
        type="number"
        :min="0"
        :max="23"
        dense
        outlined
        @update:model-value="validateForm"
    />
    <q-input
        v-model.number="form.minutes"
        label="Minutes"
        type="number"
        :min="0"
        :max="59"
        dense
        outlined
        @update:model-value="validateForm"
    />
  </div>
</template>

<style scoped>
.time-period{
  display: flex;
  justify-content: space-between;
}
</style>
