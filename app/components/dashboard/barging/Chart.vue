<!-- <template>
  <component :is="chartComponent" v-if="chartData" :series="chartData.series" :categories="chartData.categories"
    :colors="colors" />
</template> -->
<template>
  <div class="chart-mask" :class="{ scrollable: isScrollable }">
    <component :is="chartComponent" v-if="chartData" :series="chartData.series" :categories="chartData.categories"
    :colors="colors" />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import { URL_GET_DATA } from '@/utils/api'


const chartComponent = computed(() =>
  props.filterType === 'monthly'
    ? defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseColumnsStackMarkers.vue'))
    : defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseColumnsStackMarkers.vue'))
)


const colors = computed(() => [
  '#e6f598',
  '#fee08b', 
  '#abdda4', 
  '#fdae61',
  '#6caa9f', 
  '#f46d44', 
  '#5e4fa2',
  '#a0aa5d',  // Cyan

])

// Props dari parent (opsional, jika kamu tidak pakai Pinia langsung)
const props = defineProps<{
  filterType: string
  chartType?: 'bar'
}>()

const isScrollable = computed(() => {
  return !['weekly', 'yearly','all'].includes(props.filterType)
})

interface ChartPoint {
  x: string | number
  y: number
  goals?: {
    name: string
    value: number
    strokeColor?: string
    strokeHeight?: number
    strokeDashArray?: number
  }[]
}

interface ChartSeries {
  name: string
  data: ChartPoint[]
  type: string
}

interface ChartData {
  categories: string[]
  series: ChartSeries[]
}
interface BargeDetail {
  barge_code: string
  total: number
  lim: number
  sap: number
}
interface Detail {
  label: string
  total_plan: number
  barges: BargeDetail[]
}

const chartFilter = useChartFilterStore()
const chartData = ref<ChartData | null>(null)



async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', props.filterType)
    const endpoint = 'dashboard/api/barging-chart/group/'

    switch (props.filterType) {
      case 'daily':
        if (chartFilter.date) params.append('filter_date', chartFilter.date)
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
      case 'all':
        // no additional param
        break
    }

    const url = `${URL_GET_DATA}${endpoint}?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    // Bentuk respons dari endpoint bisa beda
    const details: Detail[] = data.details || []

    const bargeCodes: string[] = [
      ...new Set(details.flatMap(d => d.barges.map(b => b.barge_code)))
    ]

    // Susun series stacked per barge
    // 1. Series untuk setiap barge (stacked bar)
    const bargeSeries: ChartSeries[] = bargeCodes.map(barge => ({
      name: barge,
      type: "bar",
      data: details.map(d => {
        const found = d.barges.find(b => b.barge_code === barge)
        return {
          x: d.label,
          y: found ? found.total : 0,
          detail: d
        }
      })
    }))

    // 2. Series tambahan untuk Plan (line)
    const planSeries: ChartSeries = {
      name: "Plan",
      type: "line",
      data: details.map(d => ({
        x: d.label,
        y: d.total_plan ?? 0
      }))
    }

    // 3. Gabungkan semua series
    const series: ChartSeries[] = [...bargeSeries, planSeries]
    // 4. Update chartData
    chartData.value = {
      categories: details.map(d => String(d.label)),
      series
    }


  } catch (error) {
    console.warn('❌ Gagal fetch data chart:', error)
  }
}


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
  /* max-width: 100%; */
  min-width: 600px; /* atau props.chartData.series.length * 40 */
  overflow-x: auto;
}

</style>
