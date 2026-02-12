
<template>
  <div class="chart-mask">
    <ChartScrollWrapper v-if="isScrollable">
      <component :is="chartComponent" v-if="chartData" 
        :series="chartData.series" 
        :categories="chartData.categories"
        :colors="colors" />
    </ChartScrollWrapper>

    <!-- fallback kalau nggak scroll -->
    <component v-else :is="chartComponent" v-if="chartData" 
      :series="chartData.series" 
      :categories="chartData.categories"
      :colors="colors" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import ChartScrollWrapper from '@/components/ui/apex-chart/ChartScrollWrapper.vue'
import { URL_GET_DATA } from '@/utils/api'
import { defineAsyncComponent } from 'vue'

const props = defineProps<{
  filterType: string
  chartType?: 'bar' | 'line' | 'area'
}>()


const isScrollable = computed(() => {
  return !['weekly', 'yearly','all'].includes(props.filterType)
})
const chartFilter = useChartFilterStore()

//  Tipe data
interface ChartPoint {
  x: string
  y: number
  goals?: {
    name: string
    value: number
    strokeColor: string
    strokeHeight: number
  }[]
}

interface ChartSeries {
  name: string
  data: (number | ChartPoint)[]
  type?: string,
  yAxisIndex?: number
}

interface ChartData {
  categories: string[]
  series: ChartSeries[]
}

const chartData = ref<ChartData | null>(null)
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches
})

// Komponen chart berdasarkan filterType
const chartComponent = computed(() => {
  return props.filterType === 'monthly'
    ? defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseLineArea.vue'))
    : defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseColumnsMarkers.vue'))
})

//  Warna chart
const colors = computed(() => ['#34d399', '#f43f5e'])

// Default chart type
const defaultChartType = computed(() => {
  return props.filterType === 'monthly' ? 'area' : 'bar'
})

// Ambil data chart dari backend
async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', props.filterType)
    const endpoint = 'dashboard/api/summary/mines/ore'

    // Tambahkan filter parameter
    switch (props.filterType) {
      case 'daily':
        if (chartFilter.date) params.append('filter_date', chartFilter.date)
        break
      case 'weekly':
        if (chartFilter.year) params.append('filter_year', chartFilter.year.toString())
        if (chartFilter.month) params.append('filter_month', chartFilter.month.value.toString())
        if (chartFilter.week) {
          const weekParam = `${chartFilter.year}-${String(chartFilter.week).padStart(2, '0')}`
          params.append('filter_week', weekParam)
        }
        break
      case 'monthly':
        if (chartFilter.year) params.append('filter_year', chartFilter.year.toString())
        if (chartFilter.month) params.append('filter_month', chartFilter.month.value.toString())
        break
      case 'range':
        if (chartFilter.range.start && chartFilter.range.end) {
          params.append('date_start', chartFilter.range.start)
          params.append('date_end', chartFilter.range.end)
        }
        break
      case 'yearly':
        if (chartFilter.year) params.append('filter_year', chartFilter.year.toString())
        break
    }

    const url = `${URL_GET_DATA}${endpoint}?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    // Sesuaikan data berdasarkan filter
    if (props.filterType === 'monthly') {
      chartData.value = {
        categories: data.x_data ?? [],
        series: [
          {
            name: 'Actual',
            type: 'area',
            yAxisIndex: 0, // Axis kiri
            data: data.total_tonnage ?? []
          },
          {
            name: 'Plan',
            type: 'line',
            yAxisIndex: 1, // Axis kanan
            data: data.total_plan ?? []
          }
        ]
      }
    } else {
      chartData.value = {
        categories: data.x_data ?? [],
        series: [
          {
            name: 'Actual',
            type: props.chartType ?? defaultChartType.value,
            data: data.x_data.map((label: string, index: number) => ({
              x: label,
              y: data.total_actual?.[index] ?? 0,
              goals: [{
                name: 'Plan',
                value: data.total_plan?.[index] ?? 0,
                strokeColor: '#f43f5e',
                strokeHeight: 4
              }]
            }))
          }
        ]
      }
    }
  } catch (error) {
    console.warn('Gagal fetch chart mining:', error)
  }
}

// ⏱ Lifecycle
onMounted(fetchChartData)

watch(
  () => [
    props.filterType,
    chartFilter.date,
    chartFilter.week,
    chartFilter.month?.value,
    chartFilter.year,
    chartFilter.range.start,
    chartFilter.range.end
  ],
  fetchChartData
)
</script>

<style scoped>
.chart-mask {
  width: 100%;
  max-width: 100%;
  /* overflow: hidden; */
  overflow-x: auto;
  /* scroll horizontal */
}
</style>
