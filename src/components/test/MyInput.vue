<script setup lang="ts">
import {defineProps, defineEmits, ref} from 'vue'

const props = defineProps<{
    modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const user = ref({ name: 'Liza', age: 25 })

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

</script>

<template>
  <input
    :value="modelValue"
    @input="onInput"
  >
  <slot />
  <p>Конец компонента</p>
  <div>
    <slot :user="user" />
  </div>
</template>
