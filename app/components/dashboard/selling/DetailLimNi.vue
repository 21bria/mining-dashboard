<template>
  <div class="chart-mask">
    <component :is="chartComponent" v-if="chartData" :series="chartData.series" :categories="chartData.categories"
      :colors="colors" :details="detailsData" />
  </div>

</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import { URL_GET_DATA } from '@/utils/api'
import { defineAsyncComponent } from 'vue'

// Props & Emits
const emit = defineEmits<{ (e: 'update:limGrade', value: any): void }>()
const props = defineProps<{
  filterType: string
  chartType?: 'bar' | 'area' | 'line'
}>()

// State
const chartFilter = useChartFilterStore()
const chartData = ref<{ categories: string[]; series: any[] } | null>(null)
const limGrade = ref(null)
const detailsData = ref<any[]>([])

// Dynamic chart component
const chartComponent = computed(() =>
  defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseColumnCoa.vue'))
)

const defaultChartType = computed(() =>
  props.filterType === 'monthly' ? 'bar' : 'bar'
)

const colors = computed(() => ['#3b82f6', '#f5b849', '#f43f5e']) // Split vs Official

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

  // 🔹 Hardcode langsung HPAL
  params.append('materialFilter', 'HPAL')

  return params
}

// Fetch Chart Data (compare API)
async function fetchChartData() {
  try {
    const params = buildFilterParams()
    const url = `${URL_GET_DATA}dashboard/api/selling/coa/ni/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    // Sesuai backend: compare + details
    chartData.value = {
      categories: data.compare?.x_data ?? [],
      series: [
        {
          name: 'Ni Internal',
          type: 'column',
          data: data.compare?.y_split ?? []
        },
        {
          name: 'Ni Official',
          type: 'column',
          data: data.compare?.y_official ?? []
        },
        // {
        //   name: 'Diff',
        //   type: 'line',
        //   data: data.compare?.ni_diff ?? []
        // }
      ]
    }

    detailsData.value = data.details ?? []
  } catch (error) {
    console.warn('❌ Gagal fetch chart data compare NI:', error)
  }
}

// Fetch Grade Ore (opsional tetap sama)
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
  // fetchGradeOre()
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
    // fetchGradeOre()
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
