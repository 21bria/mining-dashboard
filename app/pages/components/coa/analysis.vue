<script setup lang="ts">
import FilterControls from '@/components/filters/FilterCoa.vue'

const chartComponent = computed(() =>
  defineAsyncComponent(() => import('@/components/ui/apex-chart/BaseColumnCoa.vue'))
)

const colors = computed(() => ['#3b82f6', '#ff9343', '#f5b849'])


type FilterType = 'monthly' | 'yearly' | 'range'
// Ambil query params dari URL
const route = useRoute()
const filterType = String(route.query.filter_type || '')

function handleApply(payload: {
  type: string
  year?: number
  month?: number
  materialFilter?: string
}) {
  fetchCompare({
    ...payload,
    type: payload.type as FilterType   // casting
  })
}

const isLoading = ref(false)
const compareData = ref<any>({})
const detailsData = ref<any[]>([])   // array lebih pas, bukan object

async function fetchCompare(payload: any) {
  try {
    isLoading.value = true
    const params = new URLSearchParams()

    // Selalu kirim filter_type
    params.append('filter_type', payload.type)

    if (payload.year) params.append('year', payload.year.toString())
    if (payload.month) params.append('month', payload.month.toString())

    // Material filter dikirim juga
    if (payload.materialFilter) {
      params.append('materialFilter', payload.materialFilter)
    }

    const url = `${URL_GET_DATA}dashboard/api/selling/coa/all/?${params.toString()}`
    const res = await fetch(url)
    const data = await res.json()

    compareData.value = data.compare
    detailsData.value = data.details ?? []

  } catch (err) {
    console.error('❌ Gagal fetch compare:', err)
  } finally {
    isLoading.value = false
  }
}

// Format angka 2 desimal
const format2 = (num: number | null | undefined) =>
  typeof num === 'number'
    ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(num)
    : '-'

//  Jalankan sekali saat komponen pertama kali mount
onMounted(() => {
  const today = new Date()
  fetchCompare({
    type: 'monthly',
    year: today.getFullYear(),
    month: today.getMonth() + 1
  })
})
</script>


<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-start gap-2">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Analysis Internal vs Official COA
        </h1>
        <p class="text-muted-foreground">
          Here&apos;s a list of your coa for this data!
        </p>
      </div>

    </div>
    <div class="flex items-center space-x-2">
      <FilterControls @apply="handleApply" />
    </div>
    <!-- Tabel Data -->
    <div class="grid grid-cols-12 gap-4">
      <div class="xl:col-span-10 col-span-12">
        <Card class="w-full overflow-hidden overflow-x-auto mt-6">
          <CardHeader>
            <CardTitle>Internal vs Official (Ni%)</CardTitle>
          </CardHeader>
          <CardContent class="pl-2">
            <OfficialDetailChart metric="ni" :filterType="filterType" />
          </CardContent>
          <CardContent class="pl-2 overflow-hidden overflow-x-auto">
            <OfficialDetailChart metric="ni" :compare="compareData" :details="detailsData" />
          </CardContent>
        </Card>
      </div>
      <div class="xl:col-span-10 col-span-12">
        <Card class="w-full overflow-hidden overflow-x-auto mt-6">
          <CardHeader>
            <CardTitle>Internal vs Official (Fe%)</CardTitle>
          </CardHeader>
          <CardContent class="pl-2">
            <OfficialDetailChart metric="fe" :filterType="filterType" />
          </CardContent>
          <CardContent class="pl-2 overflow-hidden overflow-x-auto">
            <OfficialDetailChart metric="fe" :compare="compareData" :details="detailsData" />
          </CardContent>
        </Card>
      </div>
      <div class="xl:col-span-10 col-span-12">
        <Card class="w-full overflow-hidden overflow-x-auto mt-6">
          <CardHeader>
            <CardTitle>Internal vs Official (MgO%)</CardTitle>
          </CardHeader>
          <CardContent class="pl-2">
            <OfficialDetailChart metric="mgo" :filterType="filterType" />
          </CardContent>
          <CardContent class="pl-2 overflow-hidden overflow-x-auto">
            <OfficialDetailChart metric="mgo" :compare="compareData" :details="detailsData" />
          </CardContent>
        </Card>
      </div>
      <div class="xl:col-span-10 col-span-12">
        <Card class="w-full overflow-hidden overflow-x-auto mt-6">
          <CardHeader>
            <CardTitle>Internal vs Official (Sio2%)</CardTitle>
          </CardHeader>
          <CardContent class="pl-2">
            <OfficialDetailChart metric="sio2" :filterType="filterType" />
          </CardContent>
          <CardContent class="pl-2 overflow-hidden overflow-x-auto">
            <OfficialDetailChart metric="sio2" :compare="compareData" :details="detailsData" />
          </CardContent>
        </Card>
      </div>
      <!-- <div class="xl:col-span-9 col-span-12">
        <Card class="w-full overflow-x-auto mt-6">
          <CardHeader>
            <CardTitle>Internal vs Official (SM%)</CardTitle>
          </CardHeader>
          <CardContent class="pl-2">
            <OfficialDetailChart metric="sm" :filterType="filterType" />
          </CardContent>
          <CardContent class="pl-2">
            <OfficialDetailChart metric="sm" :compare="compareData" :details="detailsData" />
          </CardContent>
        </Card>
      </div> -->
    </div>
  </div>
</template>

<style scoped></style>
