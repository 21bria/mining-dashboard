<template>
  <div class="chart-mask" :class="{ scrollable: isScrollable }">
    <component :is="BaseLineColumnArea" v-if="chartData" 
    :series="chartData.series" 
    :categories="chartData.categories"
    :colors="colors" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import { URL_GET_DATA } from '@/utils/api'
import BaseLineColumnArea from '@/components/ui/apex-chart/BaseLineColumnArea.vue'

const props = defineProps<{ filterType: string }>()

const chartFilter = useChartFilterStore()

interface ChartSeries {
  name: string
  data: number[]
  type: string
}

interface ChartData {
  categories: string[]
  series: ChartSeries[]
}

const chartData = ref<ChartData | null>(null)

const isScrollable = computed(() => {
  return !['weekly', 'yearly','all'].includes(props.filterType)
})

const colors = computed(() => ['#22c55e', '#f97316', '#6366f1'])

const chartTypeConfig = computed(() => {
  return props.filterType === 'monthly'
    ? { stock: 'area', selling: 'area', balance: 'line' }
    : { stock: 'bar', selling: 'bar', balance: 'line' }
})

async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', props.filterType)
    const endpoint = 'dashboard/api/inventory-chart/'

    switch (props.filterType) {
      case 'daily':
        if (chartFilter.date) params.append('daily', chartFilter.date)
        break
      case 'weekly':
        if (chartFilter.year) params.append('year', chartFilter.year.toString())
        if (chartFilter.month) params.append('month', chartFilter.month.value.toString())
        if (chartFilter.week) {
          const week = `${chartFilter.year}-${String(chartFilter.week).padStart(2, '0')}`
          params.append('week', week)
        }
        break
      case 'monthly':
        if (chartFilter.year) params.append('year', chartFilter.year.toString())
        if (chartFilter.month) params.append('month', chartFilter.month.value.toString())
        break
      case 'range':
        if (chartFilter.range.start) params.append('date_start', chartFilter.range.start)
        if (chartFilter.range.end) params.append('date_end', chartFilter.range.end)
        break
      case 'yearly':
        if (chartFilter.year) params.append('year', chartFilter.year.toString())
        break
    }

    const url = `${URL_GET_DATA}${endpoint}?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    chartData.value = {
      categories: data.x_data,
      series: [
        { name: 'Production In', type: chartTypeConfig.value.stock, data: data.y_data_stock },
        { name: 'Selling', type: chartTypeConfig.value.selling, data: data.y_data_out },
        { name: 'Stock Opname', type: chartTypeConfig.value.balance, data: data.y_data_balance }
      ]
    }
  } catch (error) {
    console.warn('❌ Gagal fetch chart inventory:', error)
  }
}

onMounted(fetchChartData)
watch(
  () => [
    props.filterType,
    chartFilter.date,
    chartFilter.month?.value,
    chartFilter.year,
    chartFilter.week,
    chartFilter.range.start,
    chartFilter.range.end
  ],
  fetchChartData
)
</script>
<style scoped>
.chart-mask {
  width: 100%;
  /* max-width: 100%; */
  min-width: 600px; /* atau props.chartData.series.length * 40 */
  overflow-x: auto;
}

</style>
