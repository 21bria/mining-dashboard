<template>
  <BaseDonutChart
    v-if="chartDataOreDonut?.series?.length"
    :series="chartDataOreDonut.series"
    :labels="chartDataOreDonut.labels"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BaseDonutChart from '@/components/ui/apex-chart/BaseDonutChart.vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'

const emit = defineEmits(['update:percents'])
const chartFilter = useChartFilterStore()

const chartDataOreDonut = ref<{ labels: string[]; series: number[] } | null>(null)


async function fetchChartData() {
  try {
    const params = new URLSearchParams()
    params.append('filter_type', 'monthly') // sesuai komponen ini
    if (chartFilter.year) params.append('year', chartFilter.year.toString())
    if (chartFilter.month) params.append('month', chartFilter.month.value.toString())

    const url = `${URL_GET_DATA}dashboard/api/ore-class-chart/?${params.toString()}`
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
onMounted(fetchChartData)

// Re-fetch jika bulan atau tahun berubah
watch(() => [chartFilter.year, chartFilter.month], fetchChartData)

</script>
