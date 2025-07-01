<script setup>
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

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const chartData = {
  labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
  datasets: [
    {
      label: 'Income ($)',
      data: [1200, 1900, 3000, 2500, 3100, 4000],
      borderColor: '#42A5F5',
      backgroundColor: 'rgba(66, 165, 245, 0.2)',
      tension: 0.3,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 7
    }
  ]
}

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
        text: '$'
      }
    }
  }
}
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<style scoped>

</style>
