<script setup lang="ts">
import FilterControls from '@/components/filters/FilterCoa.vue'

type FilterType = 'monthly' | 'yearly' | 'range'

function handleApply(payload: {
  type: string
  year?: number
  month?: number
  materialFilter?: string
}) {
  fetchCompare({
    ...payload,
    type: payload.type as FilterType   // ✅ casting
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

    // ✅ Material filter dikirim juga
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
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Compare Internal vs Official COA
        </h1>
        <p class="text-muted-foreground">
          Here&apos;s a list of your coa for this data!
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <FilterControls @apply="handleApply" />
      </div>
    </div>
    <!-- Tabel Data -->
    <!-- Table -->
    <Card class="w-full overflow-x-auto mt-6">
      <CardHeader>
        <CardTitle>Data Compare Internal vs Official</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="py-4 text-center text-sm text-gray-500">Loading...</div>
        <div v-else>
          <Table class="table whitespace-nowrap mb-0 min-w-full ti-custom-table-hover text-sm">
            <TableCaption>Latest compare list</TableCaption>
            <TableRow
              class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
              <TableHead>No</TableHead>
              <TableHead>Code</TableHead>
              <!-- <TableHead>Barge</TableHead> -->
              <TableHead class="text-right">Ni</TableHead>
              <TableHead class="text-right">Ni(COA)</TableHead>
              <TableHead class="text-right">Ni(Diff)</TableHead>

              <TableHead class="text-right">Fe</TableHead>
              <TableHead class="text-right">Fe(COA)</TableHead>
              <TableHead class="text-right">Fe(Diff)</TableHead>

              <TableHead class="text-right">MgO</TableHead>
              <TableHead class="text-right">MgO(COA)</TableHead>
              <TableHead class="text-right">MgO(Diff)</TableHead>

              <TableHead class="text-right">SiO2</TableHead>
              <TableHead class="text-right">SiO2(COA)</TableHead>
              <TableHead class="text-right">SiO2(Diff)</TableHead>

              <TableHead class="text-right">Tonnage</TableHead>
              <TableHead class="text-right">COA (Ton)</TableHead>
              <TableHead class="text-right">Ton(Diff)</TableHead>
            </TableRow>
            <TableBody>
              <TableRow v-for="(code, i) in compareData?.x_data" :key="code"
                class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                <TableCell class="text-left px-1 py-1">{{ i + 1 }}</TableCell>
                <TableCell class="text-left px-1 py-1.2">{{ code }}</TableCell>

                <!-- Ni -->
                <TableCell class="text-right px-1 py-0.7">{{ compareData?.y_split_ni[i] }}</TableCell>
                <TableCell class="text-right px-1 py-0.7">{{ compareData?.y_official_ni[i] }}</TableCell>
                <TableCell class="text-right px-1 py-0.7">{{ format2(compareData?.ni_diff[i]) }}%</TableCell>

                <!-- Fe -->
                <TableCell class="text-right px-1 py-0.7">{{ compareData?.y_split_fe[i] }}</TableCell>
                <TableCell class="text-right px-1 py-0.7">{{ compareData?.y_official_fe[i] }}</TableCell>
                <TableCell class="text-right px-1 py-0.7">{{ format2(compareData?.fe_diff[i]) }}%</TableCell>

                <!-- MgO -->
                <TableCell class="text-right px-1 py-0.7">{{ compareData?.y_split_mgo[i] }}</TableCell>
                <TableCell class="text-right px-1 py-0.7">{{ compareData?.y_official_mgo[i] }}</TableCell>
                <TableCell class="text-right px-1 py-0.7">{{ format2(compareData?.mgo_diff[i]) }}%</TableCell>

                <!-- SiO2 -->
                <TableCell class="text-right px-1 py-0.7">{{ compareData?.y_split_sio2[i] }}</TableCell>
                <TableCell class="text-right px-1 py-0.7">{{ compareData?.y_official_sio2[i] }}</TableCell>
                <TableCell class="text-right px-1 py-0.7">{{ format2(compareData?.sio2_diff[i]) }}%</TableCell>

                <!-- Tonnage -->
                <TableCell class="text-right px-1 py-0.7">{{ compareData?.tonnage_split[i] }}</TableCell>
                <TableCell class="text-right px-1 py-0.7">{{ compareData?.tonnage_official[i] }}</TableCell>
                <TableCell class="text-right px-1 py-0.7">{{ format2(compareData?.tonnage_diff[i]) }}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>

        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped></style>
