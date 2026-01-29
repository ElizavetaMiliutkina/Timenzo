<script setup lang="ts">
import {defineEmits, defineProps, ref, computed} from "vue";
import type {StudentFormData} from '@/types/students'
import LocationSelect from "@/components/LocationSelect.vue";
import {useStudentStore} from "@/store/students";
import {useDictionariesStore} from "@/store/dictionaries";
import {storeToRefs} from "pinia";
import type { QForm } from 'quasar'

const studentStore = useStudentStore()

const props = defineProps<{
  modelValue: boolean;
  form: StudentFormData | null
}>()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

const formRef = ref<QForm | null>(null)
const emit = defineEmits(['update:modelValue'])

const form = ref<StudentFormData>(props.form ?? {
  name: '',
  price: 0,
  comment: '',
  timezone: null,
  currency_id:1
})

const dictionariesStore = useDictionariesStore()
const { currencies } = storeToRefs(dictionariesStore)

dictionariesStore.fetchCurrencies()


const onSubmit = async () => {
  if (formRef.value?.validate() && form.value.timezone) {
    const response = await studentStore.postStudent(form.value)
    if (response) closeModal()
  }
}
const closeModal = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  form.value.name = ''
  form.value.price = 0
  form.value.timezone = null
  form.value.comment = ''
  form.value.currency_id = 1
}

</script>

<template>
  <q-dialog
    v-model="dialogModel"
    persistent
  >
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          New Student
        </div>
        <q-form
          ref="formRef"
          class="q-gutter-md"
        >
          <q-input
            v-model="form.name"
            filled
            label="Name *"
            :rules="[val => !!val || 'Enter Name']"
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

          <location-select v-model="form.timezone" />

          <q-input
            v-model="form.comment"
            filled
            type="textarea"
            label="Comment"
            :rules="[val => val.length >= 0 || 'Enter comment']"
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
