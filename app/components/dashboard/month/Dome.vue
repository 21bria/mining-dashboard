<script setup lang="ts">
const chartFilter = useChartFilterStore()
const isLoading = ref(false)

const statsDome = ref<{ data: DomeItem[] }>({ data: [] })

interface DomeItem {
  pile_id: string
  nama_material: string
  total_ore: number
  ni: number
  fe: number
  mgo: number
}

const domes = computed(() => statsDome.value?.data || [])

async function fetchDomeStats() {
  isLoading.value = true
  const params = new URLSearchParams()
  params.append('filter_type', 'monthly')
  if (chartFilter.year) params.append('year', chartFilter.year.toString())
  if (chartFilter.month) params.append('month', chartFilter.month.value.toString())

  try {
    const url = URL_GET_DATA + 'dashboard/api/dome-grade/?' + params.toString()
    const response = await fetch(url)
    const data = await response.json()
    statsDome.value = data
  } catch (error) {
    console.error('Gagal ambil data Dome:', error)
    statsDome.value = { data: [] }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDomeStats()
})

// onMounted(fetchDomeStats)
// Re-fetch jika bulan atau tahun berubah
watch(() => [chartFilter.year, chartFilter.month], fetchDomeStats)

</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-4 md:grid-cols-1">
      <Card class="w-full overflow-x-auto">
        <CardHeader>
          <div class="flex items-start justify-between w-full">
            <CardTitle>Dome Inventory</CardTitle>
            <NuxtLink to="/datainventory"
              class="text-sm text-violet-600 hover:underline hover:text-violet-700 dark:hover:text-violet-500 transition-colors flex items-center">
              View →
              <i class="bi bi-box-arrow-up-right text-[0.6875rem] ml-1" />
            </NuxtLink>
          </div>
        </CardHeader>
        <CardContent>
          <div class="min-h-100px w-full flex items-center justify-center gap-4 md:min-h-200px">
            <Table>
              <TableCaption>A list of your recent inventory.</TableCaption>
              <TableRow>
                <TableHead class="w-[100px]">Dome</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Totals</TableHead>
                <TableHead class="text-right">Ni</TableHead>
                <TableHead class="text-right">Fe</TableHead>
                <TableHead class="text-right">MgO</TableHead>
              </TableRow>
              <TableBody>
                <TableRow v-for="dome in domes" :key="dome.pile_id">
                  <TableCell class="font-medium">{{ dome.pile_id }}</TableCell>
                  <TableCell>{{ dome.nama_material }}</TableCell>
                  <TableCell>{{ dome.total_ore }}</TableCell>
                  <TableCell class="text-right">{{ dome.ni }}</TableCell>
                  <TableCell class="text-right">{{ dome.fe }}</TableCell>
                  <TableCell class="text-right">{{ dome.mgo }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped></style>
