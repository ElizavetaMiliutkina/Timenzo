<script setup lang="ts">
import MyInput from '@/components/test/MyInput.vue'
import {ref, watch} from 'vue'

const inputVal = ref('')

watch(inputVal, () => {
  console.log(inputVal, 'inputVal')
})

</script>
<template>
  <p>Значение: {{ inputVal }}</p>
  <MyInput
    v-slot="{user}"
    v-model="inputVal"
  >
    <div>
      {{ user }}
    </div>
  </MyInput>
</template>
