<template>
  <q-card flat class="time-picker-card">
    <q-card-section>
      <div class="time-display">
        <q-btn flat label="Local Time" @click="toggleTimeZone" />
        <span class="time">{{ localTime }}</span>
      </div>
      <div class="slider-container">
        <div class="dial-lines">
          <span v-for="hour in 48" :key="hour" class="dial-line" />
        </div>

        <div class="top-labels">
          <span v-for="(label, index) in hourLabels" :key="'local-' + index" class="label">{{ label }}</span>
        </div>
        <q-slider
            v-model="selectedHour"
            :min="0"
            :max="47"
            :step="1"
            color="primary"
            track-color="grey-4"
            class="hour-slider"
            @input="updateTimes"
        />

        <div class="bottom-labels">
          <span v-for="(label, index) in gmtHourLabels" :key="'gmt-' + index" class="label">{{ label }}</span>
        </div>
      </div>
      <div class="time-display">
        <q-btn flat label="GMT +2:00" @click="toggleTimeZone" />
        <span class="time">{{ gmtTime }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { DateTime } from 'luxon';

    const selectedHour = ref(12); // Default to 8 PM (local time 11:05 PM adjusted)
    const offset = 2; // GMT +2:00

    const hours = computed(() => Array.from({ length: 24 }, (_, i) => i));
    const gmtHours = computed(() => {
      return hours.value.map(h => (h + offset) % 24);
    });

    const localTime = computed(() => {
      return DateTime.fromObject({ hour: 0, minute: 0 })
          .plus({ minutes: selectedHour.value * 30 })
          .toFormat('hh:mm a');
    });

    const gmtTime = computed(() => {
      return DateTime.fromObject({ hour: 0, minute: 0 })
          .plus({ minutes: selectedHour.value * 30 + offset * 60 })
          .toFormat('hh:mm a');
    });

    const hourLabels = computed(() => {
      return hours.value.map(h => formatHourAndMinutes(h, 0));
    });

    const gmtHourLabels = computed(() => {
      return hours.value.map(h => {
        const gmtHour = (h + offset) % 24;
        return formatHourAndMinutes(gmtHour, 0);
      });
    });

    function formatHourAndMinutes(hour: number, minute = 0): string {
      return DateTime.fromObject({ hour, minute }).toFormat('hh');
    }
    const updateTimes = () => {
      // Ensure times update on slider change
    };

    const toggleTimeZone = () => {
      // Add logic to switch between time zones if needed
    };
</script>

<style>
.time-picker-card {
  background: rgb(17 69 104 / 50%);
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
  width: 100%;
  margin-left: -5px;
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
.dial-lines {
  position: absolute;
  top: 18px; /* подогнать по высоте слайдера */
  left: 0;
  right: 0;
  height: 30px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 0;
}

.dial-line {
  width: 1px;
  height: 30px;
  background-color: white;
  opacity: 0.5;
}

.q-slider__thumb-shape {
  display: none !important;
}

.q-slider__thumb {
  width: 30px!important;
  height: 80px!important;
  border: 2px solid #1976d2;
  border-radius: 13%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

</style>
