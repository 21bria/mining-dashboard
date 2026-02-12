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

const type = ref<"range" | "year">("range")

const material = ref<any>(null)
// range mode
const dateStart = ref<any>(null)
const dateEnd = ref<any>(null)

// year mode (gunakan string biar cocok dengan <Select>)
const selectedYear = ref<string | undefined>(String(new Date().getFullYear()))
const years = computed(() => {
  const current = new Date().getFullYear()
  return [current, current - 1, current - 2].map(String) // → array of string
})

const canExport = computed(() => {
  if (type.value === "range") {
    return !!(dateStart.value && dateEnd.value)
  }
  if (type.value === "year") {
    return !!selectedYear.value
  }
  return false
})

const endpoint = 'excel/export/data/coa/'

function exportExcel() {
  const params = new URLSearchParams()

  if (type.value === 'range') {
    if (!dateStart.value || !dateEnd.value) {
      toast({
        title: "Error",
        description: "Start or End date not selected",
        variant: "destructive",
      })
      return
    }

    // ✅ convert ke Date asli
    const dsDate = toDate(dateStart.value)
    const deDate = toDate(dateEnd.value)

    const diffDays = Math.floor(
      (deDate.getTime() - dsDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1

    if (diffDays > 31) {
      toast({
        title: "Range Too Long",
        description: "Maximum only 31 days allowed",
        variant: "destructive",
      })
      return
    }


    const ds = dateStart.value.toString()   // langsung format "YYYY-MM-DD"
    const de = dateEnd.value.toString()

    params.set('mode', 'range')
    params.set('date_start', ds)
    params.set('date_end', de)
  } else if (type.value === 'year') {
    params.set('mode', 'year')
    params.set('year', String(selectedYear.value))
  }

  // tambahkan filter material (jangan lupa cek null/All)
  if (material.value && material.value !== "-") {
    params.set("material", material.value)
  }

  // rakit full url
  const url = `${URL_GET_DATA}${endpoint}?${params.toString()}`
  console.log("Download URL:", url)
  window.open(url, '_blank')
}

</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Export Unified Report (COA)</h3>
    <p class="text-sm text-muted-foreground mb-4">
      Select export type (Range or Year)
    </p>
    <Separator class="mb-4" />

    <!-- Mode selector -->
    <div class="mb-4">
      <label class="font-medium block mb-2">Type</label>
      <Select v-model="type">
        <SelectTrigger class="w-40">
          <SelectValue placeholder="Select Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Filter Type</SelectLabel>
            <SelectItem value="range">Range</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <div class="mb-4">
      <label class="font-medium block mb-2">Materials</label>
      <Select v-model="material">
        <SelectTrigger class="w-40">
          <SelectValue placeholder="Select Material" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Filter Material</SelectLabel>
            <SelectItem value="-">All</SelectItem>
            <SelectItem value="HPAL">LIM</SelectItem>
            <SelectItem value="RKEF">SAP</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <!-- Range Mode -->
    <div v-if="type === 'range'" class="flex gap-6 mb-4">
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

    <!-- Year Mode -->
    <div v-else class="mb-4">
      <label class="font-medium block mb-2">Select Year</label>
      <Select v-model="selectedYear">
        <SelectTrigger class="w-40">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Year</SelectLabel>
            <SelectItem v-for="y in years" :key="y" :value="y">
              {{ y }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <Button :disabled="!canExport" @click="exportExcel">
      Export Excel
    </Button>
  </div>
</template>
