<template>
  <div class="w-full flex flex-col gap-4">
    <!-- Header -->
    <div class="mb-2 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Finish by Stockpile</h1>
        <button @click="$router.push('/')" class="text-sm text-blue-500 underline mt-1">
          ← Back to Home
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex justify-end mt-2">
      <div class="flex flex-wrap items-center gap-4 mt-2">
        <!-- Sale Filter -->
        <div class="min-w-[200px]">
          <Select v-model="saleFilter">
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <!-- <SelectItem value="">None</SelectItem>   -->
                <SelectItem value="Select">Select material</SelectItem>
                <SelectItem value="HPAL">Limonite</SelectItem>
                <SelectItem value="RKEF">Saprolite</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Area Filter -->
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="min-w-[250px] justify-start">
              {{ areaFilter.length ? areaFilter.join(', ') : 'Select stockpile(s)' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" class="w-64 z-50">
            <ScrollArea class="h-48">
              <Input v-model="areaSearch" placeholder="Search stockpile..." class="form-input w-full mb-2" />
              <div class="space-y-0">
                <label v-for="area in areaOptions" :key="area" class="flex items-center gap-2">
                  <input type="checkbox" :value="area" v-model="areaFilter" class="form-checkbox" />
                  <span>{{ area }}</span>
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
        <CardTitle>Stockpile Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="py-4 text-center text-sm text-gray-500">Loading...</div>
        <div v-else>
          <Table>
            <TableCaption>Latest inventory list</TableCaption>
            <TableRow>
              <TableHead>Stockpile</TableHead>
              <TableHead>Material</TableHead>
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
              <TableRow v-for="dome in domes" :key="dome.stockpile">
                <TableCell>{{ dome.stockpile }}</TableCell>
                <TableCell>{{ dome.nama_material }}</TableCell>
                <TableCell class="text-right">{{ format2(dome.total_ore) }}</TableCell>
                <TableCell class="text-right">{{ format2(dome.total_selling) }}</TableCell>
                <TableCell class="text-right">{{ format2(dome.balance) }}</TableCell>
                <TableCell class="text-right">{{ dome.ni }}</TableCell>
                <TableCell class="text-right">{{ dome.fe }}</TableCell>
                <TableCell class="text-right">{{ dome.al2o3 }}</TableCell>
                <TableCell class="text-right">{{ dome.co }}</TableCell>
                <TableCell class="text-right">{{ dome.mgo }}</TableCell>
                <TableCell class="text-right">{{ dome.sio2 }}</TableCell>
                <TableCell class="text-right">{{ dome.cao }}</TableCell>
                <TableCell class="text-right">{{ dome.cr2o3 }}</TableCell>
                <TableCell class="text-right">{{ dome.sm }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <!-- Pagination Radix Vue -->
          <div class="mt-6 flex justify-end">
            <Pagination v-slot="{ page: currentPage }" :total="pagination?.total_pages || 1" :default-page="page.value"
              @update:page="(p: number) => page.value = p">
              <PaginationList v-slot="{ items }" class="flex items-center gap-1">
                <PaginationFirst />
                <PaginationPrev />

                <template v-for="(item, index) in items" :key="index">
                  <PaginationListItem v-if="item.type === 'page'" :value="item.value" as-child>
                    <Button class="h-9 w-9 p-0" :variant="item.value === currentPage ? 'default' : 'outline'">
                      {{ item.value }}
                    </Button>
                  </PaginationListItem>
                  <PaginationEllipsis v-else :index="index" />
                </template>

                <PaginationNext />
                <PaginationLast />
              </PaginationList>
            </Pagination>
          </div>

        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { URL_GET_DATA, BASE_URL } from '@/utils/api'

import {
  PaginationRoot as Pagination,
  PaginationList,
  PaginationListItem
} from 'radix-vue'
import PaginationNext from '@/components/ui/pagination/PaginationNext.vue'
import PaginationPrev from '@/components/ui/pagination/PaginationPrevious.vue'
import PaginationFirst from '@/components/ui/pagination/PaginationFirst.vue'
import PaginationLast from '@/components/ui/pagination/PaginationLast.vue'
import PaginationEllipsis from '@/components/ui/pagination/PaginationEllipsis.vue'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// Filter
const saleFilter = ref<string>('')  // atau ref('')
const areaFilter = ref<string[]>([])

const areaSearch = ref('')

const areaOptions = ref<string[]>([])


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

// Format angka 2 desimal
const format2 = (num: number | null | undefined) =>
  typeof num === 'number'
    ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
    : '-'

// Watch input pencarian dropdown (min 2 huruf)
watch(areaSearch, (val) => {
  if (val.length >= 2) fetchAreaOptions(val)
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


// Ambil data inventory
async function fetchInventory() {
  isLoading.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', page.value.toString())
    // if (saleFilter.value) params.append('saleFilter', saleFilter.value)
    if (saleFilter.value && saleFilter.value !== 'Select') {
      params.append('saleFilter', saleFilter.value)
    }


    // ✅ Kirim array langsung, tidak dibungkus [arrayFilter.value]
    params.append('areaFilter', JSON.stringify(areaFilter.value))


    const url = `${URL_GET_DATA}dashboard/api/inventory-finish-stockpile/?${params.toString()}`
    const response = await fetch(url)
    const data = await response.json()

    domes.value = data.data || []
    pagination.value = data.pagination
  } catch (error) {
    console.error('❌ Failed to fetch inventory:', error)
    domes.value = []
  } finally {
    isLoading.value = false
  }
}

// Ambil ulang data jika filter/page berubah
watch([saleFilter, areaFilter, page], fetchInventory, { immediate: true })
</script>
