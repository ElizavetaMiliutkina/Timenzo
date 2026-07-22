<template>
  <q-card
    flat
    class="time-picker"
  >
    <q-card-section>
      <div
        class="time-picker__display"
        style="margin-bottom: -44px"
      >
        <q-btn
          flat
          label="Local Time"
        />
        <span class="time">{{ localTimeDisplay }}</span>
      </div>
      <div
        ref="scrollWrapper"
        class="time-picker__scroll-wrapper custom-scrollbar"
        @scroll="onScroll"
      >
        <div
          ref="scrollTrack"
          class="scroll-track"
        >
          <div
            v-for="(label, index) in timeLabels"
            :key="index"
            class="tick"
            :class="{ active: index === selectedIndex }"
            @click="scrollToIndex(index)"
          >
            <div class="tick-label">
              {{ label }}
            </div>
            <div class="line" />
            <div class="tick-label">
              {{ timeLabelsGmt[index] }}
            </div>
          </div>
        </div>
      </div>

      <div
        class="time-picker__display"
        style="margin-top: -44px"
      >
        <q-btn
          flat
          :label="gmtLabel"
        />
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
  defaultTime: {
    type: String,
    default: '00:00',
  },
  timezone: {
    type: String,
    default: '',
  },
  date: {
    type: String,
    default: '',
  },
  localTimezone: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['selectedTime'])

const scrollWrapper = ref<HTMLElement | null>(null);
const scrollTrack = ref<HTMLElement | null>(null);

const selectedIndex = ref(13);
const isInitialized = ref(false);

const localTimezoneResolved = computed(() => {
  if (props.localTimezone) {
    return props.localTimezone
  }
  return DateTime.local().zoneName
})

const studentTimezoneResolved = computed(() => props.timezone || '')
const hasStudentTimezone = computed(() => !!studentTimezoneResolved.value)

function localDateTimeAtIndex(index: number): DateTime {
  const minutes = index * props.slot * 60
  const baseDate = props.date?.trim()
      ? DateTime.fromISO(props.date, { zone: localTimezoneResolved.value })
      : DateTime.now().setZone(localTimezoneResolved.value)
  return baseDate.startOf('day').plus({ minutes })
}

const getTimeIndex = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const slotMinutes = props.slot * 60;
  return Math.round(totalMinutes / slotMinutes);
}

const timeLabels = computed(() => {
  const slotMinutes = props.slot * 60;
  const totalSlots = Math.floor(24 * 60 / slotMinutes);
  return Array.from({ length: totalSlots }, (_, i) => {
    const minutes = i * slotMinutes;
    return DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('HH:mm');
  });
});

const gmtLabel = computed(() => {
  if (!hasStudentTimezone.value) return 'Student'
  const studentOffset = DateTime.now().setZone(studentTimezoneResolved.value).offset
  const localOffset = DateTime.now().setZone(localTimezoneResolved.value).offset
  const diffMinutes = studentOffset - localOffset
  const sign = diffMinutes >= 0 ? '+' : '-'
  const hours = Math.abs(diffMinutes) / 60
  return `Student ${sign}${hours}h`
})

const timeLabelsGmt = computed(() => {
  if (!hasStudentTimezone.value) return timeLabels.value
  const slotMinutes = props.slot * 60
  const totalSlots = Math.floor(24 * 60 / slotMinutes)
  return Array.from({ length: totalSlots }, (_, i) => {
    return localDateTimeAtIndex(i)
        .setZone(studentTimezoneResolved.value)
        .toFormat('HH:mm')
  })
})

const localTimeDisplay = computed(() => {
  return localDateTimeAtIndex(selectedIndex.value).toFormat('HH:mm')
})

watch(
    selectedIndex,
    debounce((val) => {
      const minutes = val * props.slot * 60;
      const time = DateTime.fromObject({ hour: 0, minute: 0 }).plus({ minutes }).toFormat('HH:mm');
      emit('selectedTime', time);
    }, 300)
)

const gmtTimeDisplay = computed(() => {
  if (!hasStudentTimezone.value) return localTimeDisplay.value
  return localDateTimeAtIndex(selectedIndex.value)
      .setZone(studentTimezoneResolved.value)
      .toFormat('HH:mm')
})


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

function syncSelectedIndexFromTime(time: string) {
  const currentTime = time?.trim() ? time : props.defaultTime
  selectedIndex.value = getTimeIndex(currentTime)

  if (!scrollWrapper.value || !scrollTrack.value) return
  const el = scrollTrack.value.children[selectedIndex.value] as HTMLElement
  el?.scrollIntoView({ inline: 'center', behavior: 'smooth' })
}

watch(
    () => props.time,
    (time) => {
      if (!time?.trim()) return
      syncSelectedIndexFromTime(time)
    }
)

onMounted(async () => {
  setTimeout(async () => {
    syncSelectedIndexFromTime(props.time ?? props.defaultTime)

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
