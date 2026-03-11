<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Line } from 'vue-chartjs'
import {defineProps} from "vue";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps({
  labels: Array,
  datasets: Array
})
console.log(props.data)

const colors = [
  "#42A5F5",
  "#66BB6A",
  "#FFA726",
  "#AB47BC"
]

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => ({
    ...dataset,
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length] + "33",
    tension: 0.3,
    fill: true,
    pointRadius: 5
  }))
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    },
    title: {
      display: true,
      text: 'График дохода по месяцам'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: ''
      }
    }
  }
}
</script>

<template>
  <Line
    :data="chartData"
    :options="chartOptions"
  />
</template>

<style scoped>

</style>
