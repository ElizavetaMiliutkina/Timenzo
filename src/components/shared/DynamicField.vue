<script setup lang="ts">
import { computed } from 'vue'
import type { AdditionalColumnType } from '@/types/additionalColumns'
import type { ExtraValue } from '@/types/students'

const props = defineProps<{
  modelValue: ExtraValue | undefined
  label: string
  type: AdditionalColumnType
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ExtraValue): void
}>()

const value = computed<ExtraValue>({
  get: () => (props.modelValue ?? (props.type === 'boolean' ? false : '')) as ExtraValue,
  set: (v) => emit('update:modelValue', v),
})
</script>

<template>
  <q-toggle
    v-if="type === 'boolean'"
    v-model="value as boolean"
    :label="label"
  />

  <q-input
    v-else-if="type === 'textarea'"
    v-model="value as string"
    filled
    type="textarea"
    autogrow
    :label="label"
  />

  <q-input
    v-else-if="type === 'number'"
    v-model.number="value as number"
    filled
    type="number"
    :label="label"
  />

  <q-input
    v-else-if="type === 'date'"
    v-model="value as string"
    filled
    :label="label"
    placeholder="YYYY-MM-DD"
    mask="####-##-##"
  >
    <template #append>
      <q-icon
        name="event"
        class="cursor-pointer"
      >
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            v-model="value as string"
            mask="YYYY-MM-DD"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>

  <q-input
    v-else-if="type === 'datetime'"
    v-model="value as string"
    filled
    :label="label"
    placeholder="YYYY-MM-DD HH:mm"
    mask="####-##-## ##:##"
  >
    <template #append>
      <q-icon
        name="event"
        class="cursor-pointer"
      >
        <q-popup-proxy cover>
          <q-date
            v-model="value as string"
            mask="YYYY-MM-DD HH:mm"
          />
        </q-popup-proxy>
      </q-icon>
      <q-icon
        name="access_time"
        class="cursor-pointer"
      >
        <q-popup-proxy cover>
          <q-time
            v-model="value as string"
            mask="YYYY-MM-DD HH:mm"
            format24h
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>

  <q-input
    v-else-if="type === 'email'"
    v-model="value as string"
    filled
    type="email"
    :label="label"
  />

  <q-input
    v-else-if="type === 'link'"
    v-model="value as string"
    filled
    type="url"
    :label="label"
  />

  <q-input
    v-else-if="type === 'phone'"
    v-model="value as string"
    filled
    type="tel"
    :label="label"
  />

  <q-input
    v-else
    v-model="value as string"
    filled
    :label="label"
  />
</template>
