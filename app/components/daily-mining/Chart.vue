<!-- <template>
  <BaseColumnsMarkers v-if="chartData" :series="chartData.series" :categories="chartData.categories" :colors="colors" />
</template> -->
<template>
  <div class="chart-mask">
    <component :is="BaseColumnsMarkers" v-if="chartData" 
    :series="chartData.series" 
    :categories="chartData.categories"
    :colors="colors" />
  </div>
</template>


<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useDailyFilterStore } from '~/stores/filters/daily-filter'
import { URL_GET_DATA } from '@/utils/api'
import BaseColumnsMarkers from '@/components/ui/apex-chart/BaseColumnsMarkers.vue'

const chartFilter = useDailyFilterStore()

// Types
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
  type: 'bar'
  data: ChartPoint[]
}

interface ChartData {
  categories: string[]
  series: ChartSeries[]
}

const chartData = ref<ChartData | null>(null)
const colors = ['#34d399', '#f43f5e']

// Fetch chart DAILY
async function fetchChartData() {
  if (!chartFilter.date) return

  try {
    const params = new URLSearchParams()
    params.append('filter_date', chartFilter.date)

    const url = `${URL_GET_DATA}dashboard/api/daily/mining/productions/?${params.toString()}`
    const res = await fetch(url)
    const data = await res.json()

    chartData.value = {
      categories: data.x_data ?? [],
      series: [
        {
          name: 'Actual',
          type: 'bar',
          data: (data.x_data ?? []).map((label: string, i: number) => ({
            x: label,
            y: data.total_actual?.[i] ?? 0,
            goals: [
              {
                name: 'Plan',
                value: data.total_plan?.[i] ?? 0,
                strokeColor: '#f43f5e',
                strokeHeight: 4
              }
            ]
          }))
        }
      ]
    }
  } catch (err) {
    console.warn('Gagal fetch chart DAILY:', err)
    chartData.value = null
  }
}

// ⏱ Lifecycle
onMounted(fetchChartData)
watch(() => chartFilter.date, (val) => {
  console.log('WATCH DATE CHANGED:', val)
  fetchChartData()
})

</script>

<style scoped>
.chart-mask {
  width: 100%;
  /* max-width: 100%; */
  min-width: 600px; /* atau props.chartData.series.length * 40 */
  overflow-x: auto;
}

</style>
