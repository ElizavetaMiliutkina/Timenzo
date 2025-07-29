<script setup lang="ts">
import { ref, watch, reactive, defineEmits, defineProps } from 'vue'
import { EventDataCreate } from '@/types/calendar'
import type { QForm } from 'quasar'
import TimeZoneSlider from "@/components/TimeZoneSlider.vue";
import TimePeriod from "@/components/TimePeriod.vue";
import { DateTime, Duration } from 'luxon'

const props = defineProps<{
  modelValue: boolean;
  date_start: string;
  date_end: string;
  time_start: string | null;
  time_end: string | null;
  duration: number
  form: EventDataCreate
}>()
const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref<QForm | null>(null)
const duration = ref({ days: 0, hours: 1, minutes: 0 })


const form = reactive<EventDataCreate>({
  title: '',
  price: 0,
  description: '',
  date_start: '',
  date_end: '',
  time_start: '',
  time_end: '',
})


const updateDuration = (val: { days: number; hours: number; minutes: number }) => {
  duration.value = val
  if (form.time_start) {
    calculateTimeEnd()
  }
}

const updateDurationFromHours = (hours: number) => {
  const dur = Duration.fromObject({ hours }).shiftTo('days', 'hours', 'minutes').toObject();
  duration.value = {
    days: dur.days || 0,
    hours: dur.hours || 0,
    minutes: dur.minutes || 0,
  };
};

watch(() => form.date_start, () => calculateTimeEnd())

watch(() => props.modelValue, val => {
  updateDurationFromHours(props.duration)

  console.log(props.date_start, '-----', props.date_end)
  console.log(props.time_start, '-----', props.time_end)

  if (val && props.date_start && props.date_end) {
    form.date_start = updateDatetime(props.date_start, 'yyyy-MM-dd', 'yyyy/MM/dd')
    form.date_end = updateDatetime(props.date_end, 'yyyy-MM-dd', 'yyyy/MM/dd')
    form.time_start = props.time_start ?? ''
    form.time_end = props.time_end ?? ''
    console.log(form.date_end,'435')
  }
})

function closeModal() {
  emit('update:modelValue', false)
  resetForm()
}

function resetForm() {
  form.title = ''
  form.price = 0
  form.description = ''
  form.date_start = ''
  form.time_start = ''
  form.time_end = ''
}

const selectedTime = (time: string) => {
    form.time_start = time;
    calculateTimeEnd()
}
const isTimePeriodValid = ref(true);

const calculateTimeEnd = () => {
    const start = DateTime.fromFormat(`${form.date_start} ${form.time_start}`, 'yyyy/MM/dd HH:mm');
    const added = Duration.fromObject(duration.value)
    const end = start.plus(added)

    form.date_end = end.toFormat('yyyy/MM/dd')
    form.time_end = end.toFormat('HH:mm')
}

const updateDatetime = (value: string, formatFrom: string, formatTo: string) => {
  return DateTime.fromFormat(value, formatFrom).toFormat(formatTo)
}
const formatedDateTime = (time:string, date:string, type: 'date' | 'weekday') => {
  if (!time || !date) return '';

  const dateTime = DateTime.fromFormat(`${date} ${time}`, 'yyyy/MM/dd HH:mm');

  if(type === 'weekday'){
    return dateTime.toFormat('cccc')
  } else {
    return dateTime.isValid
        ? dateTime.toFormat('MMM dd hh:mm a')
        : 'Invalid DateTime';
  }
}

async function onSubmit() {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  console.log(isTimePeriodValid.value, '!isTimePeriodValid')
  if (!isValid || !isTimePeriodValid.value) return

  const payload: EventDataCreate = {
    title: form.title,
    price: Number(form.price),
    description: form.description,
    date_start: updateDatetime(form.date_start, 'yyyy/MM/dd', 'yyyy-MM-dd'),
    date_end: updateDatetime(form.date_end, 'yyyy/MM/dd', 'yyyy-MM-dd'),
    time_start: form.time_start ?? '00:00',
    time_end: form.time_end ?? '00:00',
  }

  emit('submit', payload)
  closeModal()
}
</script>

<template>
  <q-dialog v-model="props.modelValue" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">New Schedule</div>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
              filled
              v-model="form.title"
              label="Title *"
              :rules="[val => !!val || 'Enter Title']"
          />

          <q-input
              filled
              type="number"
              v-model="form.price"
              label="Price"
              :rules="[
              val => val !== null && val !== '' || 'Enter price',
              val => val >= 0 || 'Price must be positive'
            ]"
          />

          <q-input
              filled
              v-model="form.description"
              type="textarea"
              label="Description"
              :rules="[val => val.length >= 0 || 'Enter description']"
          />

          <div class="date-block">
            <q-input v-model="form.date_start" label="Select Start Date" readonly>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <div class="q-pa-md">
                      <q-date v-model="form.date_start" v-close-popup/>
                    </div>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input v-model="form.date_end" label="Select End Date" readonly>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <div class="q-pa-md">
                      <q-date v-model="form.date_end" v-close-popup/>
                    </div>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <time-zone-slider :time="form.time_start" @selected-time="selectedTime"/>
          <div class="time-info-block">
            <div class="text-center flex justify-center text-weight-bolder mdi-size-l" style="gap: 70px">
              <span>{{formatedDateTime(form.time_start, form.date_start, 'weekday')}}</span>
              <span>{{formatedDateTime(form.time_end, form.date_end, 'weekday')}}</span>
            </div>
            <div class="text-center">
              From <span class="text-weight-bolder">
              {{formatedDateTime(form.time_start, form.date_start, 'date')}}
            </span>
              To <span class="text-weight-bolder">{{formatedDateTime(form.time_end, form.date_end, 'date')}}</span>
            </div>
          </div>
          <label style="display: block; margin-top: 20px">Duration</label>
          <time-period
              v-model="duration"
              style="width: 290px;"
              @update:valid="isTimePeriodValid = $event"
              @update:duration="updateDuration"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeModal" />
        <q-btn label="Submit" color="primary" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.date-block {
  display: flex;
  justify-content: space-between;
}
</style>
