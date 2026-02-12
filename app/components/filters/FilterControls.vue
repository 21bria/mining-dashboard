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

    <!-- Dynamic Pickers -->
    <YearPicker v-if="showYear" v-model="selectedYear" />
    <MonthPicker v-if="showMonth" v-model="selectedMonth" />
    <WeekPicker v-if="showWeek" v-model="selectedWeek" :year="selectedYear" :month="selectedMonth" />
    <DatePicker v-if="filterType === 'range'" v-model="selectedRange" />
    <DatePicker v-if="filterType === 'daily'" v-model="selectedDate" :single="true" />

    <!-- Apply Button -->
    <Button @click="emitFilters" :disabled="!filterType">
      Filter
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel
} from '@/components/ui/select'

import YearPicker from '@/components/filters/YearPicker.vue'
import MonthPicker from '@/components/filters/MonthPicker.vue'
import WeekPicker from '@/components/filters/WeekPicker.vue'
import DatePicker from '@/components/filters/DatePicker.vue'

type FilterOption = {
  value: string
  label: string
}

const filterOptions: FilterOption[] = [
  { value: 'all', label: 'All Data' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'range', label: 'Range' },
  { value: 'daily', label: 'Daily' }
]

type FilterType = typeof filterOptions[number]['value']
const filterType = ref<FilterType>('monthly')

const selectedYear = ref<number | undefined>(new Date().getFullYear())
const selectedMonth = ref<number | undefined>(new Date().getMonth() + 1)
const selectedWeek = ref<number | undefined>(1)
const selectedRange = ref<{ start: string; end: string }>({ start: '', end: '' })
const selectedDate = ref<string>('')

const showYear = computed(() => ['yearly', 'monthly', 'weekly'].includes(filterType.value))
const showMonth = computed(() => ['monthly', 'weekly'].includes(filterType.value))
const showWeek = computed(() => filterType.value === 'weekly')

watch(filterType, () => {
  if (!['weekly', 'monthly', 'yearly'].includes(filterType.value)) {
    selectedYear.value = undefined
  }
  if (!['weekly', 'monthly'].includes(filterType.value)) {
    selectedMonth.value = undefined
  }
  if (filterType.value !== 'weekly') {
    selectedWeek.value = undefined
  }
  if (filterType.value !== 'range') {
    selectedRange.value = { start: '', end: '' }
  }
  if (filterType.value !== 'daily') {
    selectedDate.value = ''
  }
})

const emit = defineEmits<{
  (e: 'apply', payload: {
    type: FilterType
    year: number | undefined
    month: number | undefined
    week: number | undefined
    range: { start: string; end: string }
    date: string
  }): void
}>()

function emitFilters() {
  emit('apply', {
    type: filterType.value,
    year: selectedYear.value,
    month: selectedMonth.value,
    week: selectedWeek.value,
    range: selectedRange.value,
    date: selectedDate.value
  })
}
</script>
