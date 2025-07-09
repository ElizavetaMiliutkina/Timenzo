<template>
  <q-card flat class="time-picker-card">
    <q-card-section>
      <div class="time-display">
        <q-btn flat label="Local Time" />
        <span class="time">{{ localTimeDisplay }}</span>
      </div>

      <div ref="scrollWrapper" class="scroll-wrapper" @scroll="onScroll">
        <div ref="scrollTrack" class="scroll-track">
          <div
              v-for="(label, index) in timeLabels"
              :key="index"
              class="tick"
              :class="{ active: index === selectedIndex }"
          >
            <div class="tick-label">{{ label }}</div>
            <div class="line" />
            <div class="tick-label">{{ timeLabelsGmt[index] }}</div>
          </div>
        </div>
      </div>

      <div class="time-display">
        <q-btn flat label="GMT +2:00" />
        <span class="time">{{ gmtTimeDisplay }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { DateTime } from 'luxon';

const offset = 2;
const selectedIndex = ref(16);
const scrollWrapper = ref<HTMLElement | null>(null);
const scrollTrack = ref<HTMLElement | null>(null);

const isInitialized = ref(false);

const timeLabels = computed(() => {
  return Array.from({ length: 48 }, (_, i) => {
    const minutes = i * 30;
    return DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('hh:mm');
  });
});

const timeLabelsGmt = computed(() => {
  return Array.from({ length: 48 }, (_, i) => {
    const minutes = i * 30 + offset * 60;
    return DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('hh:mm');
  });
});

const localTimeDisplay = computed(() => {
  const minutes = selectedIndex.value * 30;
  return DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('hh:mm a');
});

const gmtTimeDisplay = computed(() => {
  const minutes = selectedIndex.value * 30 + offset * 60;
  return DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('hh:mm a');
});


const onScroll = () => {
  if (!scrollWrapper.value || !scrollTrack.value || !isInitialized.value) return;

  const wrapperRect = scrollWrapper.value.getBoundingClientRect();
  const children = scrollTrack.value.children;

  let closestIndex = 0;
  let closestDist = Infinity;

  for (let i = 0; i < children.length; i++) {
    const rect = children[i].getBoundingClientRect();
    const dist = Math.abs(rect.left + rect.width / 2 - wrapperRect.left - wrapperRect.width / 2);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  }

  selectedIndex.value = closestIndex;
}

onMounted(() => {
  setTimeout(() => {
    if (!scrollWrapper.value || !scrollTrack.value) return;
    const el = scrollTrack.value.children[selectedIndex.value] as HTMLElement;
    el.scrollIntoView({ inline: 'center', behavior: 'smooth' });

    setTimeout(() => {
      isInitialized.value = true;
    }, 300);
  }, 100);
});
</script>

<style scoped>
.time-picker-card {
  background: #0f1b28;
  color: white;
  border-radius: 16px;
}

.time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time {
  font-size: 2em;
  font-weight: bold;
}

.scroll-wrapper {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  display: flex;
  align-items: center;
  height: 180px;
}

.scroll-track {
  display: flex;
  gap: 32px;
  padding: 0 50vw;
}

.tick {
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.4;
  padding: 11px 0;
  transition: transform 0.2s, opacity 0.2s, padding 0.2s, border 0.3s, box-shadow 0.3s;
  border-radius: 24px;
  min-width: 50px;
}

.tick.active {
  transform: scale(1.5);
  opacity: 1;
  border: 1px solid #00d4ff;
  box-shadow: 0 0 10px;
}

.line {
  height: 32px;
  width: 2px;
  background-color: #00d4ff;
  margin-bottom: 4px;
}

.tick-label {
  font-size: 0.8em;
}
</style>
