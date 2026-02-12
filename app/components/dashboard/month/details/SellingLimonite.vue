<template>
  <BaseAreaChart
    v-if="chartData"
    :series="chartData.series"
    :categories="chartData.categories"
    :colors="[ '#f43f5e','#f5b849']"
  />
</template>


<script setup lang="ts">
import BaseAreaChart from '@/components/ui/apex-chart/BaseAreaChart.vue'
import { computed } from 'vue'

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
const limGrade = ref(null)

// Fetch chart
async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', 'monthly') // sesuai komponen ini
    if (chartFilter.year) params.append('year', chartFilter.year.toString())
    if (chartFilter.month) params.append('month', chartFilter.month.value.toString())

    const url = `${URL_GET_DATA}dashboard/api/selling-chart/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    console.log("Data chart dari backend:", data)

    chartData.value = {
      categories: data.x_data,
      series: [
        { name: 'Plan', type: 'area', data: data.y_lim_plan },
        { name: 'Limonite', type: 'area', data: data.y_lim_actual }

      ]
    }
  } catch (error) {
    console.warn('Gagal fetch chart:', error)
  }
}

// Fetch ore grade & emit ke parent
async function fetchGradeOre() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', 'monthly')
    if (chartFilter.year) params.append('year', chartFilter.year.toString())
    if (chartFilter.month) params.append('month', chartFilter.month.value.toString())

    const url = `${URL_GET_DATA}dashboard/api/ore-grade/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    const limData = data.data.find((item: any) => item.nama_material === 'LIM')
    limGrade.value = limData ?? null
    emit('update:limGrade', limData) // ✅ emit ke parent
  } catch (error) {
    console.warn('❌ Gagal fetch ore grade:', error)
  }
}

onMounted(() => {
  fetchChartData()
  fetchGradeOre()
})

watch(() => [chartFilter.year, chartFilter.month], () => {
  fetchChartData()
  fetchGradeOre()
})
</script>

