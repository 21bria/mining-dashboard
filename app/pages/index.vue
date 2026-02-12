<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">
        Dashboard
      </h2>
      <div class="flex items-center space-x-2">
        <!-- <BaseDateRangePicker /> -->
        <FilterControls @apply="handleApply" />
      </div>
    </div>
    <main class="flex flex-1 flex-col gap-4 md:gap-6">

      <div class="grid grid-cols-12 gap-6">
        <!-- Kiri: Statistik dan Chart -->
        <div class="xl:col-span-7 col-span-12">
          <div class="grid gap-4 md:grid-cols-1 xl:grid-cols-3 mb-4">
            <Card>
              <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle class="text-sm font-medium">TMM</CardTitle>
                <Activity class="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                  {{ formatShortNumber(activeStat?.total_actual) || 0 }}
                </div>
                <!-- Perbandingan dengan progress -->
                <p class="text-xs text-muted-foreground">
                  <NumberFlow :value="activeStat?.achievement ?? 0" suffix=" %" />
                  {{ activeLabel }}
                  vs
                  <NumberFlow :value="comparisonStat?.achievement ?? 0" suffix=" %" />
                  {{ comparisonLabel }}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle class="text-sm font-medium">Non Ore</CardTitle>
                <Activity class="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                  {{ formatShortNumber(activeStat?.total_non_ore) || 0 }}
                </div>
                <p class="text-xs text-muted-foreground">
                  <NumberFlow :value="activeStat?.achievement_non_ore ?? 0" suffix=" %" />
                  {{ activeLabel }}
                  vs
                  <NumberFlow :value="comparisonStat?.achievement_non_ore ?? 0" suffix=" %" />
                  {{ comparisonLabel }}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle class="text-sm font-medium">Ore</CardTitle>
                <Activity class="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                  {{ formatShortNumber(activeStat?.total_ore) || 0 }}
                </div>
                <p class="text-xs text-muted-foreground">
                  <NumberFlow :value="activeStat?.achievement_ore ?? 0" suffix=" %" />
                  {{ activeLabel }}
                  vs
                  <NumberFlow :value="comparisonStat?.achievement_ore ?? 0" suffix=" %" />
                  {{ comparisonLabel }}
                </p>
              </CardContent>
            </Card>
          </div>
          <!-- 📈 Chart Area -->
          <div class="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
            <Card class="xxl:col-span-12 xl:col-span-12 col-span-12 px-2 w-full overflow-hidden">
              <CardHeader>

                <div class="flex flex-col md:flex-row justify-between items-start w-full gap-4">
                  <!-- Kiri: Judul + Link -->
                  <div class="flex flex-col gap-1">
                    <CardTitle>Mining</CardTitle>
                    <NuxtLink :to="{
                      path: '/productions',
                      query: { filter_type: selectedChartType }
                    }"
                      class="text-sm text-violet-600 hover:underline hover:text-violet-700 dark:hover:text-violet-500 transition-colors flex items-center">
                      View Details →
                      <i class="bi bi-box-arrow-up-right text-[0.6875rem] ml-1" />
                    </NuxtLink>
                  </div>
                  <!-- Kanan: Summary Box tanpa border, hanya garis tengah -->
                  <div class="flex divide-x divide-gray-300 dark:divide-gray-700 text-sm w-full md:w-auto">
                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Rainy</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatDurationCompact(statsWeather?.rainy ?? 0) }}
                      </p>
                    </div>

                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Slippery</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatDurationCompact(statsWeather?.slippery ?? 0) }}
                      </p>
                    </div>

                  </div>
                </div>
              </CardHeader>

              <CardContent class="overflow-hidden">
                <DashboardMiningChart :filterType="chartFilter.type" />
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Kanan: Donut Chart dan Card Ringkasan di sebelahnya -->
        <div class="xl:col-span-5 col-span-12">
          <div class="grid grid-cols-12 gap-4">
            <!-- Donut -->
            <div class="xl:col-span-7 col-span-12">

              <Card class="h-full">
                <CardFooter class="flex-col gap-2 text-sm pt-4 mt-2 mb-2">
                  <div class="flex items-center leading-none font-medium">
                    Reserves vs Production
                  </div>
                  <!-- Production -->
                  <div class="flex justify-between w-full text-xs font-medium text-muted-foreground">
                    <span>{{ formatShortNumber(reserveSummary.prod_ton) }} tons</span>
                    <span>of {{ formatShortNumber(reserveSummary.reserve_ton) }} tons</span>
                  </div>
                  <Progress :model-value="reserveSummary.percent_mined || 0" class="w-full" />
                </CardFooter>

                <!-- <CardHeader >
                  <CardTitle>Class Ore</CardTitle>
                </CardHeader> -->

                <CardContent class="flex justify-center items-center text-sm border-t">
                  <DashboardQualityClassOre :filterType="chartFilter.type"
                    @update:percents="(val) => oreClassPercents = val" />
                </CardContent>

                <CardFooter class="flex-col gap-2 text-sm border-t pt-4 mt-4">
                  <div class="flex items-center leading-none font-medium">
                    Ore breakdown by class
                  </div>
                  <div v-if="Array.isArray(oreClassPercents) && oreClassPercents.length"
                    class="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-6 gap-2 text-center mt-4">
                    <div v-for="(item, i) in oreClassPercents" :key="i" class="p-2">
                      <p class="text-xs text-gray-500 dark:text-white/50 font-medium">
                        {{ item.label }}
                      </p>
                      <p class="text-sm font-bold text-gray-800 dark:text-white">
                        {{ item.percent }}%
                      </p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
            <!-- Card Ringkasan di sebelah Donut -->
            <div class="xl:col-span-5 col-span-12 grid gap-4">
              <Card class="relative overflow-hidden min-h-[160px]">
                <CardHeader class="pb-2">
                  <div class="flex items-center justify-between">
                    <CardTitle class="text-sm font-medium text-gray-500">Selling Update !</CardTitle>
                    <div
                      class="inline-flex items-center gap-2 px-1 py-2 text-xs font-semibold text-green-600 bg-green-100 rounded-md">
                      <ArrowUpRight class="w-3 h-4" />
                      :)
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="pt-1 pb-4">
                  <div class="text-4xl font-bold text-black dark:text-white leading-snug">
                    {{ formatShortNumber(statsSelling.total_ore) || 0 }}
                  </div>

                  <p class="text-xs text-gray-500  mt-2">
                    Trending up this selling period
                  </p>
                  <p class="text-sm text-black dark:text-white mt-2 flex items-center gap-1">
                    Reserve vs Revenue :
                    <ArrowUpRight class="w-4 h-4" />
                  </p>
                  <!-- Sales -->
                  <div class="flex justify-between w-full text-xs font-medium text-muted-foreground mt-2 mb-1">
                    <span>{{ formatShortNumber(reserveSummary.sales_ton) }} tons</span>
                    <span>of {{ formatShortNumber(reserveSummary.reserve_ton) }} tons</span>
                  </div>
                  <Progress :model-value="reserveSummary.percent_sold || 0" class="w-full" />
                </CardContent>
              </Card>
              <!-- Radial Cards -->
              <OreRadialCards :data="dataList" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6">
        <!-- Kiri: Quality Chart -->
        <div class="xl:col-span-7 col-span-12">
          <!-- 📈 Chart Area  Quality -->
          <div class="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
            <Card class="xxl:col-span-12 xl:col-span-12 col-span-12 px-2 w-full overflow-hidden">
              <CardHeader>
                <div class="flex flex-col md:flex-row justify-between items-start w-full gap-4">
                  <!-- Kiri: Judul + Link -->
                  <div class="flex flex-col gap-1">
                    <CardTitle>Materials Type</CardTitle>
                    <NuxtLink :to="{
                      path: '/quality',
                      query: { filter_type: selectedChartType }
                    }"
                      class="text-sm text-violet-600 hover:underline hover:text-violet-700 dark:hover:text-violet-500 transition-colors flex items-center">
                      View Details →
                      <i class="bi bi-box-arrow-up-right text-[0.6875rem] ml-1" />
                    </NuxtLink>
                  </div>

                  <!-- Kanan: Summary Box tanpa border, hanya garis tengah -->
                  <div class="flex divide-x divide-gray-300 dark:divide-gray-700 text-sm w-full md:w-auto">
                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Limonite</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatShortNumber(statsQuality.total_lim) || 0 }}
                      </p>
                    </div>

                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Saprolite</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatShortNumber(statsQuality.total_sap) || 0 }}
                      </p>
                    </div>

                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Totals Ore</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatShortNumber(statsQuality.total_ore) || 0 }}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent class="overflow-hidden overflow-x-auto">
                <DashboardQualityChart :filterType="chartFilter.type" />
              </CardContent>

            </Card>
          </div>
        </div>

        <!-- Kanan: Selling Chart Ringkasan di sebelahnya -->
        <div class="xl:col-span-5 col-span-12">
          <div class="grid grid-cols-12 gap-4">
            <div class="xl:col-span-12 col-span-12">
              <Card class="h-full">
                <CardHeader>
                  <div class="flex items-start justify-between w-full overflow-hidden">
                    <CardTitle>Selling by Barge</CardTitle>
                    <NuxtLink :to="{
                      path: '/sellings',
                      query: {
                        filter_type: selectedChartType
                      }
                    }"
                      class="text-sm text-violet-600 hover:underline hover:text-violet-700 dark:hover:text-violet-500 transition-colors flex items-center">
                      View Details →
                      <i class="bi bi-box-arrow-up-right text-[0.6875rem] ml-1" />
                    </NuxtLink>
                  </div>
                </CardHeader>
                <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                  <DashboardSellingChart :filterType="chartFilter.type" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <!--  Inventory Chart -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Kiri: Inventory Chart -->
        <div class="xl:col-span-7 col-span-12">
          <!-- 📈 Chart Area  Inventory -->
          <div class="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
            <Card class="xxl:col-span-12 xl:col-span-12 col-span-12 px-2 w-full overflow-hidden">
              <CardHeader>
                <div class="flex flex-col md:flex-row justify-between items-start w-full gap-4">
                  <!-- Kiri: Judul + Link -->
                  <div class="flex flex-col gap-1">
                    <CardTitle>Inventory</CardTitle>
                    <NuxtLink :to="{
                      path: '/inventory',
                      query: {
                        filter_type: selectedChartType
                      }
                    }"
                      class="text-sm text-violet-600 hover:underline hover:text-violet-700 dark:hover:text-violet-500 transition-colors flex items-center">
                      View Details →
                      <i class="bi bi-box-arrow-up-right text-[0.6875rem] ml-1" />
                    </NuxtLink>
                  </div>
                  <!-- Kanan: Summary Box tanpa border, hanya garis tengah -->
                  <div class="flex divide-x divide-gray-300 dark:divide-gray-700 text-sm w-full md:w-auto">
                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Limonite</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatShortNumber(statsIventory.lim_stock) || 0 }}
                      </p>
                    </div>

                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Saprolite</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatShortNumber(statsIventory.sap_stock) || 0 }}
                      </p>
                    </div>

                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Totals Ore</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatShortNumber(statsIventory.total_stock) || 0 }}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                <DashboardInventoryChart :filterType="chartFilter.type" />
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Kanan: Tabel inventory Ringkasan di sebelahnya -->
        <div class="xl:col-span-5 col-span-12">
          <div class="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
            <Card class="xxl:col-span-12 xl:col-span-12 col-span-12 px-2 w-full overflow-hidden">
              <CardHeader>
                <div class="flex flex-col md:flex-row justify-between items-start w-full gap-4">
                  <!-- Kiri: Judul + Link -->
                  <div class="flex flex-col gap-1">
                    <CardTitle>Barging by Daily</CardTitle>
                    <NuxtLink :to="{
                      path: '/barging',
                      query: { filter_type: selectedChartType }
                    }"
                      class="text-sm text-violet-600 hover:underline hover:text-violet-700 dark:hover:text-violet-500 transition-colors flex items-center">
                      View Details →
                      <i class="bi bi-box-arrow-up-right text-[0.6875rem] ml-1" />
                    </NuxtLink>
                  </div>

                  <!-- Kanan: Summary Box tanpa border, hanya garis tengah -->
                  <div class="flex divide-x divide-gray-300 dark:divide-gray-700 text-sm w-full md:w-auto">
                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Limonite</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatShortNumber(statsBarging.total_lim) || 0 }}
                      </p>
                    </div>

                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Saprolite</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatShortNumber(statsBarging.total_sap) || 0 }}
                      </p>
                    </div>

                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Totals Ore</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatShortNumber(statsBarging.total_ore) || 0 }}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                <DashboardBargingChart :filterType="chartFilter.type" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <!-- Fuel -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Kiri: Fuel Chart -->
        <div class="xl:col-span-7 col-span-12">
          <div class="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
            <Card class="xxl:col-span-12 xl:col-span-12 col-span-12 px-2 w-full overflow-hidden">
              <CardHeader>
                <div class="flex flex-col md:flex-row justify-between items-start w-full gap-4">
                  <!-- Kiri: Judul + Link -->
                  <div class="flex flex-col gap-1">
                    <CardTitle>Fuel Consumption</CardTitle>
                  </div>
                  <!-- Kanan: Summary Box tanpa border, hanya garis tengah -->
                  <div class="flex divide-x divide-gray-300 dark:divide-gray-700 text-sm w-full md:w-auto">
                    <div class="px-4 py-2">
                      <p class="text-gray-500 dark:text-gray-400">Totals Fuel</p>
                      <p class="text-lg font-semibold text-gray-800 dark:text-white">
                        {{ formatFuelVolume(totalFuel) }}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                <DashboardFuelingChart :filterType="chartFilter.type" @update:grandTotal="totalFuel = $event" />
              </CardContent>
            </Card>
          </div>
        </div>
        <div class="xl:col-span-5 col-span-12">
          <div class="grid grid-cols-12 gap-3">
            <div class="xl:col-span-6 col-span-12">
              <Card class="h-full">
                <CardHeader>
                  <div class="flex flex-col md:flex-row justify-between items-start w-full gap-4">
                    <!-- Kiri: Judul + Link -->
                    <div class="flex flex-col gap-1">
                      <CardTitle>Fuel by categories</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="flex justify-center items-center text-sm">
                  <DashboardFuelingCategories :filterType="chartFilter.type"
                    @update:percents="(val) => fuelCategoriesPercents = val" />
                </CardContent>
                <CardFooter class="flex-col gap-0 text-sm border-t pt-0 mt-0 w-full max-w-full">

                  <div v-if="Array.isArray(fuelCategoriesPercents) && fuelCategoriesPercents.length" class="relative flex gap-3 overflow-x-auto max-w-full mt-3
                scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    <div v-for="(item, i) in fuelCategoriesPercents" :key="i"
                      class="min-w-[62px] p-2 text-center shrink-0">
                      <p class="text-xs text-gray-500 dark:text-white/50 font-medium">
                        {{ item.label }}
                      </p>
                      <p class="text-sm font-bold text-gray-800 dark:text-white">
                        {{ item.percent }}%
                      </p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div class="xl:col-span-6 col-span-12 grid gap-3">
              <Card class="relative overflow-hidden min-h-[160px]">
                <CardHeader>
                  <div class="flex flex-col md:flex-row justify-between items-start w-full gap-2">
                    <!-- Kiri: Judul + Link -->
                    <div class="flex flex-col gap-1">
                      <CardTitle>Fuel by vendors :</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DashboardFuelingVendors :filterType="chartFilter.type" />
                </CardContent>

              </Card>

            </div>

          </div>

        </div>

      </div>

    </main>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import NumberFlow from '@number-flow/vue'
import { Activity, CreditCard, DollarSign, Users } from 'lucide-vue-next'
import OreRadialCards from '@/components/ui/apex-chart/BaseRadialBar.vue'
import FilterControls from '@/components/filters/FilterControls.vue'
import { useChartFilterStore } from '~/stores/filters/chart-filter'
import { formatDuration, formatDurationVerbose, formatDurationCompact } from '@/utils/time'
const chartFilter = useChartFilterStore()
const selectedChartType = computed(() => chartFilter.type)
const selectedYear = computed(() => chartFilter.year)
const selectedMonth = computed(() => chartFilter.month)
const selectedWeek = computed(() => chartFilter.week)
const selectedRange = computed(() => chartFilter.range || { start: '', end: '' })
const selectedDate = computed(() => chartFilter.date)

const user = useCookie<{ name: string; email: string }>('user')

interface SummaryStats {
  label: string
  total_actual: number
  total_ore: number
  total_limonite: number
  total_saprolite: number
  total_non_ore: number
  achievement: number
  achievement_ore: number
  achievement_non_ore: number
  achievement_limonite: number
  achievement_saprolite: number
}
const totalFuel = ref(0)
type fuelItem = {
  label: string
  percent: number
}
const fuelCategoriesPercents = ref<fuelItem[]>([])

watchEffect(() => {
  if (!chartFilter.type) return
  // Ambil hanya data yang bisa di-serialize
  const safeParams = getChartFilterParams(chartFilter)

  console.log('[FILTER]', safeParams)
  fetchChartData(safeParams)
})

function getChartFilterParams(filter: ReturnType<typeof useChartFilterStore>) {
  return {
    type: filter.type,
    year: filter.year,
    month: filter.month?.value ?? null,
    week: filter.week,
    range: filter.range,
    date: filter.date
  }
}

function fetchChartData(filter: {
  type: string,
  year?: number | null,
  month?: number | null,
  week?: number | null,
  range: { start: string; end: string },
  date: string
}) {
  const params = { ...filter }

  console.log('[FETCHING DATA DENGAN PARAMS]', params)

}

type FilterType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'range' | 'all'

function handleApply(payload: {
  type: string
  year?: number
  month?: number
  week?: number
  range: { start: string; end: string }
  date: string
}) {
  console.log('FILTER TERPILIH:', payload)
  chartFilter.apply({
    ...payload,
    type: payload.type as FilterType
  })
  fetchReserveSummary()
  fetchOreStats()
  fetchQualityStats()
  fetchGradeOre()
  fetchSellingStats()
  fetchInventoryStats()
  fetchBargingStats()
  fetchWeatherData()
}

onMounted(() => {
  fetchReserveSummary()
  fetchOreStats()
  fetchQualityStats()
  fetchGradeOre()
  fetchSellingStats()
  fetchInventoryStats()
  fetchBargingStats()
  fetchWeatherData()
})

const stats = ref<Record<string, SummaryStats>>({})

const selectedKey = computed(() => (selectedChartType.value?.toLowerCase?.() || '') as keyof typeof stats.value)
const comparisonKey = computed(() => {
  switch (selectedKey.value) {
    case 'monthly': return 'mtd'
    case 'yearly': return 'ytd'
    case 'weekly': return 'wtd'
    case 'daily': return 'daily'
    case 'range': return 'range'
    case 'all': return 'all'
    default: return ''
  }
})

const activeStat = computed(() => stats.value[selectedKey.value] || null)
const comparisonStat = computed(() => stats.value[comparisonKey.value] || null)
const activeLabel = computed(() => activeStat.value?.label || '')
const comparisonLabel = computed(() => comparisonStat.value?.label || '')
const reserveSummary = ref<any>({})
const isLoading = ref(false)  // opsional untuk tampilan loading

async function fetchReserveSummary(): Promise<void> {
  isLoading.value = true
  const params = new URLSearchParams()

  // Ambil filter aktif (sama seperti fetchOreStats)
  if (selectedChartType.value) params.append('filter_type', selectedChartType.value)

  if (selectedChartType.value === 'weekly' && selectedYear.value && selectedWeek.value) {
    const weekStr = `${selectedYear.value}-${String(selectedWeek.value).padStart(2, '0')}`
    params.append('week', weekStr)
  } else {
    if (selectedYear.value) params.append('year', selectedYear.value.toString())
    if (selectedMonth.value) params.append('month', selectedMonth.value.value.toString())
    if (selectedWeek.value) params.append('week', selectedWeek.value.toString())
  }

  if (selectedRange.value?.start && selectedRange.value?.end) {
    params.append('date_start', selectedRange.value.start)
    params.append('date_end', selectedRange.value.end)
  }

  if (selectedDate.value) params.append('filter_date', selectedDate.value)

  try {
    const url = URL_GET_DATA + 'dashboard/api/reserve-summary/?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()
    reserveSummary.value = data  // simpan hasil ke variabel reaktif
  } catch (error) {
    console.error('Gagal ambil data Reserve Summary:', error)
    reserveSummary.value = {}
  } finally {
    isLoading.value = false
  }
}


async function fetchOreStats(): Promise<void> {
  isLoading.value = true
  const params = new URLSearchParams()

  if (selectedChartType.value) params.append('filter_type', selectedChartType.value)
  if (selectedChartType.value === 'weekly' && selectedYear.value && selectedWeek.value) {
    const weekStr = `${selectedYear.value}-${String(selectedWeek.value).padStart(2, '0')}`
    params.append('filter_week', weekStr)
  } else {
    if (selectedYear.value) params.append('filter_year', selectedYear.value.toString())
    if (selectedMonth.value) params.append('filter_month', selectedMonth.value.value.toString())
    if (selectedWeek.value) params.append('filter_week', selectedWeek.value.toString())
  }

  if (selectedRange.value?.start && selectedRange.value?.end) {
    params.append('date_start', selectedRange.value.start)
    params.append('date_end', selectedRange.value.end)
  }

  if (selectedDate.value) params.append('filter_date', selectedDate.value)

  // Fetch data dari backend
  try {
    const url = URL_GET_DATA + 'dashboard/api/summary/mines?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()
    stats.value = data
  } catch (error) {
    console.error('Gagal ambil data Static:', error)
    stats.value = {}
  } finally {
    isLoading.value = false
  }
}

type OreClassItem = {
  label: string
  percent: number
}

const oreClassPercents = ref<OreClassItem[]>([])
const statsQuality = ref<any>({})
async function fetchQualityStats(): Promise<void> {
  isLoading.value = true
  const params = new URLSearchParams()

  // Tambah filter_type
  if (selectedChartType.value) {
    params.append('filter_type', selectedChartType.value)
  }

  // Tambah year (selalu ditambahkan jika ada)
  if (selectedYear.value) {
    params.append('year', selectedYear.value.toString())
  }

  // Tambah month (pastikan ambil .value)
  if (selectedMonth.value?.value !== undefined) {
    params.append('month', selectedMonth.value.value.toString())
  }

  // Tambah week dalam format "YYYY-WW"
  if (selectedYear.value && selectedWeek.value !== undefined) {
    const weekStr = `${selectedYear.value}-${String(selectedWeek.value).padStart(2, '0')}`
    params.append('week', weekStr)
  }

  // Range mode (optional)
  if (selectedRange.value?.start && selectedRange.value?.end) {
    params.append('date_start', selectedRange.value.start)
    params.append('date_end', selectedRange.value.end)
  }

  // Daily mode (optional)
  if (selectedDate.value) {
    params.append('filter_date', selectedDate.value)
  }
  // Fetch data dari backend
  try {
    const url = URL_GET_DATA + 'dashboard/api/ore-summary/?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()
    statsQuality.value = data
    console.log('Get data Static:', data)
  } catch (error) {
    console.error('Gagal ambil data Static:', error)
    statsQuality.value = {}
  } finally {
    isLoading.value = false
  }
}

const statsGradeOre = ref({ data: [] })
async function fetchGradeOre(): Promise<void> {
  isLoading.value = true
  // Kosongkan data sebelum fetch baru
  statsGradeOre.value = { data: [] }
  const params = new URLSearchParams()

  // Tambah filter_type
  if (selectedChartType.value) {
    params.append('filter_type', selectedChartType.value)
  }

  // Tambah year (selalu ditambahkan jika ada)
  if (selectedYear.value) {
    params.append('year', selectedYear.value.toString())
  }

  // Tambah month (pastikan ambil .value)
  if (selectedMonth.value?.value !== undefined) {
    params.append('month', selectedMonth.value.value.toString())
  }

  // Tambah week dalam format "YYYY-WW"
  if (selectedYear.value && selectedWeek.value !== undefined) {
    const weekStr = `${selectedYear.value}-${String(selectedWeek.value).padStart(2, '0')}`
    params.append('week', weekStr)
  }

  // Range mode (optional)
  if (selectedRange.value?.start && selectedRange.value?.end) {
    params.append('date_start', selectedRange.value.start)
    params.append('date_end', selectedRange.value.end)
  }

  // Daily mode (optional)
  if (selectedDate.value) {
    params.append('filter_date', selectedDate.value)
  }
  // Fetch data dari backend
  try {
    const url = URL_GET_DATA + 'dashboard/api/ore-grade/?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()
    statsGradeOre.value = data
  } catch (error) {
    console.error('Gagal ambil data Static:', error)
  } finally {
    isLoading.value = false
  }
}
// Weather Stats
interface SummaryStats {
  total_rainy: number
  total_slippery: number
}

const statsWeather = ref({
  rainy: 0,
  slippery: 0
})

async function fetchWeatherData(): Promise<void> {
  isLoading.value = true
  // Kosongkan data sebelum fetch baru
  statsWeather.value = {
    rainy: 0,
    slippery: 0
  }

  const params = new URLSearchParams()

  // Tambah filter_type
  if (selectedChartType.value) {
    params.append('filter_type', selectedChartType.value)
  }

  // Tambah year (selalu ditambahkan jika ada)
  if (selectedYear.value) {
    params.append('year', selectedYear.value.toString())
  }

  // Tambah month (pastikan ambil .value)
  if (selectedMonth.value?.value !== undefined) {
    params.append('month', selectedMonth.value.value.toString())
  }

  // Tambah week dalam format "YYYY-WW"
  if (selectedYear.value && selectedWeek.value !== undefined) {
    const weekStr = `${selectedYear.value}-${String(selectedWeek.value).padStart(2, '0')}`
    params.append('week', weekStr)
  }

  // Range mode (optional)
  if (selectedRange.value?.start && selectedRange.value?.end) {
    params.append('date_start', selectedRange.value.start)
    params.append('date_end', selectedRange.value.end)
  }

  // Daily mode (optional)
  if (selectedDate.value) {
    params.append('filter_date', selectedDate.value)
  }
  // Fetch data dari backend
  try {
    const url = URL_GET_DATA + 'dashboard/api/weather/data/?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()
    statsWeather.value = data
  } catch (error) {
    console.error('Gagal ambil data Static:', error)
  } finally {
    isLoading.value = false
  }
}


// const statsSelling = ref({})
interface StatsSelling {
  total_ore: number
  // Tambahkan field lain kalau perlu
}
const statsSelling = ref<StatsSelling>({
  total_ore: 0,
})

const dataList = ref<{ label: string; percent: number; value: string; color: string }[]>([])
const chartKey = ref(0)
async function fetchSellingStats(): Promise<void> {
  isLoading.value = true
  const params = new URLSearchParams()

  // Tambah filter_type
  if (selectedChartType.value) {
    params.append('filter_type', selectedChartType.value)
  }

  // Tambah year (selalu ditambahkan jika ada)
  if (selectedYear.value) {
    params.append('year', selectedYear.value.toString())
  }

  // Tambah month (pastikan ambil .value)
  if (selectedMonth.value?.value !== undefined) {
    params.append('month', selectedMonth.value.value.toString())
  }

  // Tambah week dalam format "YYYY-WW"
  if (selectedYear.value && selectedWeek.value !== undefined) {
    const weekStr = `${selectedYear.value}-${String(selectedWeek.value).padStart(2, '0')}`
    params.append('week', weekStr)
  }

  // Range mode (optional)
  if (selectedRange.value?.start && selectedRange.value?.end) {
    params.append('date_start', selectedRange.value.start)
    params.append('date_end', selectedRange.value.end)
  }

  // Daily mode (optional)
  if (selectedDate.value) {
    params.append('filter_date', selectedDate.value)
  }
  // Fetch data dari backend
  try {
    const url = URL_GET_DATA + 'dashboard/api/selling-summary/?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()

    statsSelling.value = data
    console.log('✅ Data Selling Summary:', data)

    const totalOre = data.total_ore || 0
    const totalLim = data.total_lim || 0
    const totalSap = data.total_sap || 0

    const limPercent = totalOre ? Math.round((totalLim / totalOre) * 100) : 0
    const sapPercent = totalOre ? Math.round((totalSap / totalOre) * 100) : 0

    dataList.value = [
      {
        label: 'Limonite',
        percent: limPercent,
        value: formatShortNumber(totalLim),
        color: '#fbbf24'
      },
      {
        label: 'Saprolite',
        percent: sapPercent,
        // value: (totalSap).toFixed(2),
        value: formatShortNumber(totalSap),
        color: '#34d399'
      }
    ]
    chartKey.value += 1 // ⬅️ Paksa re-render
  } catch (error) {
    console.error(' Gagal ambil data Static:', error)

    dataList.value = []
  } finally {
    isLoading.value = false
  }
}

const statsIventory = ref<any>({})
async function fetchInventoryStats(): Promise<void> {
  isLoading.value = true
  const params = new URLSearchParams()

  // Tambah filter_type
  if (selectedChartType.value) {
    params.append('filter_type', selectedChartType.value)
  }

  // Tambah year (selalu ditambahkan jika ada)
  if (selectedYear.value) {
    params.append('year', selectedYear.value.toString())
  }

  // Tambah month (pastikan ambil .value)
  if (selectedMonth.value?.value !== undefined) {
    params.append('month', selectedMonth.value.value.toString())
  }

  // Tambah week dalam format "YYYY-WW"
  if (selectedYear.value && selectedWeek.value !== undefined) {
    const weekStr = `${selectedYear.value}-${String(selectedWeek.value).padStart(2, '0')}`
    params.append('week', weekStr)
  }

  // Range mode (optional)
  if (selectedRange.value?.start && selectedRange.value?.end) {
    params.append('date_start', selectedRange.value.start)
    params.append('date_end', selectedRange.value.end)
  }

  // Daily mode (optional)
  if (selectedDate.value) {
    params.append('filter_date', selectedDate.value)
  }
  // Fetch data dari backend
  try {
    const url = URL_GET_DATA + 'dashboard/api/inventory-summary/?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()
    statsIventory.value = data
    console.log('Get data Static:', data)
  } catch (error) {
    console.error('Gagal ambil data Static:', error)
    statsIventory.value = {}
  } finally {
    isLoading.value = false
  }
}

const statsBarging = ref<any>({})
async function fetchBargingStats(): Promise<void> {
  isLoading.value = true
  const params = new URLSearchParams()

  // Tambah filter_type
  if (selectedChartType.value) {
    params.append('filter_type', selectedChartType.value)
  }

  // Tambah year (selalu ditambahkan jika ada)
  if (selectedYear.value) {
    params.append('year', selectedYear.value.toString())
  }

  // Tambah month (pastikan ambil .value)
  if (selectedMonth.value?.value !== undefined) {
    params.append('month', selectedMonth.value.value.toString())
  }

  // Tambah week dalam format "YYYY-WW"
  if (selectedYear.value && selectedWeek.value !== undefined) {
    const weekStr = `${selectedYear.value}-${String(selectedWeek.value).padStart(2, '0')}`
    params.append('week', weekStr)
  }

  // Range mode (optional)
  if (selectedRange.value?.start && selectedRange.value?.end) {
    params.append('date_start', selectedRange.value.start)
    params.append('date_end', selectedRange.value.end)
  }

  // Daily mode (optional)
  if (selectedDate.value) {
    params.append('filter_date', selectedDate.value)
  }
  // Fetch data dari backend
  try {
    const url = URL_GET_DATA + 'dashboard/api/barging-summary/?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()
    statsBarging.value = data
    console.log('Get data Static:', data)
  } catch (error) {
    console.error('Gagal ambil data Static:', error)
    statsBarging.value = {}
  } finally {
    isLoading.value = false
  }
}

</script>
<style>
/* global.css */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>