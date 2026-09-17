<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AdditionalColumnType } from '@/types/additionalColumns'
import type { ExtraValue } from '@/types/students'

const props = defineProps<{
  modelValue: ExtraValue | undefined
  label: string
  type: AdditionalColumnType
  minimal?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ExtraValue): void
}>()

const value = computed<ExtraValue>({
  get: () => (props.modelValue ?? (props.type === 'boolean' ? false : '')) as ExtraValue,
  set: (v) => emit('update:modelValue', v),
})

const fieldRef = ref<{ focus: () => void } | null>(null)

defineExpose({
  focus: () => fieldRef.value?.focus(),
})
</script>

<template>
  <q-toggle
    v-if="type === 'boolean'"
    ref="fieldRef"
    v-model="value as boolean"
    :label="minimal ? undefined : label"
    :dense="minimal"
  />

  <q-input
    v-else-if="type === 'textarea'"
    ref="fieldRef"
    v-model="value as string"
    :filled="!minimal"
    :borderless="minimal"
    :dense="minimal"
    type="textarea"
    autogrow
    :label="minimal ? undefined : label"
  />

  <q-input
    v-else-if="type === 'number'"
    ref="fieldRef"
    v-model.number="value as number"
    :filled="!minimal"
    :borderless="minimal"
    :dense="minimal"
    type="number"
    :label="minimal ? undefined : label"
  />

  <q-input
    v-else-if="type === 'date'"
    ref="fieldRef"
    v-model="value as string"
    :filled="!minimal"
    :borderless="minimal"
    :dense="minimal"
    :label="minimal ? undefined : label"
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
    ref="fieldRef"
    v-model="value as string"
    :filled="!minimal"
    :borderless="minimal"
    :dense="minimal"
    :label="minimal ? undefined : label"
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
    ref="fieldRef"
    v-model="value as string"
    :filled="!minimal"
    :borderless="minimal"
    :dense="minimal"
    type="email"
    :label="minimal ? undefined : label"
  />

  <q-input
    v-else-if="type === 'link'"
    ref="fieldRef"
    v-model="value as string"
    :filled="!minimal"
    :borderless="minimal"
    :dense="minimal"
    type="url"
    :label="minimal ? undefined : label"
  />

  <q-input
    v-else-if="type === 'phone'"
    ref="fieldRef"
    v-model="value as string"
    :filled="!minimal"
    :borderless="minimal"
    :dense="minimal"
    type="tel"
    :label="minimal ? undefined : label"
  />

  <q-input
    v-else
    ref="fieldRef"
    v-model="value as string"
    :filled="!minimal"
    :borderless="minimal"
    :dense="minimal"
    :label="minimal ? undefined : label"
  />
</template>
