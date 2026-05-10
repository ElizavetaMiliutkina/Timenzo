<script setup lang="ts">
import { defineEmits, defineProps, ref, computed, watch, nextTick } from "vue";
import type {ExtraData, StudentFormData} from '@/types/students'
import LocationSelect from "@/components/LocationSelect.vue";
import {useStudentStore} from "@/store/students";
import {useDictionariesStore} from "@/store/dictionaries";
import {useAdditionalColumnsStore} from "@/store/additionalColumns";
import {storeToRefs} from "pinia";
import type { QForm } from 'quasar'
import ColorPicker from "@/components/shared/ColorPicker.vue";
import DynamicField from "@/components/shared/DynamicField.vue";
import { useUnsavedClose } from '@/composables/useUnsavedClose'
import { getColumnKey } from '@/types/additionalColumns'
import { defaultValueForType } from '@/utils/extraValue'

const studentStore = useStudentStore()
const { confirmCloseIfDirty } = useUnsavedClose()

const additionalColumnsStore = useAdditionalColumnsStore()
const { columns: additionalColumns } = storeToRefs(additionalColumnsStore)
additionalColumnsStore.ensureLoaded()

function buildEmptyExtra(existing?: ExtraData): ExtraData {
  const out: ExtraData = {}
  additionalColumns.value.forEach((col, idx) => {
    const key = getColumnKey(col, idx)
    out[key] = existing?.[key] ?? defaultValueForType(col.type)
  })
  return out
}

const props = defineProps<{
  modelValue: boolean;
  form: StudentFormData | null
}>()

const emit = defineEmits(['update:modelValue'])

function formSnapshot(f: StudentFormData) {
  return JSON.stringify({
    name: f.name,
    price: f.price,
    comment: f.comment ?? '',
    currency_id: f.currency_id,
    timezoneId: f.timezone?.id ?? null,
    color: f.color,
    paid: f.paid,
    extra: f.extra ?? {},
  })
}

const baseline = ref('')

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      await nextTick()
      baseline.value = formSnapshot(form.value)
    }
  }
)

const isDirty = computed(() => formSnapshot(form.value) !== baseline.value)

function finalizeClose() {
  emit('update:modelValue', false)
  resetForm()
}

/** Только клик по оверлею / Esc — не кнопка Cancel */
function onDialogDismissRequest(open: boolean) {
  if (open) {
    emit('update:modelValue', true)
    return
  }
  confirmCloseIfDirty(isDirty.value, finalizeClose)
}

const formRef = ref<QForm | null>(null)

const form = ref<StudentFormData>(props.form ?? {
  name: '',
  price: 0,
  comment: '',
  timezone: null,
  currency_id:1,
  paid:0,
  color: '#000000',
  extra: {},
})

const dictionariesStore = useDictionariesStore()
const { currencies } = storeToRefs(dictionariesStore)

dictionariesStore.fetchCurrencies()

const isEdit = computed(() => !!props.form?.id)

const onSubmit = async () => {
  if (formRef.value?.validate() && form.value.timezone) {

    let response

    if (isEdit.value && props.form?.id) {
      response = await studentStore.updateStudent(props.form.id, form.value)
    } else {
      response = await studentStore.postStudent(form.value)
    }

    if (response) finalizeClose()
  }
}

const closeModal = () => finalizeClose()

const resetForm = () => {
  form.value = {
    name: '',
    price: 0,
    comment: '',
    timezone: null,
    currency_id: 1,
    paid:0,
    color: '#000000',
    extra: buildEmptyExtra(),
  }
}

watch(
    () => props.form,
    (val) => {
      if (val) {
        form.value = { ...val, extra: buildEmptyExtra(val.extra) }
      } else {
        resetForm()
      }
    },
    { immediate: true }
)

watch(
    () => props.modelValue,
    async (open) => {
      if (open) {
        await additionalColumnsStore.ensureLoaded()
        form.value.extra = buildEmptyExtra(form.value.extra ?? props.form?.extra)
      }
    },
)

</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="onDialogDismissRequest"
  >
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          {{ isEdit ? 'Edit Student' : 'New Student' }}
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

          <div
            class="row"
            style="column-gap: 16px"
          >
            <div class="col">
              <q-input
                v-model="form.paid"
                filled
                type="number"
                label="Paid"
                :rules="[
                  val => val !== null && val !== '' || 'Enter price',
                  val => val >= 0 || 'Price must be positive'
                ]"
              />
            </div>
            <div class="col-auto">
              <q-input
                v-model="form.color"
                label="Color"
              >
                <template #append>
                  <q-icon name="palette">
                    <q-popup-proxy>
                      <ColorPicker v-model="form.color" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>

          <template v-if="additionalColumns.length">
            <q-separator class="q-my-sm" />
            <div class="text-subtitle2 text-grey-7">
              Additional columns
            </div>
            <div
              v-for="(col, idx) in additionalColumns"
              :key="col.id ?? col.key ?? idx"
            >
              <DynamicField
                v-model="(form.extra as ExtraData)[getColumnKey(col, idx)]"
                :label="col.label"
                :type="col.type"
              />
            </div>
          </template>
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
