<template>
  <ClientOnly>
    <ApexChart ref="chart" height="270" type="bar" :options="mergedOptions" :series="series" />
  </ClientOnly>
</template>

<script setup lang="ts">
import ApexChart from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { ref, computed, watch } from 'vue'

interface Barge {
  name?: string
  [key: string]: any
}

interface DetailItem {
  label: string
  lim_actual: number
  sap_actual: number
  barges?: (string | Barge)[]
}
// Tipe data detail untuk tooltip
interface DetailItem {
  label: string
  lim_actual: number
  sap_actual: number
  barges?: (string | Barge)[]
}
const props = defineProps({
  series: {
    type: Array as () => { name: string; data: number[]; type?: string }[],
    required: true
  },
  categories: {
    type: Array as () => string[],
    default: () => []
  },
  colors: {
    type: Array as () => string[],
    default: () => []
  },
  title: { type: String, default: '' },
  details: {
    type: Array as () => DetailItem[],
    default: () => []
  }
})

const chart = ref<ApexCharts | null>(null)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const legendColor = computed(() =>
  isDark.value ? '#e5e7eb' : '#1e293b'
)

// 1. Static base options
const baseOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    stackType: 'normal',
    background: 'transparent',
    zoom: {
      enabled: true,
      type: 'x',
      autoScaleYaxis: true
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
      },
      autoSelected: 'zoom'
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
    categories: props.categories
  },
  plotOptions: {
    bar: {
      dataLabels: {
        position: 'top'
      },
      columnWidth: '60%',
      borderRadius: 3,
    }
  },
  dataLabels: {
    enabled: false,
    formatter: (val: number) => `${(val / 1000).toFixed()}k`,
    offsetY: -10,
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      colors: [isDark.value ? '#e5e7eb' : '#1e293b']
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'center',
    labels: {
      colors: legendColor.value
    }
  }
}))

// 2. Theme options including tooltip with custom function
const getThemeOptions = (): ApexOptions => ({
  theme: {
    mode: isDark.value ? 'dark' : 'light'
  },
  colors: props.colors.length > 0
    ? props.colors
    : (isDark.value
      ? ["#845adf", "#23b7e5", "#f5b849", "#e6533c"]
      : ["#845adf", "#23b7e5", "#f5b849", "#e6533c"]),
  xaxis: {
    categories: props.categories,
    labels: {
      style: {
        colors: isDark.value ? '#e5e7eb' : '#1e293b'
      }
    }
  },
  yaxis: {
    tickAmount: 4,
    labels: {
      formatter: (val: number) => `${(val / 1000).toFixed()}k`,
      style: {
        colors: isDark.value ? '#e5e7eb' : '#1e293b'
      }
    }
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    custom: function ({ dataPointIndex }: { dataPointIndex: number }) {
      if (!props.details || !props.details[dataPointIndex]) return ''

      const detail = props.details[dataPointIndex]

      function renderBarges(barges: (string | Barge)[] | undefined): string {
        if (!barges || barges.length === 0) return '<em>No barges</em>'
        return `<ul style="margin:0;padding-left:1em;">
        ${barges.map((b: string | Barge) => {
          if (typeof b === 'object' && b !== null) {
            const nestedBarges = b.barges ? renderBarges(b.barges) : ''
            return `<li>
              <strong>${b.barge_code ?? 'Unknown'}</strong> - Sap: ${b.sap}
              ${nestedBarges}
            </li>`
          }
          return `<li>${b}</li>`
        }).join('')}
      </ul>`
      }
      return `
      <div style="padding:8px; color:${isDark.value ? '#eee' : '#222'};">
        <strong>${detail.label}</strong><br/>
        Saprolite: ${detail.sap_actual}<br/>
        Barges: ${renderBarges(detail.barges)}
      </div>
    `
    }
  },
  grid: {
    borderColor: isDark.value ? '#334155' : '#e5e7eb',
    strokeDashArray: 2
  },
  legend: {
    position: 'top',
    horizontalAlign: 'center',
    fontSize: '12px',
    labels: {
      colors: isDark.value ? '#e5e7eb' : '#1e293b'
    }
  },
  fill: {
    opacity: [0.46, 1],
  },
  stroke: {
    width: [0, 2], // 2 bar = 0, sisanya line lebih tipis
    dashArray: [0, 4,]
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
})

// 3. Gabungkan options
const mergedOptions = computed<ApexOptions>(() => ({
  ...baseOptions.value,
  ...getThemeOptions()
}))

// 4. Update options saat mode warna berubah
watch(isDark, () => {
  if (chart.value?.updateOptions) {
    chart.value.updateOptions(getThemeOptions(), false, true)
  }
})
</script>
