<template>
  <div>
    <h3 class="text-lg font-medium">Export Unified Report</h3>
    <p class="text-sm text-muted-foreground mb-4">
      Select the export module and period
    </p>
    <Separator class="mb-4" />

    <!-- Pilih module -->
    <div class="mb-4">
      <label class="font-medium block mb-2">Module</label>
      <Select v-model="module">
        <SelectTrigger class="w-40">
          <SelectValue placeholder="Select Module" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Module</SelectLabel>
            <SelectItem value="mining">Mining</SelectItem>
            <SelectItem value="quality">Quality</SelectItem>
            <SelectItem value="selling">Selling</SelectItem>
            <SelectItem value="inventory">Inventory</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <!-- Pilih Range -->
    <div class="flex gap-6 mb-4">
      <div>
        <label class="font-medium block mb-2">Date Start</label>
        <Calendar v-model="dateStart" :min-value="new CalendarDate(2000, 1, 1)"
          :max-value="today(getLocalTimeZone())" />
      </div>
      <div>
        <label class="font-medium block mb-2">Date End</label>
        <Calendar v-model="dateEnd" :min-value="new CalendarDate(2000, 1, 1)" :max-value="today(getLocalTimeZone())" />
      </div>
    </div>

    <!-- Tombol Export -->
    <Button :disabled="!canExport" @click="exportExcel">
      Export Excel
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date"
import { toDate } from "radix-vue/date"   // ✅ tambahkan ini
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectGroup, SelectItem, SelectLabel
} from '@/components/ui/select'

import { URL_GET_DATA } from '@/utils/api'

type ModuleOption = "mining" | "quality" | "selling" | "inventory"

const module = ref<ModuleOption | undefined>(undefined)

// range mode
const dateStart = ref<any>(null)
const dateEnd = ref<any>(null)

const canExport = computed(() => {
  return !!(module.value && dateStart.value && dateEnd.value)
})

const endpoint = 'excel/export/data/'

function exportExcel() {
  if (!module.value || !dateStart.value || !dateEnd.value) return

  // ✅ convert ke Date asli
  const dsDate = toDate(dateStart.value)
  const deDate = toDate(dateEnd.value)

  const diffDays = Math.floor(
    (deDate.getTime() - dsDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  if (diffDays > 93) {
    toast({
      title: "Range Too Long",
      // description: "Maximum only 31 days allowed",
      description: "Maximum only 93 days or 3 month allowed",
      variant: "destructive",
    })
    return
  }

  // const ds = dsDate.toISOString().split("T")[0]
  // const de = deDate.toISOString().split("T")[0]
  const ds = dateStart.value.toString()   // langsung format "YYYY-MM-DD"
  const de = dateEnd.value.toString()

  const params = new URLSearchParams()
  params.set("module", module.value)
  params.set("date_start", ds)
  params.set("date_end", de)

  const url = `${URL_GET_DATA}${endpoint}?${params.toString()}`
  console.log("Download URL:", url)
  window.open(url, "_blank")
}
</script>
