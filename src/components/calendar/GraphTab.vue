<script setup lang="ts">
import LineGraph from "@/components/graphs/LineGraph.vue";
import {onMounted, ref} from 'vue'
import {incomeGraph} from '@/services/calendar'

const period = ref(1)

onMounted(async () => {
  await incomeGraph(period.value)
})

const periods = [
  { label: '1 month', value: 1 },
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '1 year', value: 12 }
]


</script>

<template>
  <div class="flex justify-end">
    {{period}}
    <q-select
        rounded
        outlined
        v-model="period"
        :options="periods"
        label="Period"
        emit-value
        map-options
        style="width: 200px"
    />
  </div>
  <line-graph />
</template>

<style scoped>

</style>
