<script setup lang="ts">
import LineGraph from "@/components/graphs/LineGraph.vue";
import {onMounted, ref, watch} from 'vue'
import { useCalendarStore } from '@/store/calendar'

const calendarStore = useCalendarStore()

const period = ref(3)
const labels = ref<string[]>([])
const data = ref<number[]>([])


const getGraphData = async () => {
  await calendarStore.incomeGraph(period.value)
  labels.value = calendarStore.graphData ? calendarStore.graphData.labels : []
  data.value =calendarStore.graphData ? calendarStore.graphData.data : []
}

onMounted(async () => {
  await getGraphData()
})

watch(
    () => calendarStore.graphData,
    (newData) => {
      labels.value = newData ? newData.labels : []
      data.value = newData ? newData.data : []
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
    v-if="data.length"
    :labels="labels"
    :data="data"
  />
</template>

<style scoped>

</style>
