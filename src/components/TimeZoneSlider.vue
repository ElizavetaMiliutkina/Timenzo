<template>
  <q-card flat class="time-picker">
    <q-card-section>
      <div class="time-picker__display">
        <q-btn flat label="Local Time" />
        <span class="time">{{ localTimeDisplay }}</span>
      </div>

      <div
          ref="scrollWrapper"
          class="time-picker__scroll-wrapper custom-scrollbar"
          @scroll="onScroll"
      >
        <div ref="scrollTrack" class="scroll-track">
          <div
              v-for="(label, index) in timeLabels"
              :key="index"
              class="tick"
              :class="{ active: index === selectedIndex }"
              @click="scrollToIndex(index)"
          >
            <div class="tick-label">{{ label }}</div>
            <div class="line" />
            <div class="tick-label">{{ timeLabelsGmt[index] }}</div>
          </div>
        </div>
      </div>

      <div class="time-picker__display">
        <q-btn flat label="GMT +2:00" />
        <span class="time">{{ gmtTimeDisplay }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, defineProps, defineEmits, watch} from 'vue';
import { DateTime } from 'luxon';
import { debounce } from 'lodash';

const props  = defineProps({
  time: String,
  slot: {
    type: Number,
    default: 0.5,
  },
})

const emit = defineEmits(['selectedTime'])

const scrollWrapper = ref<HTMLElement | null>(null);
const scrollTrack = ref<HTMLElement | null>(null);

const offset = 2;
const selectedIndex = ref(13);
const isInitialized = ref(false);

const getTimeIndex = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const slotMinutes = props.slot * 60;
  return Math.round(totalMinutes / slotMinutes);
}

const timeLabels = computed(() => {
  const slotMinutes = props.slot * 60;
  const totalSlots = Math.floor(24 * 60 / slotMinutes); // Total slots in a day
  return Array.from({ length: totalSlots }, (_, i) => {
    const minutes = i * slotMinutes;
    return DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('hh:mm');
  });
});

const timeLabelsGmt = computed(() => {
  const slotMinutes = props.slot * 60;
  const totalSlots = Math.floor(24 * 60 / slotMinutes);
  return Array.from({ length: totalSlots }, (_, i) => {
    const minutes = i * slotMinutes + offset * 60;
    return DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('hh:mm');
  });
});

const localTimeDisplay = computed(() => {
  const minutes = selectedIndex.value * props.slot * 60;
  return DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('hh:mm a');
});

watch(
    selectedIndex, debounce((val) => {
      const minutes = val * props.slot * 60;
      const time = DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('HH:mm');
      emit('selectedTime', time);
    }, 300)
)
const gmtTimeDisplay = computed(() => {
  const minutes = selectedIndex.value * props.slot * 60 + offset * 60;
  return DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('hh:mm a');
});

//Select time by click
const scrollToIndex = (index: number) => {
  if (!scrollWrapper.value || !scrollTrack.value) return;
  const el = scrollTrack.value.children[index] as HTMLElement;
  el.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  selectedIndex.value = index;
};

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

onMounted( async () => {
  console.log(!!props.time)
  setTimeout(async () => {
    const currentTime = props.time && props.time.trim() !== ''
        ? props.time
        : DateTime.local().toFormat('HH:mm');
    selectedIndex.value = await getTimeIndex(currentTime)
    if (!scrollWrapper.value || !scrollTrack.value) return;
    const el = scrollTrack.value.children[selectedIndex.value] as HTMLElement;
    el.scrollIntoView({ inline: 'center', behavior: 'smooth' });

    setTimeout(() => {
      isInitialized.value = true;
    }, 300);
  }, 100);
});
</script>

<style scoped lang="scss">
@import '@/styles/custom-scrollbar.scss';

.time-picker {
  //background: #0f1b28;
  //color: white;
  background: #e0e0e061;
  color: #000000;
  border-radius: 16px;

  &__display {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .time {
      font-size: 2em;
      font-weight: bold;
    }
  }

  &__scroll-wrapper {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    display: flex;
    align-items: center;
    height: 180px;

    .scroll-track {
      display: flex;
      gap: 32px;
      padding: 0 50vw;

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
        cursor: pointer;
        user-select: none;
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
    }
  }
}

</style>
