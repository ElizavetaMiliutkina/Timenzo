<script setup lang="ts">
import { ref, watch } from 'vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

const model = defineModel<string | null>()

const color = ref(model.value || '#f17000')

watch(color, (val) => {
  model.value = val
})

watch(
  () => model.value,
  (val) => {
    const next = val || '#f17000'
    if (next !== color.value) {
      color.value = next
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="color-picker-wrapper">
    <ColorPicker
      v-model:pure-color="color"
      format="rgb"
      shape="square"
      use-type="both"
      :is-widget="true"
      lang="En"
    />

    <!-- пресеты как на скрине -->
    <div class="preset-row q-mt-md">
      <div
        v-for="c in presets"
        :key="c"
        class="preset"
        :style="{ background: c }"
        @click="color = c"
      />
    </div>
  </div>
</template>

<script lang="ts">
const presets = [
  '#f44336', '#ff9800', '#ffeb3b', '#4caf50',
  '#2196f3', '#9c27b0', '#795548', '#607d8b',
  '#000000', '#ffffff'
]
</script>

<style scoped>
.color-picker-wrapper {
  width: 260px;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #ddd;
}
</style>