<template>
  <BaseLineColumnArea v-if="chartData" :series="chartData.series" :categories="chartData.categories"
    :colors="['#f97316', '#22c55e', '#6366f1']" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseLineColumnArea from '@/components/ui/apex-chart/BaseLineColumnArea.vue'


// Emit ke parent
const emit = defineEmits<{
  (e: 'update:limGrade', value: any): void
}>()

// Props dari parent
const props = defineProps<{
  filterType: string
  filterYear?: string
  filterMonth?: string
  filterWeek?: string
  dateStart?: string
  dateEnd?: string
}>()

interface ChartSeries {
  name: string
  data: number[]
  type?: string
}

interface ChartData {
  categories: string[]
  series: ChartSeries[]
}
const chartFilter = useChartFilterStore()
const chartData = ref<ChartData | null>(null)

// Fetch chart
async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', 'monthly') // sesuai komponen ini
    if (chartFilter.year) params.append('year', chartFilter.year.toString())
    if (chartFilter.month) params.append('month', chartFilter.month.value.toString())

    const url = `${URL_GET_DATA}dashboard/api/inventory/chart/details/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    console.log("Data chart dari backend:", data)

    chartData.value = {
      categories: data.x_data,
      series: [
        { name: 'Limonite', type: 'area', data: data.y_lim_in },
        { name: 'Selling', type: 'area', data: data.y_lim_out },
        { name: 'Blance', type: 'line', data: data.y_lim_balance }

      ]
    }
  } catch (error) {
    console.warn('Gagal fetch chart:', error)
  }
}
onMounted(() => {
  fetchChartData()
})

watch(() => [chartFilter.year, chartFilter.month], () => {
  fetchChartData()
})
</script>
