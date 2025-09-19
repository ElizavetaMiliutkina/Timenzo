<script setup lang="ts">
import { ref, watch } from 'vue';
import Table from "@/components/table/Table.vue";
import AddStudentModal from "@/components/modals/AddStudentModal.vue";
import {useStudentStore} from "@/store/students";

const studentStore = useStudentStore()
const student = ref(null)
const openStudentModal = ref<boolean>(false)
const students = ref([])

watch(
    () => studentStore.students,
    (newVal) => {
      students.value = newVal
    },
    { immediate: true }
)

const fetchStudents = () => {
  if(studentStore.students && studentStore.students.length){
    students.value = studentStore.students
  } else {
    studentStore.getStudents()
  }
}
console.log(studentStore.students, 'studentStore.students')
fetchStudents()



const columns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'price', align: 'left', label: 'Price', field: 'price', sortable: true },
  { name: 'timezone', label: 'Timezone', align: 'left', field: row => row.timezone, format: val => `${val.label}`,
     sortable: true },
  { name: 'comment', label: 'Comment', align: 'left', field: 'comment' },
]
</script>

<template>
  <div>
    <q-btn label="Add New" color="primary" @click="() => openStudentModal = true"/>
    <add-student-modal v-model="openStudentModal" :form="student"/>
    <Table :columns="columns" :rows="students"/>
  </div>
</template>

<style lang='css'></style>
