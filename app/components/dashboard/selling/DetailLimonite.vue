<template>
  <div class="chart-mask" :class="{ scrollable: isScrollable }">
    <component
    :is="chartComponent"
    v-if="chartData"
    :series="chartData.series"
    :categories="chartData.categories"
    :colors="colors"
    :details="detailsData"
  />
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

// Dynamic komponen chart
const chartComponent = computed(() =>
  props.filterType === 'monthly'
    ? defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseStackedColumnsLim.vue'))
     : defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseStackedColumnsLim.vue'))
)

const defaultChartType = computed(() =>
  props.filterType === 'monthly' ? 'bar' : 'bar'
)

const colors = computed(() => ['#f5b849', '#f43f5e']) // Limonite, Plan


interface DetailItem {
  label: string
  total_actual: number
  lim_actual: number
  sap_actual: number
  barges: string[]
}

const detailsData = ref<DetailItem[]>([])
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
    const url = `${URL_GET_DATA}dashboard/api/selling-chart/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    chartData.value = {
      categories: data.summary.x_data ?? [],
      series: [
        {
          name: 'Limonite',
          type: props.chartType ?? defaultChartType.value,
          data: data.summary.y_data_lim ?? []
        },
          {
          name: 'Plan',
          type: 'line',
          data: data.summary.y_plan_lim ?? []
        }
      ]
    }

    // 📦 Simpan details untuk tabel atau tooltip
    detailsData.value = data.details ?? []
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
