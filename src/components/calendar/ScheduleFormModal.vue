<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { QForm } from 'quasar'
import { DateTime, Duration } from 'luxon'
import { EventDataCreate } from '@/types/calendar'

import TimeZoneSlider from '@/components/TimeZoneSlider.vue'
import TimePeriod from '@/components/TimePeriod.vue'

import { useDictionariesStore } from '@/store/dictionaries'
import {useStudentStore} from "@/store/students";
import {Student} from "@/types/students";

const studentStore = useStudentStore()
const { students } = storeToRefs(studentStore)
const selectedStudent = ref<Student | null>(null)
const studentTimezone = ref('')
const browserTimezone = DateTime.local().zoneName

const props = defineProps<{
  modelValue: boolean
  model: EventDataCreate | null
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: EventDataCreate): void
}>()

const formRef = ref<QForm | null>(null)

const form = ref<EventDataCreate>({
  title: '',
  price: 0,
  currency_id: 1,
  description: '',
  date_start: '',
  date_end: '',
  time_start: '',
  time_end: '',
})

const dictionariesStore = useDictionariesStore()
const { currencies } = storeToRefs(dictionariesStore)

dictionariesStore.fetchCurrencies()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  },
})

/* ===================== SYNC FROM PARENT ===================== */

watch(
    () => props.model,
    (model) => {
      if (!model) return
      form.value = { ...model }
      syncDurationFromForm()
    },
    { immediate: true }
)

/* ===================== DURATION ===================== */

const duration = ref({ days: 0, hours: 1, minutes: 0 })
const isTimePeriodValid = ref(true)

function syncDurationFromForm() {
  if (!form.value.date_start || !form.value.time_start || !form.value.date_end || !form.value.time_end) {
    return
  }

  const start = DateTime.fromFormat(
      `${form.value.date_start} ${form.value.time_start}`,
      'yyyy-MM-dd HH:mm'
  )
  const end = DateTime.fromFormat(
      `${form.value.date_end} ${form.value.time_end}`,
      'yyyy-MM-dd HH:mm'
  )

  const diff = end.diff(start, ['days', 'hours', 'minutes']).toObject()

  duration.value = {
    days: diff.days ?? 0,
    hours: diff.hours ?? 0,
    minutes: diff.minutes ?? 0,
  }
}

/* ===================== TIME CALC ===================== */

function calculateTimeEnd() {
  if (!form.value.date_start || !form.value.time_start) return

  const start = DateTime.fromFormat(
      `${form.value.date_start} ${form.value.time_start}`,
      'yyyy-MM-dd HH:mm'
  )

  const end = start.plus(Duration.fromObject(duration.value))

  form.value.date_end = end.toFormat('yyyy-MM-dd')
  form.value.time_end = end.toFormat('HH:mm')
}

function updateDuration(val: { days: number; hours: number; minutes: number }) {
  duration.value = val
  calculateTimeEnd()
}

function selectedTime(time: string) {
  form.value.time_start = time
  calculateTimeEnd()
}

/* ===================== SUBMIT ===================== */

async function onSubmit() {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  if (!isValid || !isTimePeriodValid.value) return

  emit('submit', {
    ...form.value,
    price: Number(form.value.price),
    time_start: form.value.time_start || '00:00',
    time_end: form.value.time_end || '00:00',
  })

  closeModal()
}

function closeModal() {
  emit('update:modelValue', false)
}

const fetchStudents = async () => {
  if (!students.value.length) {
    await studentStore.getStudents()
  }
}

fetchStudents()

// function selectStudent() {
//
// }

function formatedDateTime(
    time: string,
    date: string,
    type: 'date' | 'weekday'
) {
  if (!time || !date) return ''

  const dateTime = DateTime.fromFormat(
      `${date} ${time}`,
      'yyyy-MM-dd HH:mm'
  )

  if (!dateTime.isValid) return ''

  if (type === 'weekday') {
    return dateTime.toFormat('cccc')
  }

  return dateTime.toFormat('MMM dd HH:mm')
}

watch(selectedStudent, (student) => {
  if (!student) return

  form.value.price = student.price
  form.value.currency_id = student.currency_id

  studentTimezone.value = student.timezone.timezone

  // ⏰ если хочешь — автоподстановка времени
  // например, сразу поставить старт на ближайший час
  autoSetTimeByTimezone(student.timezone)
})

function autoSetTimeByTimezone(timezone: any) {
  if (!timezone) return

  // const now = DateTime.now().setZone(timezone.label)
  //
  // form.value.date_start = now.toFormat('yyyy-MM-dd')
  // form.value.time_start = now.plus({ hours: 1 }).toFormat('HH:mm')
  //
  // calculateTimeEnd()
}

const browserTimeDisplay = computed(() => {
  if (!form.value.time_start || !form.value.date_start) return ''

  return DateTime.now()
      .setZone(browserTimezone) // текущий час в таймзоне студента
      .toFormat('HH:mm') // только часы и минуты
})



const studentTimeDisplay = computed(() => {
  if (!studentTimezone.value) return ''

  return DateTime.now()
      .setZone(studentTimezone.value) // текущий час в таймзоне студента
      .toFormat('HH:mm') // только часы и минуты
})

</script>

<template>
  <div>{{ studentTimezone }}</div>
  <q-dialog
    v-model="dialogModel"
    persistent
  >
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          New Schedule
        </div>
      </q-card-section>
      <q-card-section>
        <!--        <div class="text-h6">-->
        <!--          Select Student-->
        <!--        </div>-->
        {{ selectedStudent }}
        <q-select
          v-model="selectedStudent"
          filled
          label="Student"
          :options="students"
          option-label="name"
        />
      </q-card-section>
      <!--      <q-btn-->
      <!--        flat-->
      <!--        label="Select Student"-->
      <!--        color="primary"-->
      <!--        @click="selectStudent"-->
      <!--      />-->

      <q-card-section>
        <q-form
          ref="formRef"
          class="q-gutter-md"
          @submit.prevent="onSubmit"
        >
          <q-input
            v-model="form.title"
            filled
            label="Title *"
            :rules="[val => !!val || 'Enter Title']"
          />

          <div
            class="row"
            style="column-gap: 16px"
          >
            <div class="col">
              <q-input
                v-model="form.price"
                filled
                type="number"
                label="Price"
                :rules="[
                  val => val !== null && val !== '' || 'Enter price',
                  val => val >= 0 || 'Price must be positive'
                ]"
              />
            </div>

            <div class="col-auto">
              <q-select
                v-model="form.currency_id"
                filled
                label="Currency"
                :options="currencies"
                emit-value
                map-options
                option-label="label"
                option-value="id"
                :rules="[val => !!val || 'Select currency']"
              />
            </div>
          </div>

          <q-input
            v-model="form.description"
            filled
            type="textarea"
            label="Description"
            :rules="[val => val.length >= 0 || 'Enter description']"
          />

          <div class="date-block">
            <q-input
              v-model="form.date_start"
              label="Select Start Date"
              readonly
            >
              <template #append>
                <q-icon
                  name="event"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <div class="q-pa-md">
                      <q-date
                        v-model="form.date_start"
                        v-close-popup
                      />
                    </div>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-model="form.date_end"
              label="Select End Date"
              readonly
            >
              <template #append>
                <q-icon
                  name="event"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <div class="q-pa-md">
                      <q-date
                        v-model="form.date_end"
                        v-close-popup
                      />
                    </div>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div
            class="row justify-between items-center q-mt-md text-weight-medium"
          >
            <div>
              🖥 Your time:
              <span class="text-primary">{{ browserTimeDisplay }}</span>
            </div>

            <div v-if="studentTimezone">
              👤 Student time:
              <span class="text-secondary">{{ studentTimeDisplay }}</span>
            </div>
          </div>
          <time-zone-slider
            :time="form.time_start"
            :timezone="selectedStudent?.timezone?.timezone"
            @selected-time="selectedTime"
          />
          <div class="time-info-block">
            <div
              class="text-center flex justify-center text-weight-bolder mdi-size-l"
              style="gap: 70px"
            >
              <span>{{ formatedDateTime(form.time_start, form.date_start, 'weekday') }}</span>
              <span>{{ formatedDateTime(form.time_end, form.date_end, 'weekday') }}</span>
            </div>
            <div class="text-center">
              From <span class="text-weight-bolder">
                {{ formatedDateTime(form.time_start, form.date_start, 'date') }}
              </span>
              To <span class="text-weight-bolder">{{ formatedDateTime(form.time_end, form.date_end, 'date') }}</span>
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
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="closeModal"
        />
        <q-btn
          label="Submit"
          color="primary"
          @click="onSubmit"
        />
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
