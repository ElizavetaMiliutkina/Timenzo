<script setup lang="ts">
import { ref, watch, reactive, defineEmits, defineProps } from 'vue'
import { EventDataCreate } from '@/types/calendar'
import type { QForm } from 'quasar'
import TimeZoneSlider from "@/components/TimeZoneSlider.vue";

const props = defineProps({
  modelValue: Boolean,
  start: String,
  end: String
})
const emit = defineEmits(['update:modelValue', 'submit'])

const isOpen = ref(false)
const formRef = ref<QForm | null>(null)

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
  date: '',
  time_start: '',
  time_end: '',
  datetime: '',
})

const startTime = ref('12:00')

watch(() => props.modelValue, val => {
  isOpen.value = val
  if (val && props.start) {
    form.date = props.start
    updateDatetime()
  }
})

function updateDatetime() {
  if (form.date && form.time_start && form.time_end) {
    form.datetime = `${form.date} ${form.time_start}-${form.time_end}`
  }
}

function closeModal() {
  emit('update:modelValue', false)
  resetForm()
}

function resetForm() {
  form.title = ''
  form.price = 0
  form.description = ''
  form.date = ''
  form.time_start = ''
  form.time_end = ''
  form.datetime = ''
}

async function onSubmit() {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (!isValid) return

  const payload: EventDataCreate = {
    title: form.title,
    price: Number(form.price),
    description: form.description,
    date: form.date,
    time_start: form.time_start,
    time_end: form.time_end,
    datetime: form.datetime,
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

          <q-input v-model="form.date" label="Select Date" readonly>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <div class="q-pa-md">
                    <q-date v-model="form.date" @update:model-value="updateDatetime" />
                  </div>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <time-zone-slider :time="startTime"/>

          <q-select
              v-model="form.time_start"
              :options="timeOptions"
              label="Select Time Start"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="updateDatetime"
          />

          <q-select
              v-model="form.time_end"
              :options="timeOptions"
              label="Select Time End"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="updateDatetime"
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
