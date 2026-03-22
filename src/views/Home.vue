<script setup lang="ts">
import { ref, watch } from 'vue';
import Table from "@/components/table/Table.vue";
import AddStudentModal from "@/components/modals/AddStudentModal.vue";
import {useStudentStore} from "@/store/students";

import { useQuasar, QTableColumn } from 'quasar'
import {useDictionariesStore} from "@/store/dictionaries";
import {storeToRefs} from "pinia";
import {Student, type StudentFormData, Timezone} from "@/types/students";

const $q = useQuasar()

const studentStore = useStudentStore()
const student = ref<StudentFormData | null>(null)
const openStudentModal = ref<boolean>(false)
const { students } = storeToRefs(studentStore)

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
    field: (row: Student) =>
        `${row.price} ${currencies.value.find((c) => c.id === row.currency_id)?.symbol ?? ''}` ,
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

const editStudent = (row: Student) => {
  student.value = {
    id: row.id,
    name: row.name,
    price: row.price,
    comment: row.comment,
    timezone: row.timezone,
    currency_id: row.currency_id,
    color: row.color ?? '#000000',
  }

  openStudentModal.value = true
}

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

watch(openStudentModal, (val) => {
  if (!val) {
    student.value = null
  }
})
</script>

<template>
  <div>
    <q-btn
      label="Add New"
      color="primary"
      class="q-mx-md q-my-sm"
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
            icon="edit"
            color="primary"
            flat
            round
            size="sm"
            @click="editStudent(row)"
          />
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
