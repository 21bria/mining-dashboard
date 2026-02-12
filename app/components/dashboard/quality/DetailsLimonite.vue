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
import { ref, watch, onMounted, computed } from 'vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import { URL_GET_DATA } from '@/utils/api'
import { defineAsyncComponent } from 'vue'

const emit = defineEmits<{ (e: 'update:limGrade', value: any): void }>()

const props = defineProps<{
  filterType: string
  chartType?: 'bar' | 'area' | 'line'
}>()

const isScrollable = computed(() => {
  return !['weekly', 'yearly','all'].includes(props.filterType)
})

const chartFilter = useChartFilterStore()
const chartData = ref<{ categories: string[]; series: any[] } | null>(null)
const limGrade = ref(null)

//Pilih komponen chart berdasarkan filter
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

// 🎨 Warna grafik per filter
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

const defaultChartType = computed(() => {
  switch (props.filterType) {
    case 'daily':
    case 'weekly':
      return 'bar'
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


// Gunakan helper agar reusable
function createSeries(name: string, data: number[] | undefined) {
  return {
    name,
    type: (props.chartType ?? defaultChartType.value) as 'bar' | 'area' | 'line',
    data: data ?? []
  }
}


function buildFilterParams(filterType: string, chartFilter: any): URLSearchParams {
  const params = new URLSearchParams()
  params.append('filter_type', filterType)

  switch (filterType) {
    case 'daily':
      if (chartFilter.date) {
        params.append('filter_date', chartFilter.date)
      }
      break

    case 'weekly':
      if (chartFilter.year) {
        params.append('year', chartFilter.year.toString())
      }
      if (chartFilter.month) {
        params.append('month', chartFilter.month.value.toString())
      }
      if (chartFilter.week) {
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
      if (chartFilter.range.start) params.append('date_start', chartFilter.range.start)
      if (chartFilter.range.end) params.append('date_end', chartFilter.range.end)
      break

    case 'yearly':
      if (chartFilter.year) {
        params.append('year', chartFilter.year.toString())
      }
      break

    case 'all':
      // tidak perlu tambahan
      break
  }

  return params
}

async function fetchChartData() {
  try {
    const params = buildFilterParams(props.filterType, chartFilter)

    const url = `${URL_GET_DATA}dashboard/api/chart/detail-quality/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    chartData.value = {
      categories: data.x_data ?? [],
      series: [
        createSeries('Limonite', data.y_lim),
      ]
    }
  } catch (error) {
    console.warn('❌ Gagal fetch chart:', error)
  }
}

async function fetchGradeOre() {
  try {
    const params = buildFilterParams(props.filterType, chartFilter)

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
  min-width: 600px; /* atau props.chartData.series.length * 40 */
  overflow-x: auto;
}
</style>