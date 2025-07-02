<script setup lang="ts">
import LineGraph from "@/components/graphs/LineGraph.vue";
import {onMounted, ref, watch} from 'vue'
import {incomeGraph} from '@/services/calendar'

const period = ref(3)
const labels = ref([])
const data = ref([])


const getGraphData = async () => {
  let response = await incomeGraph(period.value)
  labels.value = response.labels
  data.value = response.data
}

onMounted(async () => {
  await getGraphData()
})

const periods = [
  { label: '1 month', value: 1 },
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '1 year', value: 12 }
]

watch(period, async () => {
  await getGraphData()
})



</script>

<template>
  <div class="flex justify-end">
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
  <line-graph v-if="data.length" :labels="labels" :data="data" />
</template>

<style scoped>

</style>
