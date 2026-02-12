<template>
  <BaseDonutChart v-if="chartFuelDonut?.series?.length" :series="chartFuelDonut.series"
    :labels="chartFuelDonut.labels"
    :colors="chartFuelDonut.colors" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import BaseDonutChart from '@/components/ui/apex-chart/BaseDonutChart.vue'
import { URL_GET_DATA } from '@/utils/api'
import { generateColorsFromLabels } from '@/utils/chartColors'

const props = defineProps<{ filterType: string }>()
const emit = defineEmits(['update:percents'])

const chartFilter = useChartFilterStore()
const chartFuelDonut = ref<{
  labels: string[]
  series: number[]
  colors: string[]
} | null>(null)


async function fetchChartData() {
  try {
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
    }

    const url = `${URL_GET_DATA}dashboard/api/fuel/summary/category/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    chartFuelDonut.value = {
      labels: data.labels,
      series: data.y_data,
      colors: generateColorsFromLabels(data.labels)
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
    console.warn('Gagal fetch fuel categories chart:', error)
  }
}

onMounted(fetchChartData)

watch(
  () => [
    props.filterType,
    chartFilter.date,
    chartFilter.month?.value,
    chartFilter.year,
    chartFilter.week,
    chartFilter.range.start,
    chartFilter.range.end
  ],
  fetchChartData
)
</script>
