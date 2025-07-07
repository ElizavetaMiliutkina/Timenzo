<template>
  <q-card flat class="time-picker-card">
    <q-card-section>
      <div class="time-display">
        <q-btn flat label="Local Time" @click="toggleTimeZone" />
        <span class="time">{{ localTime }}</span>
      </div>
      <div class="slider-container">
        <div class="top-labels">
          <span v-for="hour in hours" :key="hour" class="label">{{ hour }}</span>
        </div>
        <q-slider
            v-model="selectedHour"
            :min="0"
            :max="23"
            :step="1"
            color="primary"
            track-color="grey-4"
            class="hour-slider"
            @input="updateTimes"
        />
        <div class="bottom-labels">
          <span v-for="hour in gmtHours" :key="hour" class="label">{{ hour }}</span>
        </div>
      </div>
      <div class="time-display">
        <q-btn flat label="GMT +2:00" @click="toggleTimeZone" />
        <span class="time">{{ gmtTime }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { DateTime } from 'luxon';

export default defineComponent({
  name: 'TimePicker',
  setup() {
    const selectedHour = ref(20); // Default to 8 PM (local time 11:05 PM adjusted)
    const offset = 2; // GMT +2:00

    const hours = computed(() => Array.from({ length: 24 }, (_, i) => i));
    const gmtHours = computed(() => {
      return hours.value.map(h => (h + offset) % 24);
    });

    const localTime = computed(() => {
      const now = DateTime.local().set({ hour: selectedHour.value, minute: 0, second: 0 });
      return now.toFormat('hh:mm a');
    });

    const gmtTime = computed(() => {
      const now = DateTime.local().set({ hour: selectedHour.value, minute: 0, second: 0 }).setZone(`UTC+${offset}`);
      return now.toFormat('hh:mm a');
    });

    const updateTimes = () => {
      // Ensure times update on slider change
    };

    const toggleTimeZone = () => {
      // Add logic to switch between time zones if needed
    };

    return { selectedHour, hours, gmtHours, localTime, gmtTime, updateTimes, toggleTimeZone };
  },
});
</script>

<style scoped>
.time-picker-card {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  color: white;
  padding: 20px;
}
.time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.time {
  font-size: 2em;
  font-weight: bold;
}
.slider-container {
  position: relative;
  margin: 20px 0;
}
.hour-slider {
  margin: 0;
  padding: 0;
}
.top-labels, .bottom-labels {
  display: flex;
  justify-content: space-between;
  //position: absolute;
  width: 100%;
  //top: -20px;
  //bottom: -20px;
}
.top-labels .label, .bottom-labels .label {
  font-size: 0.8em;
  color: #ccc;
}
.top-labels {
  top: -25px;
}
.bottom-labels {
  bottom: -25px;
}
</style>
