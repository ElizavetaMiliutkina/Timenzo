<script setup lang="ts">
import { ref } from 'vue';
import { getLocations } from "@/services/dictionaries";
import debounce from 'lodash/debounce'

interface LocationOption {
  value: string;
  label: string;
}

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

function onInputChange(val: string) {
  searchQuery.value = val;
  fetchLocations(val);
}

function selectLocation(loc: LocationOption) {
  selectedLocation.value = loc;
  searchQuery.value = loc.label;
  locationSuggestions.value = [];
}
</script>

<template>
  <div>

    <div class="autocomplete-container">
      <input
          v-model="searchQuery"
          @input="onInputChange(($event.target as HTMLInputElement).value)"
          placeholder="Введите город..."
          class="input-search"
      />
      <ul v-if="locationSuggestions.length" class="suggestions-list">
        <li
            v-for="loc in locationSuggestions"
            :key="loc.value"
            @click="selectLocation(loc)"
            class="suggestion-item"
        >
          {{ loc.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang='css'>
.autocomplete-container {
  position: relative;
  width: 300px;
  margin-bottom: 1rem;
}

.input-search {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.suggestions-list {
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
  margin: 0;
  padding: 0;
}

.suggestion-item {
  padding: 8px;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f0f0f0;
}

</style>
