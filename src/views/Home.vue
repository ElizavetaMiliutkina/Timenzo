<script setup>
import { ref, onMounted } from 'vue';
import { getCities, getLocations } from "@/services/dictionaries.js";
import debounce from 'lodash/debounce'

const searchQuery = ref('');
const locationSuggestions = ref([]);
const selectedLocation = ref(null);

onMounted(async () => {});

const citiesList = async () => {
  try {
    const response = getCities()
    if(response){
      console.log(response, 'response')
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

const fetchLocations = debounce(async (query) => {
  if (query.length < 2) {
    locationSuggestions.value = [];
    return;
  }
  try {
    const res = await getLocations(query);
    locationSuggestions.value = res.data || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    locationSuggestions.value = [];
  }
}, 300);

function onInputChange(val) {
  searchQuery.value = val;
  fetchLocations(val);
}

function selectLocation(loc) {
  selectedLocation.value = loc;
  searchQuery.value = `${loc.label}`;
  locationSuggestions.value = [];
}
</script>

<template>
  <div>
    <button type="submit" class="btn btn-primary" @click="citiesList">Submit</button>

    <div class="autocomplete-container">
      <input
          v-model="searchQuery"
          @input="onInputChange($event.target.value)"
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
