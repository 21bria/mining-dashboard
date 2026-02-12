<template>
  <BaseDonutChart v-if="chartDataOreDonut?.series?.length" :series="chartDataOreDonut.series"
    :labels="chartDataOreDonut.labels" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BaseDonutChart from '@/components/ui/apex-chart/BaseDonutChart.vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'

const emit = defineEmits(['update:percents'])
const chartFilter = useChartFilterStore()
const props = defineProps<{
  filterType: string
}>()

const chartDataOreDonut = ref<{ labels: string[]; series: number[] } | null>(null)

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
      // tidak perlu tambahan param
      break
  }

  return params
}


async function fetchChartData() {
  try {
    const params = buildFilterParams(props.filterType, chartFilter)

    const url = `${URL_GET_DATA}dashboard/api/chart/detail-ore-class-lim/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    chartDataOreDonut.value = {
      labels: data.labels,
      series: data.y_data
    }

    const total = data.y_data.reduce((a: number, b: number) => a + b, 0)
    const percents = data.labels.map((label: string, i: number) => {
      const percent = total > 0 ? ((data.y_data[i] / total) * 100) : 0
      return {
        label,
        value: data.y_data[i],
        percent: Math.round(percent)
      }
    })

    emit('update:percents', percents)
  } catch (error) {
    console.warn('Gagal fetch chart, pakai dummy data:', error)
  }
}


// Initial load
onMounted(() => {
  fetchChartData()
})

watch(() => [chartFilter.year, chartFilter.month], () => {
  fetchChartData()
})


</script>
