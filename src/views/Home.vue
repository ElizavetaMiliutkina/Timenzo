<script setup lang="ts">
import { ref, watch } from 'vue';
import Table from "@/components/table/Table.vue";
import AddStudentModal from "@/components/modals/AddStudentModal.vue";
import {useStudentStore} from "@/store/students";

import { useQuasar, QTableColumn } from 'quasar'
import {useDictionariesStore} from "@/store/dictionaries";
import {storeToRefs} from "pinia";
import {Student, Timezone} from "@/types/students";

const $q = useQuasar()

const studentStore = useStudentStore()
const student = ref(null)
const openStudentModal = ref<boolean>(false)
const students = ref<Student[]>([])

const dictionariesStore = useDictionariesStore()
const { currencies } = storeToRefs(dictionariesStore)

dictionariesStore.fetchCurrencies()

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

fetchStudents()

const columns: QTableColumn[] = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: (row: Student) => row.name,
    format: (val: unknown) => String(val),
    sortable: true,
  },
  {
    name: 'price',
    label: 'Price',
    align: 'left',
    field: 'price',
    sortable: true,
  },
  {
    name: 'currency_id',
    label: 'Currency',
    align: 'left',
    field: (row: Student) =>
        currencies.value.find((c) => c.id === row.currency_id)?.symbol ?? '',
  },
  {
    name: 'timezone',
    label: 'Timezone',
    align: 'left',
    field: (row: Student) => row.timezone,
    format: (val: unknown) => (val as Timezone)?.label ?? '',
    sortable: true,
  },
  {
    name: 'comment',
    label: 'Comment',
    align: 'left',
    field: 'comment',
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center',
    field: () => null,
    headerStyle: 'width: 1%',
    style: 'width: 1%; white-space: nowrap;',
  },
]

const deleteStudent = (row: Student) => {
  $q.dialog({
    title: 'Confirm',
    message: `Are you sure you want to delete ${row.name} student?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await studentStore.deleteStudent(row.id)
  })
}
</script>

<template>
  <div>
    <q-btn
      label="Add New"
      color="primary"
      @click="() => openStudentModal = true"
    />
    <add-student-modal
      v-model="openStudentModal"
      :form="student"
    />
    <Table
      :columns="columns"
      :rows="students"
    >
      <template #body-cell-actions="{ row }">
        <q-td style="text-align: center">
          <q-btn
            icon="delete"
            color="negative"
            flat
            round
            size="sm"
            @click="deleteStudent(row)"
          />
        </q-td>
      </template>
    </Table>
  </div>
</template>

<style lang='css'></style>
