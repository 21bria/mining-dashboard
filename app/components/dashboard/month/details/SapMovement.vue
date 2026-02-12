
<template>
  <BaseAreaChart
    v-if="chartData"
    :series="chartData.series"
    :categories="chartData.categories"
    :colors="['#34d399']"
  />
</template>


<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import { URL_GET_DATA } from '@/utils/api'
import BaseAreaChart from '@/components/ui/apex-chart/BaseAreaChart.vue'

// Emit ke parent
const emit = defineEmits<{
  (e: 'update:sapGrade', value: any): void
}>()

// Tipe props didefinisikan eksplisit
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

// Ambil filter dari store Pinia
const chartFilter = useChartFilterStore()
const chartData = ref<ChartData | null>(null)
const sapGrade = ref(null)

async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', 'monthly') // sesuai komponen ini
    if (chartFilter.year) params.append('filter_year', chartFilter.year.toString())
    if (chartFilter.month) params.append('filter_month', chartFilter.month.value.toString())

    const url = `${URL_GET_DATA}dashboard/api/chart/detail-quality/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    console.log("Data chart dari backend:", data)

    chartData.value = {
      categories: data.x_data,
      series: [
        { name: 'Saprolite', type: 'area', data: data.y_sap }
      ]
    }
  } catch (error) {
    console.warn('Gagal fetch chart, pakai dummy data:', error)
  }
}

// / Fetch ore grade & emit ke parent
async function fetchGradeOre() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', 'monthly')
    if (chartFilter.year) params.append('year', chartFilter.year.toString())
    if (chartFilter.month) params.append('month', chartFilter.month.value.toString())

    const url = `${URL_GET_DATA}dashboard/api/ore-grade/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    const sapData = data.data.find((item: any) => item.nama_material === 'SAP')
    sapGrade.value = sapData ?? null
    emit('update:sapGrade', sapData) // ✅ emit ke parent
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
