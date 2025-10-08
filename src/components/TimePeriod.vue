<script setup lang="ts">
import {defineProps, ref, watch, computed} from "vue";

const emit = defineEmits(['update:duration','update:valid'])

interface TimePeriod {
  days: number;
  hours: number;
  minutes: number;
}

const props = defineProps<{
  modelValue: TimePeriod
}>()

const form = ref<TimePeriod>({
  days: 0,
  hours: 1,
  minutes: 0,
})

const isValid = computed(() => {
  return form.value.days > 0 || form.value.hours > 0 || form.value.minutes > 0;
});

form.value = props.modelValue

watch(form, () => {
  validateForm()
  emit('update:duration', { ...form.value })
  console.log(isValid.value, 'isValid.value')
  emit('update:valid', isValid.value);
}, { deep: true })

const validateForm = () => {
  if (form.value.days < 0 || isNaN(form.value.days)) form.value.days = 0;
  if (form.value.hours < 0 || isNaN(form.value.hours)) form.value.hours = 0;
  if (form.value.hours > 23) form.value.hours = 23;
  if (form.value.minutes < 0 || isNaN(form.value.minutes)) form.value.minutes = 0;
  if (form.value.minutes > 59) form.value.minutes = 59;
};
</script>

<template>
  <div>
    <div class="time-period">
      <q-input
        v-model.number="form.days"
        label="Days"
        type="number"
        :min="0"
        :max="42"
        dense
        outlined
        :error="!isValid"
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
        :error="!isValid"
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
        :error="!isValid"
        @update:model-value="validateForm"
      />
    </div>
    <div
      v-if="!isValid"
      class="error-message"
    >
      At least one field (Days, Hours, Minutes) must be greater than 0
    </div>
  </div>
</template>

<style scoped>
.time-period{
  display: flex;
  justify-content: flex-start;
  gap: 20px;
}
</style>
