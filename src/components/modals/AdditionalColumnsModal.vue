<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { QForm } from 'quasar'
import {
  ADDITIONAL_COLUMN_TYPE_OPTIONS,
  type AdditionalColumn,
  type AdditionalColumnFull,
  type AdditionalColumnType,
} from '@/types/additionalColumns'
import { useAdditionalColumnsStore } from '@/store/additionalColumns'
import { useUnsavedClose } from '@/composables/useUnsavedClose'

interface ColumnRow {
  label: string
  type: AdditionalColumnType
}

const DEFAULT_TYPE: AdditionalColumnType = 'text'

const props = defineProps<{
  modelValue: boolean
  columns?: AdditionalColumn[] | AdditionalColumnFull[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', value: AdditionalColumnFull[]): void
}>()

const additionalColumnsStore = useAdditionalColumnsStore()
const { confirmCloseIfDirty } = useUnsavedClose()
const submitting = ref(false)

const formRef = ref<QForm | null>(null)
const rows = ref<ColumnRow[]>([])
const showErrors = ref(false)
const baseline = ref('')

const emptyRow = (): ColumnRow => ({ label: '', type: DEFAULT_TYPE })

function snapshot(list: ColumnRow[]): string {
  return JSON.stringify(list.map((r) => ({ label: r.label, type: r.type })))
}

function fromColumns(
    list?: AdditionalColumn[] | AdditionalColumnFull[],
): ColumnRow[] {
  if (list && list.length) {
    return list.map((c) => ({ label: c.label, type: c.type ?? DEFAULT_TYPE }))
  }
  return [emptyRow()]
}

const isDirty = computed(() => snapshot(rows.value) !== baseline.value)

const isRowFilled = (row: ColumnRow) =>
    row.label.trim().length > 0 && !!row.type

const allRowsFilled = computed(() => rows.value.every(isRowFilled))

const canAddRow = computed(() => allRowsFilled.value)

watch(
    () => props.modelValue,
    async (open) => {
      if (open) {
        rows.value = fromColumns(props.columns)
        showErrors.value = false
        await nextTick()
        baseline.value = snapshot(rows.value)
        formRef.value?.resetValidation()
      }
    },
    { immediate: true }
)

function addRow() {
  if (!canAddRow.value) {
    showErrors.value = true
    nextTick(() => formRef.value?.validate())
    return
  }
  rows.value.push(emptyRow())
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
  if (rows.value.length === 0) rows.value.push(emptyRow())
  if (!showErrors.value) return
  nextTick(() => formRef.value?.validate())
}

async function onSubmit() {
  if (submitting.value) return
  showErrors.value = true
  await nextTick()
  const valid = await formRef.value?.validate()
  if (!valid) return

  const payload: AdditionalColumn[] = rows.value
      .filter(isRowFilled)
      .map((r) => ({ label: r.label.trim(), type: r.type }))

  try {
    submitting.value = true
    const saved = await additionalColumnsStore.replaceColumns(payload)
    if (!saved) return
    emit('saved', saved)
    finalizeClose()
  } finally {
    submitting.value = false
  }
}

function finalizeClose() {
  emit('update:modelValue', false)
}

function onDialogDismissRequest(open: boolean) {
  if (open) {
    emit('update:modelValue', true)
    return
  }
  confirmCloseIfDirty(isDirty.value, finalizeClose)
}

function onCancel() {
  confirmCloseIfDirty(isDirty.value, finalizeClose)
}

const labelRules = [
  (val: string) => (!!val && val.trim().length > 0) || 'Введите название',
]

const typeRules = [
  (val: AdditionalColumnType | null | undefined) => !!val || 'Выберите тип',
]
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="onDialogDismissRequest"
  >
    <q-card style="min-width: 520px">
      <q-card-section>
        <div class="text-h6">
          Additional Columns
        </div>

        <q-form
          ref="formRef"
          class="q-gutter-md q-mt-sm"
        >
          <div
            v-for="(row, index) in rows"
            :key="index"
            class="row items-start"
            style="column-gap: 12px"
          >
            <div class="col">
              <q-input
                v-model="row.label"
                filled
                dense
                label="Label *"
                :rules="showErrors ? labelRules : []"
                lazy-rules="ondemand"
              />
            </div>
            <div
              class="col-auto"
              style="min-width: 180px"
            >
              <q-select
                v-model="row.type"
                filled
                dense
                label="Type *"
                :options="ADDITIONAL_COLUMN_TYPE_OPTIONS"
                emit-value
                map-options
                option-label="label"
                option-value="value"
                :rules="showErrors ? typeRules : []"
                lazy-rules="ondemand"
              />
            </div>
            <div class="col-auto">
              <q-btn
                icon="close"
                flat
                round
                dense
                color="negative"
                :disable="rows.length === 1 && !row.label"
                @click="removeRow(index)"
              />
            </div>
          </div>

          <div class="row q-mt-sm">
            <q-btn
              icon="add"
              label="Добавить поле"
              color="primary"
              flat
              dense
              :disable="!canAddRow"
              @click="addRow"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onCancel"
        />
        <q-btn
          label="Save"
          color="primary"
          :loading="submitting"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
