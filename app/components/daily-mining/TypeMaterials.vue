<template>
  <BaseDonutChart v-if="chartData.series.length > 0" :series="chartData.series" :labels="chartData.labels" />

</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BaseDonutChart from '@/components/ui/apex-chart/BaseDonutChart.vue'
import { URL_GET_DATA } from '@/utils/api'
import { useDailyFilterStore } from '~/stores/filters/daily-filter'

const emit = defineEmits<{
  (e: 'update:percents', payload: {
    label: string
    value: number
    percent: number
  }[]): void
}>()

const chartFilter = useDailyFilterStore()

const chartData = ref<{
  labels: string[]
  series: number[]
}>({
  labels: [],
  series: []
})


/* ===============================
   FETCH DATA (DAILY ONLY)
================================ */
async function fetchChartData() {
  try {
    if (!chartFilter.date) return

    const params = new URLSearchParams()
    params.append('filter_date', chartFilter.date)

    const res = await fetch(
      URL_GET_DATA + 'dashboard/api/summary/daily/mining/materials/?' +
      params.toString()
    )

    const data = await res.json()

    chartData.value = {
      labels: data.labels ?? [],
      series: data.y_data ?? []
    }

    // hitung persen
    const total = chartData.value.series.reduce((a, b) => a + b, 0)

    const percents = chartData.value.labels.map((label, i) => ({
      label,
      value: chartData.value.series[i] ?? 0,
      percent: total
        ? Math.round((chartData.value.series[i] / total) * 100)
        : 0
    }))

    emit('update:percents', percents)
  } catch (err) {
    console.warn('❌ Gagal fetch ore donut daily:', err)
  }
}


onMounted(fetchChartData)

watch(
  () => chartFilter.date,
  (val) => {
    if (val) fetchChartData()
  }
)
</script>
