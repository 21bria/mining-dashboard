<template>
  <ClientOnly>
    <ApexChart type="donut" :options="options" :series="props.series" :width="props.width" />
  </ClientOnly>
</template>

<script setup lang="ts">
import ApexChart from 'vue3-apexcharts'
import { computed } from 'vue'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function formatNumberShort(value: number) {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return value.toFixed(1)  // <-- tambahkan ini agar angka kecil dibulatkan
}

const props = defineProps({
  series: {
    type: Array as PropType<number[]>,
    required: true
  },
  labels: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  colors: {
    type: Array as PropType<string[]>,
    default: () => [
      "rgba(132, 90, 223, 1)",   // LGLO
      "rgba(35, 183, 229, 1)",   // MGLO
      "rgba(38, 191, 148, 1)",   // HGLO
      "rgba(245, 184, 73, 1)",   // LGSO
      "rgba(255, 99, 132, 1)",   // MGSO
      "rgba(54, 162, 235, 1)"    // HGSO
    ]
  },
  width: {
    type: [String, Number],
    default: 280
  },
  legend: {
    type: Boolean,
    default: true
  }
})

const options = computed(() => ({
  chart: {
    type: 'donut',
    width: props.width,
    background: 'transparent'
  },
  labels: props.labels,
  theme: {
    mode: isDark.value ? 'dark' : 'light'
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: isDark.value ? ['#1f2937'] : ['#f9fafb']
  },
  legend: {
    show: false,
    position: 'bottom',
    labels: {
      colors: isDark.value ? '#e5e7eb' : '#1e293b'
    }
  },
  plotOptions: {
    pie: {
      expandOnClick: false,
      donut: {
        size: '80%',
        background: 'transparent',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '20px',
            color: '#495057',
            offsetY: -4
          },
          value: {
            show: true,
            fontSize: '18px',
            color: undefined,
            offsetY: 8,
            formatter: function (val: number) {
              return val + "%" // <- bisa ubah jadi formatNumberShort jika mau
            }
          },
          total: {
            show: true,
            showAlways: true,
            label: 'Total',
            fontSize: '22px',
            fontWeight: 600,
            color: '#495057',
            formatter: function (w: any) {
              const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
              return formatNumberShort(total)
            }
          }
        }
      }
    }
  },
  colors: props.colors,
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { width: 240 },
        legend: { show: false }
      }
    }
  ]
}))

</script>