<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import Table from "@/components/table/Table.vue";
import AddStudentModal from "@/components/modals/AddStudentModal.vue";
import AdditionalColumnsModal from "@/components/modals/AdditionalColumnsModal.vue";
import LocationSelect from "@/components/LocationSelect.vue";
import DynamicField from "@/components/shared/DynamicField.vue";
import {useStudentStore} from "@/store/students";
import { useBusyIds, useBusyAction } from '@/composables/useBusyAction'

import { useQuasar, QTableColumn } from 'quasar'
import {useDictionariesStore} from "@/store/dictionaries";
import {useAdditionalColumnsStore} from "@/store/additionalColumns";
import {storeToRefs} from "pinia";
import {Student, type StudentFormData, Timezone, type ExtraData} from "@/types/students";
import {getColumnKey} from "@/types/additionalColumns";
import {formatExtraValue} from "@/utils/extraValue";

const $q = useQuasar()

const studentStore = useStudentStore()
const { isBusy: isDeletingStudent, runFor: runDeleteStudent } = useBusyIds()
const student = ref<StudentFormData | null>(null)
const openStudentModal = ref<boolean>(false)
const openAdditionalColumnsModal = ref<boolean>(false)
const { students } = storeToRefs(studentStore)

const additionalColumnsStore = useAdditionalColumnsStore()
const { columns: additionalColumns } = storeToRefs(additionalColumnsStore)
additionalColumnsStore.ensureLoaded()

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
  studentStore.getStudents()
}

fetchStudents()

const staticColumns: QTableColumn[] = [
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
]

const actionsColumn: QTableColumn = {
  name: 'actions',
  label: 'Actions',
  align: 'center',
  field: () => null,
  headerStyle: 'width: 1%',
  style: 'width: 1%; white-space: nowrap;',
}

const columns = computed<QTableColumn[]>(() => {
  const dynamic: QTableColumn[] = additionalColumns.value.map((col, idx) => {
    const key = getColumnKey(col, idx)
    return {
      name: `extra:${key}`,
      label: col.label,
      align: 'left',
      field: (row: Student) => row.extra?.[key] ?? '',
      format: (val: unknown) => formatExtraValue(val as never, col.type),
      sortable: true,
    }
  })
  return [...staticColumns, ...dynamic, actionsColumn]
})

/**
 * Инлайн-редактирование строки прямо в таблице (без модалки).
 * Клик по любому полю строки переводит эту строку в режим редактирования,
 * кнопки в Actions меняются на "Отмена"/"Сохранить".
 */
const editingRowId = ref<number | null>(null)
const editDraft = ref<StudentFormData | null>(null)
const editingField = ref<string | null>(null)
const { busy: isSavingInline, run: runSaveInline } = useBusyAction()

const nameInputRef = ref<{ focus: () => void } | null>(null)
const priceInputRef = ref<{ focus: () => void } | null>(null)
const commentInputRef = ref<{ focus: () => void } | null>(null)
const timezoneSelectRef = ref<{ focus: () => void } | null>(null)
const extraFieldRefs = ref<Record<string, { focus: () => void } | null>>({})

function focusEditingField(field: string) {
  if (field === 'name') nameInputRef.value?.focus()
  else if (field === 'price') priceInputRef.value?.focus()
  else if (field === 'comment') commentInputRef.value?.focus()
  else if (field === 'timezone') timezoneSelectRef.value?.focus()
  else if (field.startsWith('extra:')) {
    const key = field.slice('extra:'.length)
    extraFieldRefs.value[key]?.focus()
  }
}

const isEditDraftValid = computed(() => {
  const d = editDraft.value
  if (!d) return false
  return !!d.name
      && d.price !== null && d.price !== undefined && Number(d.price) >= 0
      && !!d.currency_id
      && !!d.timezone
})

const startInlineEdit = async (row: Student, field: string) => {
  if (editingRowId.value !== null) return
  if (isDeletingStudent(row.id)) return
  editingRowId.value = row.id
  editingField.value = field
  editDraft.value = {
    id: row.id,
    name: row.name,
    price: row.price,
    comment: row.comment,
    timezone: row.timezone,
    currency_id: row.currency_id,
    paid: row.paid ?? 0,
    color: row.color ?? '#000000',
    extra: { ...(row.extra ?? {}) },
  }
  await nextTick()
  focusEditingField(field)
}

const cancelInlineEdit = () => {
  editingRowId.value = null
  editDraft.value = null
  editingField.value = null
}

const saveInlineEdit = async () => {
  if (!editDraft.value || editingRowId.value === null || !isEditDraftValid.value) return
  const id = editingRowId.value
  const payload = editDraft.value
  await runSaveInline(async () => {
    const response = await studentStore.updateStudent(id, payload)
    if (response) {
      editingRowId.value = null
      editDraft.value = null
      editingField.value = null
    }
  })
}

const editStudent = (row: Student) => {
  cancelInlineEdit()

  student.value = {
    id: row.id,
    name: row.name,
    price: row.price,
    comment: row.comment,
    timezone: row.timezone,
    currency_id: row.currency_id,
    paid: row.paid ?? 0,
    color: row.color ?? '#000000',
    extra: { ...(row.extra ?? {}) },
  }

  openStudentModal.value = true
}

const deleteStudent = (row: Student) => {
  if (isDeletingStudent(row.id)) return
  $q.dialog({
    title: 'Confirm',
    message: `Are you sure you want to delete ${row.name} student?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void runDeleteStudent(row.id, () => studentStore.deleteStudent(row.id))
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
    <div class="flex justify-between items-center">
      <q-btn
        label="Add Student"
        color="primary"
        class="q-mx-md q-my-sm"
        @click="() => openStudentModal = true"
      />
      <q-btn
        label="Additional Columns"
        color="primary"
        outline
        class="q-mx-md q-my-sm"
        icon-right="tune"
        @click="() => openAdditionalColumnsModal = true"
      />
    </div>
    <add-student-modal
      v-model="openStudentModal"
      :form="student"
    />
    <additional-columns-modal
      v-model="openAdditionalColumnsModal"
      :columns="additionalColumns"
    />
    <Table
      :columns="columns"
      :rows="students"
    >
      <template #body-cell-name="{ row }">
        <q-td>
          <q-input
            v-if="editingRowId === row.id"
            ref="nameInputRef"
            v-model="editDraft!.name"
            dense
            borderless
            @keyup.enter="saveInlineEdit"
            @keyup.esc="cancelInlineEdit"
          />
          <div
            v-else
            class="table-cell-ellipsis editable-cell"
            @click="startInlineEdit(row, 'name')"
          >
            {{ row.name }}
            <q-tooltip
              v-if="row.name"
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 4]"
              max-width="400px"
            >
              {{ row.name }}
            </q-tooltip>
          </div>
        </q-td>
      </template>

      <template #body-cell-price="{ row }">
        <q-td>
          <div
            v-if="editingRowId === row.id"
            class="row items-center no-wrap"
            style="gap: 8px"
          >
            <q-input
              ref="priceInputRef"
              v-model.number="editDraft!.price"
              type="number"
              dense
              borderless
              style="width: 90px"
              @keyup.enter="saveInlineEdit"
              @keyup.esc="cancelInlineEdit"
            />
            <q-select
              v-model="editDraft!.currency_id"
              :options="currencies"
              emit-value
              map-options
              option-label="label"
              option-value="id"
              dense
              borderless
              style="min-width: 90px"
            />
          </div>
          <div
            v-else
            class="table-cell-ellipsis editable-cell"
            @click="startInlineEdit(row, 'price')"
          >
            {{ row.price }} {{ currencies.find((c) => c.id === row.currency_id)?.symbol ?? '' }}
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 4]"
              max-width="400px"
            >
              {{ row.price }} {{ currencies.find((c) => c.id === row.currency_id)?.symbol ?? '' }}
            </q-tooltip>
          </div>
        </q-td>
      </template>

      <template #body-cell-timezone="{ row }">
        <q-td>
          <location-select
            v-if="editingRowId === row.id"
            ref="timezoneSelectRef"
            v-model="editDraft!.timezone"
            minimal
          />
          <div
            v-else
            class="table-cell-ellipsis editable-cell"
            @click="startInlineEdit(row, 'timezone')"
          >
            {{ row.timezone?.label }}
            <q-tooltip
              v-if="row.timezone?.label"
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 4]"
              max-width="400px"
            >
              {{ row.timezone?.label }}
            </q-tooltip>
          </div>
        </q-td>
      </template>

      <template #body-cell-comment="{ row }">
        <q-td>
          <q-input
            v-if="editingRowId === row.id"
            ref="commentInputRef"
            v-model="editDraft!.comment"
            type="textarea"
            autogrow
            dense
            borderless
            @keyup.esc="cancelInlineEdit"
          />
          <div
            v-else
            class="table-cell-ellipsis editable-cell"
            @click="startInlineEdit(row, 'comment')"
          >
            {{ row.comment }}
            <q-tooltip
              v-if="row.comment"
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 4]"
              max-width="400px"
            >
              {{ row.comment }}
            </q-tooltip>
          </div>
        </q-td>
      </template>

      <template
        v-for="(col, idx) in additionalColumns"
        :key="col.id ?? col.key ?? idx"
        #[`body-cell-extra:${getColumnKey(col,idx)}`]="{ row }"
      >
        <q-td>
          <DynamicField
            v-if="editingRowId === row.id"
            :ref="(el) => { extraFieldRefs[getColumnKey(col,idx)] = el as { focus: () => void } | null }"
            v-model="(editDraft!.extra as ExtraData)[getColumnKey(col, idx)]"
            :label="col.label"
            :type="col.type"
            minimal
          />
          <div
            v-else
            class="table-cell-ellipsis editable-cell"
            @click="startInlineEdit(row, `extra:${getColumnKey(col,idx)}`)"
          >
            {{ formatExtraValue(row.extra?.[getColumnKey(col, idx)]) }}
            <q-tooltip
              v-if="formatExtraValue(row.extra?.[getColumnKey(col, idx)])"
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 4]"
              max-width="400px"
            >
              {{ formatExtraValue(row.extra?.[getColumnKey(col, idx)]) }}
            </q-tooltip>
          </div>
        </q-td>
      </template>

      <template #body-cell-actions="{ row }">
        <q-td style="text-align: center">
          <template v-if="editingRowId === row.id">
            <q-btn
              icon="close"
              color="grey-7"
              flat
              round
              size="sm"
              :disable="isSavingInline"
              @click="cancelInlineEdit"
            />
            <q-btn
              icon="check"
              color="positive"
              flat
              round
              size="sm"
              :loading="isSavingInline"
              :disable="isSavingInline || !isEditDraftValid"
              @click="saveInlineEdit"
            />
          </template>
          <template v-else>
            <q-btn
              icon="edit"
              color="primary"
              flat
              round
              size="sm"
              :disable="editingRowId !== null"
              @click="editStudent(row)"
            />
            <q-btn
              icon="delete"
              color="negative"
              flat
              round
              size="sm"
              :loading="isDeletingStudent(row.id)"
              :disable="isDeletingStudent(row.id) || editingRowId !== null"
              @click="deleteStudent(row)"
            />
          </template>
        </q-td>
      </template>
    </Table>
  </div>
</template>

<style lang='css'>
.table-cell-ellipsis {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editable-cell {
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 4px;
  margin: -2px -4px;
}

.editable-cell:hover {
  background: rgba(0, 0, 0, 0.05);
}
</style>
