<template>
  <div class="w-full flex flex-col gap-4">
    <!-- Header -->
    <div class="mb-2 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Inventory Saprolite</h1>
        <button @click="$router.push('/')" class="text-sm text-blue-500 underline mt-1">
          ← Back to Home
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex justify-end mt-2">
      <div class="flex flex-wrap items-center gap-4 mt-2">
        <!-- Sale Filter -->


        <!-- Area Filter -->
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="min-w-[250px] justify-start">
              {{ areaFilter.length ? areaFilter.join(', ') : 'Select stokpile(s)' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" class="w-64 z-50">
            <ScrollArea class="h-48">
              <Input v-model="areaSearch" placeholder="Search stokpile..." class="form-input w-full mb-2" />
              <div class="space-y-0">
                <label v-for="area in areaOptions" :key="area" class="flex items-center gap-2">
                  <input type="checkbox" :value="area" v-model="areaFilter" class="form-checkbox" />
                  <span>{{ area }}</span>
                </label>
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        <!-- Point Filter -->
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="min-w-[250px] justify-start">
              {{ pointFilter.length ? pointFilter.join(', ') : 'Select dome(s)' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" class="w-64 z-50">
            <ScrollArea class="h-48">
              <Input v-model="pointSearch" placeholder="Search dome..." class="form-input w-full mb-2" />
              <div class="space-y-2">
                <label v-for="point in pointOptions" :key="point" class="flex items-center gap-2">
                  <input type="checkbox" :value="point" v-model="pointFilter" class="form-checkbox" />
                  <span>{{ point }}</span>
                </label>
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

      </div>

    </div>

    <!-- Table -->
    <Card class="w-full overflow-x-auto mt-6">
      <CardHeader>
        <CardTitle>Dome Saprolite</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="py-4 text-center text-sm text-gray-500">Loading...</div>
        <div v-else>
          <Table>
            <TableCaption>Latest inventory list</TableCaption>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Dome</TableHead>
              <TableHead>Material</TableHead>
              <!-- <TableHead>Stockpile</TableHead> -->
              <TableHead class="text-right">Total</TableHead>
              <TableHead class="text-right">Selling</TableHead>
              <TableHead class="text-right">Balance</TableHead>
              <TableHead class="text-right">Ni</TableHead>
              <TableHead class="text-right">Fe</TableHead>
              <TableHead class="text-right">Al2O3</TableHead>
              <TableHead class="text-right">Co</TableHead>
              <TableHead class="text-right">MgO</TableHead>
              <TableHead class="text-right">SiO2</TableHead>
              <TableHead class="text-right">CaO</TableHead>
              <TableHead class="text-right">Cr2O3</TableHead>
              <TableHead class="text-right">SM</TableHead>
            </TableRow>
            <TableBody>
              <TableRow v-for="(dome, i) in domes" :key="dome.pile_id"
                class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                <TableCell class="text-left px-1 py-1">{{ i + 1 }}</TableCell>
                <TableCell class="text-left px-1 py-1.4">{{ dome.pile_id }}</TableCell>
                <TableCell class="text-left px-1 py-1.4">{{ dome.nama_material }}</TableCell>
                <!-- <TableCell>{{ dome.stockpile }}</TableCell> -->
                <TableCell class="text-right px-1 py-0.6">{{ format2(dome.total_ore) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ format2(dome.total_selling) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ format2(dome.balance) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ dome.ni }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ dome.fe }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ dome.al2o3 }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ dome.co }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ dome.mgo }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ dome.sio2 }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ dome.cao }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ dome.cr2o3 }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ dome.sm }}</TableCell>
              </TableRow>
              <!-- Summary row -->
              <TableRow v-if="summary">
                <TableCell colspan="3" class="font-bold">TOTAL</TableCell>
                <TableCell class="text-right px-1 py-0.6 font-semibold">{{ format2(summary.total_ore) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6 font-semibold">{{ format2(summary.total_selling) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6 font-semibold">{{ format2(summary.total_balance) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ format2(summary.avg_ni) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ format2(summary.avg_fe) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ format2(summary.avg_al2o3) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ format2(summary.avg_co) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ format2(summary.avg_mgo) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ format2(summary.avg_sio2) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ format2(summary.avg_cao) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">{{ format2(summary.avg_cr2o3) }}</TableCell>
                <TableCell class="text-right px-1 py-0.6">–</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <!-- Pagination Radix Vue -->


        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { URL_GET_DATA, BASE_URL } from '@/utils/api'

import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"

// Filter
const saleFilter = ref<string>('')  // atau ref('')
const areaFilter = ref<string[]>([])
const pointFilter = ref<string[]>([])

const areaSearch = ref('')
const pointSearch = ref('')

const areaOptions = ref<string[]>([])
const pointOptions = ref<string[]>([])

// Pagination & data
const page = ref(1)
const domes = ref<DomeItem[]>([])
const isLoading = ref(false)
const pagination = ref<{
  more: boolean
  total_pages: number
  current_page: number
  total_data: number
} | null>(null)


// Interface data
interface DomeItem {
  pile_id: string
  stockpile: string
  nama_material: string
  total_ore: number
  total_selling: number
  balance: number
  ni: number
  fe: number
  al2o3: number
  co: number
  mgo: number
  sio2: number
  cao: number
  cr2o3: number
  sm: number
}

const summary = ref<{
  total_ore: number
  total_released: number
  total_selling: number
  total_balance: number
  avg_ni: number
  avg_co: number
  avg_al2o3: number
  avg_cao: number
  avg_cr2o3: number
  avg_fe: number
  avg_mgo: number
  avg_sio2: number
  avg_mc: number
} | null>(null)


// Format angka 2 desimal
const format2 = (num: number | null | undefined) =>
  typeof num === 'number'
    ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
    : '-'

// Watch input pencarian dropdown (min 2 huruf)
watch(areaSearch, (val) => {
  if (val.length >= 2) fetchAreaOptions(val)
})
watch(pointSearch, (val) => {
  if (val.length >= 2) fetchPointOptions(val)
})

// Ambil data dropdown dari backend
async function fetchAreaOptions(query: string) {
  try {
    const res = await fetch(`${URL_GET_DATA}dropdown/get-mine/dumping-point/?q=${query}`)
    const data = await res.json()
    areaOptions.value = data.results.map((item: any) => item.text)
  } catch (error) {
    console.error('❌ Area dropdown failed:', error)
  }
}

async function fetchPointOptions(query: string) {
  try {
    const res = await fetch(`${URL_GET_DATA}dropdown/get-mine/dome/?q=${query}`)
    const data = await res.json()
    pointOptions.value = data.results.map((item: any) => item.text)
  } catch (error) {
    console.error('❌ Point dropdown failed:', error)
  }
}

// Ambil data inventory
async function fetchInventory() {
  isLoading.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', page.value.toString())


    // ✅ Kirim array langsung, tidak dibungkus [arrayFilter.value]
    params.append('areaFilter', JSON.stringify(areaFilter.value))
    params.append('pointFilter', JSON.stringify(pointFilter.value))

    const url = `${URL_GET_DATA}dashboard/api/inventory-sap/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    domes.value = data.data || []
    pagination.value = data.pagination
    summary.value = data.summary || null  // ⬅️ Tambahkan ini
  } catch (error) {
    console.error('❌ Failed to fetch inventory:', error)
    domes.value = []
  } finally {
    isLoading.value = false
  }
}

// Ambil ulang data jika filter/page berubah
watch([areaFilter, pointFilter, page], fetchInventory, { immediate: true })
</script>
