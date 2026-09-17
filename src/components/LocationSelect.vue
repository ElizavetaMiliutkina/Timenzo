<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { getLocations } from "@/services/dictionaries";
import debounce from 'lodash/debounce'
import type {LocationOption} from "@/types/location"

const props = defineProps<{
  modelValue: LocationOption | null
  required?: boolean
  disable?: boolean
  minimal?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref<string>('');
const locationSuggestions = ref<LocationOption[]>([]);
const selectedLocation = ref<LocationOption | null>(null);

watch(
    () => props.modelValue,
    (val) => {
      selectedLocation.value = val
    },
    { immediate: true }
)

const fetchLocations = debounce(async (query: string) => {
  if (query.length < 2) {
    locationSuggestions.value = [];
    return;
  }
  try {
    const response = await getLocations(query);
    locationSuggestions.value = response as LocationOption[] || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    locationSuggestions.value = [];
  }
}, 300);

async function onFilter(val: string, update: (cb: () => void) => void) {
  searchQuery.value = val
  await fetchLocations(val)
  update(() => {})
}

function onSelect(val: LocationOption | null) {
  selectedLocation.value = val
  emit('update:modelValue', val);
}

const locationRules = computed(() => {
  if (!props.required) return []
  return [(val: LocationOption | null) => !!val || 'Enter your city']
})

const selectRef = ref<{ focus: () => void } | null>(null)

defineExpose({
  focus: () => selectRef.value?.focus(),
})
</script>

<template>
  <div>
    <q-select
      ref="selectRef"
      v-model="selectedLocation"
      use-input
      clearable
      input-debounce="0"
      :options="locationSuggestions"
      :rules="locationRules"
      :disable="disable"
      option-label="label"
      option-value="value"
      :label="minimal ? undefined : (!props.required ? 'Enter your city...' : 'Enter your city... *')"
      :square="!minimal"
      :filled="!minimal"
      :borderless="minimal"
      :dense="minimal"
      @filter="onFilter"
      @update:model-value="onSelect"
    />
  </div>
</template>

<style lang='css'>

</style>
