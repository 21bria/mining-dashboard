<template>
  <component :is="chartComponent" v-if="chartData" :series="chartData.series" :categories="chartData.categories"
    />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import { URL_GET_DATA } from '@/utils/api'
const chartComponent = computed(() =>
  defineAsyncComponent(() =>
    import('@/components/ui/apex-chart/HorizontalBarChart.vue')
  )
)

// Props dari parent (opsional, jika kamu tidak pakai Pinia langsung)
const props = defineProps<{
  filterType: string
  chartType?: 'bar'
}>()


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


const defaultChartType = computed(() => 'bar')

const emit = defineEmits<{
  (e: 'update:grandTotal', value: number): void
}>()

async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    const filterType = props.filterType
    params.append('filter_type', filterType)

    let endpoint = 'dashboard/api/fuel/summary/vendors/'

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
          name: 'Volume',
          type: props.chartType ?? defaultChartType.value,
          data: data.y_data ?? [],
        },
      ],
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
