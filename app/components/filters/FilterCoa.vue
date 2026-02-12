<template>
  <div class="flex flex-wrap gap-3 items-center">
    <!-- Tipe Filter -->
    <Select v-model="filterType">
      <SelectTrigger class="w-40">
        <SelectValue placeholder="Select Filter Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Filter Type</SelectLabel>
          <SelectItem v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <!-- Material Filter -->
    <Select v-model="materialFilter">
      <SelectTrigger class="w-40">
        <SelectValue placeholder="Select Material" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Material</SelectLabel>
          <SelectItem value="HPAL">Limonite</SelectItem>
          <SelectItem value="RKEF">Saprolite</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <!-- Dynamic Pickers -->
    <YearPicker  v-if="showYear"  v-model="selectedYear" />
    <MonthPicker v-if="showMonth" v-model="selectedMonth" />

    <!-- Apply Button -->
    <Button @click="emitFilters" :disabled="!filterType">
      Filter
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectGroup, SelectItem, SelectLabel
} from '@/components/ui/select'

import YearPicker from '@/components/filters/YearPicker.vue'
import MonthPicker from '@/components/filters/MonthPicker.vue'

type FilterOption = {
  value: string
  label: string
}

const filterOptions: FilterOption[] = [
  { value: 'yearly', label: 'Yearly' },
  { value: 'monthly', label: 'Monthly' },
]

type FilterType = typeof filterOptions[number]['value']

const filterType = ref<FilterType>('monthly')

// Tambahan untuk material
const materialFilter = ref<string | undefined>()

const selectedYear  = ref<number | undefined>(new Date().getFullYear())
const selectedMonth = ref<number | undefined>(new Date().getMonth() + 1)

const showYear  = computed(() => ['yearly', 'monthly', 'weekly'].includes(filterType.value))
const showMonth = computed(() => ['monthly', 'weekly'].includes(filterType.value))

watch(filterType, () => {
  if (!['monthly', 'yearly'].includes(filterType.value)) {
    selectedYear.value = undefined
  }
  if (!['monthly'].includes(filterType.value)) {
    selectedMonth.value = undefined
  }
})


const emit = defineEmits<{
  (e: 'apply', payload: {
    type: FilterType
    year?: number
    month?: number
    materialFilter?: string
  }): void
}>()


function emitFilters() {
  emit('apply', {
    type: filterType.value,
    year: selectedYear.value,
    month: selectedMonth.value,
    materialFilter: materialFilter.value
  })
}
</script>