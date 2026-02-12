<template>
  <BaseDonutChart
    v-if="chartDataOreDonut?.series?.length"
    :series="chartDataOreDonut.series"
    :labels="chartDataOreDonut.labels"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import BaseDonutChart from '@/components/ui/apex-chart/BaseDonutChart.vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import { URL_GET_DATA } from '@/utils/api'

const emit = defineEmits(['update:percents'])

const props = defineProps<{
  filterType: string
}>()

const chartFilter = useChartFilterStore()
const chartDataOreDonut = ref<{ labels: string[]; series: number[] } | null>(null)

// 💡 Endpoint berdasarkan filterType
const endpoint = computed(() => {
  return `${URL_GET_DATA}dashboard/api/chart/detail-ore-class-sap/`
})

// 🧠 Fetch chart donut sesuai filterType
async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', props.filterType)

    if (chartFilter.date) params.append('daily', chartFilter.date)
    if (chartFilter.week) params.append('filter_week', chartFilter.week.toString())
    if (chartFilter.month) params.append('filter_month', chartFilter.month.value.toString())
    if (chartFilter.year) params.append('filter_year', chartFilter.year.toString())
    if (chartFilter.range.start) params.append('date_start', chartFilter.range.start)
    if (chartFilter.range.end) params.append('date_end', chartFilter.range.end)

    const response = await fetch(`${endpoint.value}?${params.toString()}`)
    const data = await response.json()

    chartDataOreDonut.value = {
      labels: data.labels,
      series: data.y_data
    }

    // 🎯 Emit data persentase ke induk
    const total = data.y_data.reduce((a: number, b: number) => a + b, 0)
    const percents = data.labels.map((label: string, i: number) => {
      const percent = total > 0 ? (data.y_data[i] / total) * 100 : 0
      return {
        label,
        value: data.y_data[i],
        percent: Math.round(percent)
      }
    })

    emit('update:percents', percents)
  } catch (error) {
    console.warn('❌ Gagal fetch ore class sap:', error)
  }
}

onMounted(fetchChartData)

// Watch perubahan filter
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
