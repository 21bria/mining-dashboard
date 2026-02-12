<template>
  <div class="chart-mask" :class="{ scrollable: isScrollable }">
    <component :is="chartComponent" v-if="chartData" 
      :series="chartData.series" 
      :categories="chartData.categories"
      ore-type="LIM" :colors="colors" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import { URL_GET_DATA } from '@/utils/api'
import { defineAsyncComponent } from 'vue'

// Emits ke parent untuk update limGrade
const emit = defineEmits<{ (e: 'update:limGrade', value: any): void }>()

// Props dari parent
const props = defineProps<{
  filterType: string
  chartType?: 'bar' | 'area' | 'line'
}>()

const isScrollable = computed(() => {
  return !['weekly', 'yearly','all'].includes(props.filterType)
})

// Setup
const chartFilter = useChartFilterStore()
const chartData = ref<{ categories: string[]; series: any[] } | null>(null)
const limGrade = ref(null)

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


interface BargeDetail {
  barge_code: string
  total: number
  lim: number
  sap: number
}
interface Detail {
  label: string
  lim_plan: number
  barges: BargeDetail[]
}

// Dynamic komponen chart
const chartComponent = computed(() =>
  props.filterType === 'monthly'
    ? defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseColumnsStackMarkersDetails.vue'))
    : defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseColumnsStackMarkersDetails.vue'))
)

const defaultChartType = computed(() =>
  props.filterType === 'monthly' ? 'bar' : 'bar'
)

const colors = computed(() => [
  '#f1c363', // Yellow
  '#d2c08d',
  '#fee08b',
  '#fdae61',
  '#f46d44', 
  '#d5c366', 
  '#22d3ee',  // Cyan
]) // Limonite Series colors

// Helper params
function buildFilterParams(): URLSearchParams {
  const params = new URLSearchParams()
  params.append('filter_type', props.filterType)

  switch (props.filterType) {
    case 'daily':
      if (chartFilter.date) params.append('filter_date', chartFilter.date)
      break
    case 'weekly':
      if (chartFilter.year) params.append('year', chartFilter.year.toString())
      if (chartFilter.month) params.append('month', chartFilter.month.value.toString())
      if (chartFilter.week) {
        const weekParam = `${chartFilter.year}-${String(chartFilter.week).padStart(2, '0')}`
        params.append('week', weekParam)
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

  return params
}

// Fetch Chart
async function fetchChartData() {
  try {
    const params = buildFilterParams()
    const url = `${URL_GET_DATA}dashboard/api/barging-chart/group/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()


    // Bentuk respons dari endpoint bisa beda
    const details: Detail[] = data.details || []

    // 1. Ambil semua barge unik
    const bargeCodes: string[] = [
      ...new Set(details.flatMap(d => d.barges.map(b => b.barge_code)))
    ]


    // Susun series stacked per barge
    // 2. Series untuk setiap barge (stacked bar khusus LIM)
    const bargeSeries: ChartSeries[] = bargeCodes.map(barge => ({
      name: barge,
      type: "bar",
      data: details.map(d => {
        const found = d.barges.find(b => b.barge_code === barge)
        return {
          x: d.label,
          y: found ? found.lim ?? 0 : 0, // 👉 pakai LIM saja
          detail: d
        }
      })
    }))

    // 3. Series tambahan untuk Plan (line khusus LIM)
    const planSeries: ChartSeries = {
      name: "Plan (LIM)",
      type: "line",
      data: details.map(d => ({
        x: d.label,
        y: d.lim_plan ?? 0 // 👉 pakai lim_plan
      }))
    }

    // 4. Gabungkan series LIM
    const series: ChartSeries[] = [...bargeSeries, planSeries]

    // 5. Update chartData (khusus LIM)
    chartData.value = {
      categories: details.map(d => String(d.label)),
      series
    }

  } catch (error) {
    console.warn('❌ Gagal fetch chart data limonite:', error)
  }
}

// Fetch Grade Ore
async function fetchGradeOre() {
  try {
    const params = buildFilterParams()
    const url = `${URL_GET_DATA}dashboard/api/ore-grade/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    const limData = data.data.find((item: any) => item.nama_material === 'LIM')
    limGrade.value = limData ?? null
    emit('update:limGrade', limData)
  } catch (error) {
    console.warn('❌ Gagal fetch ore grade:', error)
  }
}

// Lifecycle
onMounted(() => {
  fetchChartData()
  fetchGradeOre()
})

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
  () => {
    fetchChartData()
    fetchGradeOre()
  }
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
