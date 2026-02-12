<script setup lang="ts">
import BaseAreaChart from '@/components/ui/apex-chart/BaseAreaChart.vue'
import { computed } from 'vue'


interface ChartSeries {
  name: string
  data: number[]
  type: string
}

interface ChartData {
  categories: string[]
  series: ChartSeries[]
}

const chartFilter = useChartFilterStore()

const chartData = ref<ChartData | null>(null)

// 🔁 Buat data dummy 30 hari terakhir dengan nilai acak
const today = new Date()
const dummyData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(today)
  date.setDate(today.getDate() - (29 - i)) // urut mundur

  const actual = Math.floor(Math.random() * 500) + 100
  const plan = actual + Math.floor(Math.random() * 100) - 100 // plan +-100 dari actual

   const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // bulan 0–11
  const year = String(date.getFullYear()).slice(-2) // ambil dua digit terakhir

  return {
    date: `${day}-${month}-${year}`, // 👉 jadi 25-06-24
    actual,
    plan,
  }

  // return {
  //   date: date.toISOString().slice(0, 10), // format YYYY-MM-DD
  //   actual,
  //   plan,
  // }
})

// ⛓️ Ubah jadi format ApexChart
// const chartData = computed(() => {
//   const categories = dummyData.map(item => item.date)
//   const series = [
//     {
//       name: 'Actual',
//       data: dummyData.map(item => item.actual)
//     },
//     {
//       name: 'Plan',
//       data: dummyData.map(item => item.plan)
//     }
//   ]
//   return { categories, series }
// })


async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', 'monthly') // sesuai komponen ini
    if (chartFilter.year) params.append('filter_year', chartFilter.year.toString())
    if (chartFilter.month) params.append('filter_month', chartFilter.month.value.toString())

    const url = `${URL_GET_DATA}dashboard/api/summary/mines/ore?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    console.log("Data chart dari backend:", data)

    chartData.value = {
      categories: data.x_data,
      series: [
         { name: 'Plan', type: 'area', data: data.total_plan },
        { name: 'Actual', type: 'area', data: data.total_tonnage }
       
      ]
    }
  } catch (error) {
    console.warn('Gagal fetch chart, pakai dummy data:', error)
   
  }
}

// Initial load
onMounted(fetchChartData)

// Re-fetch jika bulan atau tahun berubah
watch(() => [chartFilter.year, chartFilter.month], fetchChartData)

</script>

<template>
  <BaseAreaChart
    v-if="chartData"
    :series="chartData.series"
    :categories="chartData.categories"
    :colors="['#f43f5e','#34d399']"
  />
</template>
