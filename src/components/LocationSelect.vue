<script setup lang="ts">
import { ref } from 'vue';
import { getLocations } from "@/services/dictionaries";
import debounce from 'lodash/debounce'
import type {LocationOption} from "@/types/location"

const props = defineProps<{
  modelValue: LocationOption | null
}>()

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref<string>('');
const locationSuggestions = ref<LocationOption[]>([]);
const selectedLocation = ref<LocationOption | null>(null);

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

function onSelect(val: LocationOption) {
  selectedLocation.value = val
  emit('update:modelValue', val);
}
</script>

<template>
  <div>
    <q-select
      v-model="selectedLocation"
      use-input
      input-debounce="0"
      :options="locationSuggestions"
      :rules="[val => !!val || 'Enter your city']"
      option-label="label"
      option-value="value"
      label="Enter your city... *"
      square
      filled
      @filter="onFilter"
      @update:model-value="onSelect"
    />
  </div>
</template>

<style lang='css'>

</style>
