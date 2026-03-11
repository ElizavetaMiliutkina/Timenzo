<script setup lang="ts">
import LineGraph from "@/components/graphs/LineGraph.vue";
import {onMounted, ref, watch} from 'vue'
import { useCalendarStore } from '@/store/calendar'
import {Dataset} from "@/types/calendar";


const calendarStore = useCalendarStore()

const period = ref(3)
const labels = ref<string[]>([])
const datasets = ref<Dataset[]>([])


const getGraphData = async () => {
  await calendarStore.incomeGraph(period.value)
  labels.value = calendarStore.graphData?.labels ?? []
  datasets.value = calendarStore.graphData?.datasets ?? []
}

onMounted(async () => {
  await getGraphData()
})

watch(
    () => calendarStore.graphData,
    (newData) => {
      labels.value = newData ? newData.labels : []
      datasets.value = newData ? newData.datasets : []
    },
    { deep: true }
)

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
      v-model="period"
      rounded
      outlined
      :options="periods"
      label="Period"
      emit-value
      map-options
      style="width: 200px"
      menu-anchor="bottom left"
      menu-self="top left"
      behavior="menu"
    />
  </div>
  <line-graph
    v-if="datasets.length"
    :labels="labels"
    :datasets="datasets"
  />
  <div v-if="datasets">
    <b>RESULT:</b>
    <div
      v-for="set in datasets"
      :key="set.label"
    >
      <div>
        {{ set.label }} — {{ set.data.reduce((a,b) => a + b, 0) }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
