<script setup lang="ts">
import { ref, watch, reactive, defineEmits, defineProps } from 'vue'
import {EventData, EventDataCreate} from '@/types/calendar'
import type { QForm } from 'quasar'
import TimeZoneSlider from "@/components/TimeZoneSlider.vue";
import TimePeriod from "@/components/TimePeriod.vue";
import { DateTime, Duration } from 'luxon'

//типизировать props
const props = defineProps<{
  modelValue: boolean;
  date_start: string;
  date_end: string;
  time_start: string | null;
  time_end: string | null;
}>()
const emit = defineEmits(['update:modelValue', 'submit'])


const isOpen = ref(false)
const formRef = ref<QForm | null>(null)
const duration = ref({ days: 0, hours: 1, minutes: 0 })

const timeOptions = [
  '08:00', '08:30',
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00', '20:30'
]

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


watch(() => props.modelValue, val => {
  isOpen.value = val

  console.log(props.date_start,'------', props.date_end)
  if (val && props.date_start && props.date_end && props.time_start && props.time_end) {
    form.date_start = updateDatetime(props.date_start, 'yyyy-MM-dd', 'yyyy/MM/dd')
    form.time_start = props.time_start
    form.time_end = props.time_end
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

const calculateTimeEnd = () => {
    const [hour, minute] = form.time_start.split(':').map(Number)
    const start = DateTime.fromObject({ hour, minute })
    const added = Duration.fromObject(duration.value)
    const end = start.plus(added)
    form.time_end = end.toFormat('HH:mm')
}

const updateDatetime = (value: string, formatFrom: string, formatTo: string) => {
  return DateTime.fromFormat(value, formatFrom).toFormat(formatTo)
}

async function onSubmit() {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (!isValid) return

  const payload: EventDataCreate = {
    title: form.title,
    price: Number(form.price),
    description: form.description,
    date_start: updateDatetime(form.date_start, 'yyyy/MM/dd', 'yyyy-MM-dd'),
    date_end: updateDatetime(form.date_end, 'yyyy/MM/dd', 'yyyy-MM-dd'),
    time_start: form.time_start,
    time_end: form.time_end,
  }

  emit('submit', payload)
  closeModal()
}
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
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
          <div class="text-center">
            From {{form.time_start}} To {{form.time_end}}
          </div>

<!--          <div class="row justify-between">-->
<!--            <q-select-->
<!--                class="col-md-6"-->
<!--                style="padding-right: 5px"-->
<!--                v-model="form.time_start"-->
<!--                :options="timeOptions"-->
<!--                label="Select Time Start"-->
<!--                outlined-->
<!--                dense-->
<!--                emit-value-->
<!--                map-options-->
<!--                @update:model-value="updateDatetime"-->
<!--            />-->

<!--            <q-select-->
<!--                class="col-md-6"-->
<!--                style="padding-left: 5px"-->
<!--                v-model="form.time_end"-->
<!--                :options="timeOptions"-->
<!--                label="Select Time End"-->
<!--                outlined-->
<!--                dense-->
<!--                emit-value-->
<!--                map-options-->
<!--                @update:model-value="updateDatetime"-->
<!--            />-->
<!--          </div>-->

<!--          <div>Without timezone comparison</div>-->
          <label style="display: block; margin-top: 20px">Duration</label>
          <time-period
              style="width: 290px;"
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
