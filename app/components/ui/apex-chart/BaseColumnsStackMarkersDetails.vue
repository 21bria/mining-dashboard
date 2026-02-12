<template>
  <ClientOnly>
    <ApexChart ref="chart" height="270" :options="mergedOptions" :series="series" />
  </ClientOnly>
</template>

<script setup lang="ts">
import ApexChart from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { ref, computed, watch } from 'vue'

const props = defineProps({
  series: {
    type: Array,
    required: true
  },
  colors: {
    type: Array,
    default: () => []
  },
  title: { type: String, default: '' },
  oreType: { type: String as PropType<'LIM' | 'SAP'>, required: true } //  tambahan (pisahkan LIM dan SAP)
})

const chart = ref<ApexCharts | null>(null)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

interface Barge {
  barge_code?: string
  lim?: number
  sap?: number
  total?: number
  barges?: Barge[]
}

interface DetailItem {
  label: string
  lim_actual?: number
  sap_actual?: number
  lim_plan?: number
  sap_plan?: number
  barges?: Barge[]
}
// ====== 1. Static Chart Options
const baseOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    background: 'transparent',
    zoom: {
      enabled: false
    },
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false
      }
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 500
    },
    fontFamily: 'Inter, sans-serif',
  },
  title: {
    text: props.title,
    align: 'left',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: isDark.value ? '#e5e7eb' : '#1e293b'
    }
  },
  xaxis: {
    labels: {
      style: {
        colors: isDark.value ? '#e5e7eb' : '#1e293b'
      }
    },
    axisBorder: {
      color: isDark.value ? '#334155' : '#e5e7eb'
    },
    axisTicks: {
      color: isDark.value ? '#334155' : '#e5e7eb'
    }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `${(val / 1000).toFixed(1)}k`,
      style: {
        colors: isDark.value ? '#e5e7eb' : '#1e293b'
      }
    }
  },
  stroke: {
    width: props.series.length > 0
      ? Array(props.series.length - 1).fill(0).concat(0)
      : []
  },
  markers: {
    size: props.series.length > 0
      ? Array(props.series.length - 1).fill(0).concat(3)
      : [],
    strokeColors: "#fff", // outline putih
    strokeWidth: 2,
    colors: ['#f43f5e']   // isi marker merah
  },
  legend: {
    show: true,
    showForSingleSeries: true,
    customLegendItems: ['All', 'Plan'],
    markers: {
      fillColors: ['', '#f43f5e']
    }
  },
  plotOptions: {
    bar: {
      columnWidth: '70%',
      endingShape: 'rounded',
      dataLabels: {
        position: 'top'
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  fill: {
     opacity: [0.67],
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    custom: function ({ seriesIndex, dataPointIndex, w }: any) {
      const point: any = w.config.series[seriesIndex].data[dataPointIndex]
      const detail: DetailItem = point.detail
      if (!detail) return ''

      const key = props.oreType === 'LIM' ? 'lim' : 'sap'
      const labelKey = props.oreType === 'LIM' ? 'Limonite' : 'Saprolite'
      const planKey = props.oreType === 'LIM' ? 'lim_plan' : 'sap_plan'
      const actualKey = props.oreType === 'LIM' ? 'lim_actual' : 'sap_actual'

      function renderBarges(barges?: Barge[]): string {
        if (!barges || barges.length === 0) return '<em>No barges</em>'
        return `<ul>
          ${barges
            .filter(b => (b[key] ?? 0) > 0)
            .map(b => `<li>${b.barge_code}: ${b[key] ?? 0}</li>`)
            .join('')}
        </ul>`
      }
      return `
         <div style="padding:8px; color:${isDark.value ? '#eee' : '#222'};">
          <strong>${detail.label}</strong><br/>
          ${labelKey} Actual: ${detail[actualKey] ?? 0}<br/>
          ${labelKey} Plan: ${detail[planKey] ?? 0}<br/>
          ${renderBarges(detail.barges)}
        </div>
      `
    }
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          fontSize: '11px',
          itemMargin: {
            horizontal: 8,
            vertical: 4,
          },
        },
      },
    },
  ],

}))

// ====== 2. Theme Options
const getThemeOptions = (): ApexOptions => ({
  theme: {
    mode: isDark.value ? 'dark' : 'light'
  },
  colors: props.colors.length > 0
    ? props.colors
    : isDark.value
      ? ['#34d399', '#f5b849']
      : ['#34d399', '#f5b849'],
  grid: {
    borderColor: isDark.value ? '#334155' : '#e5e7eb',
    strokeDashArray: 2
  }
})

// ====== 3. Merged Options
const mergedOptions = computed<ApexOptions>(() => ({
  ...baseOptions.value,
  ...getThemeOptions()
}))

// ====== 4. Update on theme change
watch(isDark, () => {
  if (chart.value?.updateOptions) {
    chart.value.updateOptions(getThemeOptions(), false, true)
  }
})
</script>
