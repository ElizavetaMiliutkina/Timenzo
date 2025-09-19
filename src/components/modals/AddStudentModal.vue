<script setup lang="ts">
import {defineEmits, defineProps, ref} from "vue";
import type {StudentFormData} from '@/types/students'
import LocationSelect from "@/components/LocationSelect.vue";
import {useStudentStore} from "@/store/students";

const studentStore = useStudentStore()

const props = defineProps<{
  modelValue: boolean;
  form: StudentFormData | null
}>()
const formRef = ref<any>(null)
const emit = defineEmits(['update:modelValue'])

const form = ref<StudentFormData>(props.form ?? {
  name: '',
  price: 0,
  comment: '',
  timezone: null
})


const onSubmit = async () => {
  if(formRef.value.validate() && form.value.timezone){
    console.log(form.value, 'form')
    const response = await studentStore.postStudent(form.value)
    if (response) closeModal()
    console.log(response, 'response')
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
}

</script>

<template>
  <q-dialog v-model="props.modelValue" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">New Schedule</div>
        <q-form ref="formRef" class="q-gutter-md">
          <q-input
              filled
              v-model="form.name"
              label="Name *"
              :rules="[val => !!val || 'Enter Name']"
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

          <location-select v-model="form.timezone"/>

          <q-input
              filled
              v-model="form.comment"
              type="textarea"
              label="Comment"
              :rules="[val => val.length >= 0 || 'Enter comment']"
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
