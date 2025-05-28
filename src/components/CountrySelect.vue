<script setup>
import { ref, computed } from 'vue';
import { useCountryStore } from '@/store/countries';

const store = useCountryStore();
const search = ref('');

// Filtered cities based on search query
const filteredCities = computed(() => {
  const query = search.value.trim().toLowerCase();
  const cities = store.cities.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  if (!query) return cities.slice(0, 50); // Show up to 50 cities when empty
  return cities
      .filter(city =>
          city.name.toLowerCase().includes(query) ||
          city.country.toLowerCase().includes(query)
      )
      .slice(0, 10); // Limit to 10 results when searching
});

// Select a city and update search input
function selectCity(city) {
  search.value = `${city.name}, ${city.country} (${city.timezone})`;
  // Optionally emit the selected city for parent component
  // emit('select-city', city);
}
</script>

<template>
  <div class="city-select">
    <input
        v-model="search"
        type="text"
        placeholder="Введите город или страну..."
        class="form-control"
    />
    <div v-if="store.loading" class="mt-1">Loading cities...</div>
    <div v-else-if="store.error" class="mt-1 text-danger">Error: {{ store.error }}</div>
    <ul v-else-if="filteredCities.length" class="list-group mt-1">
      <li
          v-for="city in filteredCities"
          :key="city.id"
          @click="selectCity(city)"
          class="list-group-item list-group-item-action"
      >
        {{ city.name }}, {{ city.country }} ({{ city.timezone }})
      </li>
    </ul>
    <div v-else class="mt-1">No cities found</div>
  </div>
</template>

<style scoped>
.city-select {
  position: relative;
  max-width: 300px;
}

.list-group {
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  position: absolute;
  width: 100%;
}

.text-danger {
  color: red;
}
</style>
