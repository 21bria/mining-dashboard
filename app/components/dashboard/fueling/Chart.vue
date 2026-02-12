<!-- <template>
  <component :is="chartComponent" v-if="chartData" :series="chartData.series" :categories="chartData.categories"
    :colors="colors" />
</template> -->

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
import { ref, watch, onMounted } from 'vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import { URL_GET_DATA } from '@/utils/api'

const chartComponent = computed(() => {
  switch (props.filterType) {
    case 'daily':
      return defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseColumnsMarkers.vue'))
    case 'weekly':
      return defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseLineColumnArea.vue'))
    case 'monthly':
      return defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseAreaChart.vue'))
    case 'range':
    case 'yearly':
    case 'all':
      return defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseLineColumnArea.vue'))
    default:
      return defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseAreaChart.vue'))
  }
})

const colors = computed(() => {
  switch (props.filterType) {
    case 'daily':
      return ['#34d399', '#f43f5e']
    case 'weekly':
      return ['#f5b849', '#34d399']
    case 'monthly':
      return ['#f5b849', '#34d399']
    case 'yearly':
      return ['#f5b849', '#34d399']
    default:
      return ['#f5b849', '#34d399']
  }
})

// Props dari parent (opsional, jika kamu tidak pakai Pinia langsung)
const props = defineProps<{
  filterType: string
  chartType?: 'bar' | 'area' | 'line'
}>()

const isScrollable = computed(() => {
  return !['weekly', 'yearly','all'].includes(props.filterType)
})

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

const defaultChartType = computed(() => {
  switch (props.filterType) {
    case 'daily':
    // case 'weekly':
    //   return 'bar'
    case 'monthly':
      return 'area'
    case 'range':
    case 'yearly':
    case 'all':
      return 'bar'
    default:
      return 'bar'
  }
})

const emit = defineEmits<{
  (e: 'update:grandTotal', value: number): void
}>()

async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    const filterType = props.filterType
    params.append('filter_type', filterType)

    let endpoint = 'dashboard/api/fuel/summary/'

    // Handle berdasarkan jenis filter
    switch (filterType) {
      case 'daily':
        if (chartFilter.date) params.append('filter_date', chartFilter.date)
        break
      case 'weekly':
        if (chartFilter.year) {
          params.append('year', chartFilter.year.toString())
        }
        if (chartFilter.month) {
          params.append('month', chartFilter.month.value.toString())
        }
        if (chartFilter.year && chartFilter.week) {
          const weekParam = `${chartFilter.year}-${String(chartFilter.week).padStart(2, '0')}`
          params.append('week', weekParam)
        }
        break

      case 'monthly':
        if (chartFilter.year) {
          params.append('year', chartFilter.year.toString())
        }
        if (chartFilter.month) {
          params.append('month', chartFilter.month.value.toString())
        }
        break

      case 'range':
        if (chartFilter.range.start && chartFilter.range.end) {
          params.append('date_start', chartFilter.range.start)
          params.append('date_end', chartFilter.range.end)
        }
        break

      case 'yearly':
        if (chartFilter.year) {
          params.append('year', chartFilter.year.toString())
        }
        break

      case 'all':
        // tidak butuh tambahan param
        break

      default:
        console.warn('Filter type tidak dikenal:', filterType)
        return
    }

    const url = `${URL_GET_DATA}${endpoint}?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    // Bentuk respons dari endpoint bisa beda
    chartData.value = {
      categories: data.x_data ?? [],
      series: [
        {
          name: 'Fuel Volume',
          type: props.chartType ?? defaultChartType.value,
          data: data.y_data ?? []
        },
      ]
    }
    //  emit ke parent
    emit('update:grandTotal', data.grand_total ?? 0)
  } catch (error) {
    console.warn('Gagal fetch data chart:', error)
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
  min-width: 600px; /* atau props.chartData.series.length * 40 */
  overflow-x: hidden;
}

</style>
