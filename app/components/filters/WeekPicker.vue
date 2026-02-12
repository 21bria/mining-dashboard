<template>
  <Select v-model="internalValue" @update:modelValue="emit('update:modelValue', parseInt($event))">
    <SelectTrigger class="w-52">
      <SelectValue :placeholder="selectedLabel || 'Select Week'" />
    </SelectTrigger>

    <SelectContent>
      <SelectGroup>
        <SelectLabel>Weeks</SelectLabel>
        <SelectItem v-for="week in weeks" :key="week.value" :value="String(week.value)">
          {{ week.label }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
defineOptions({ name: 'WeekPicker' })

import { ref, watch, computed } from 'vue'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel
} from '@/components/ui/select'

// Props
const props = defineProps<{
  modelValue?: number
  year?: number
  month?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

// internalValue harus string
const internalValue = ref<string>(props.modelValue ? String(props.modelValue) : '')

watch(() => props.modelValue, (val) => {
  if (val !== undefined && val !== null) {
    internalValue.value = String(val)
  }
})

// Emit to parent
watch(internalValue, (val) => {
  if (val) emit('update:modelValue', parseInt(val))
})

// Week generator
function getWeeksInMonth(year: number, month: number) {
  const weeks: { value: number; label: string }[] = []
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  let start = new Date(firstDay)

  while (start <= lastDay) {
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    if (end > lastDay) end.setDate(lastDay.getDate())

    const weekNumber = getISOWeekNumber(start)
    weeks.push({
      value: weekNumber,
      label: `Week ${weekNumber} (${start.getDate()}–${end.getDate()})`
    })

    start.setDate(start.getDate() + 7)
  }

  return weeks
}

function getISOWeekNumber(date: Date): number {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = temp.getUTCDay() || 7
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1))
  return Math.ceil((((+temp - +yearStart) / 86400000) + 1) / 7)
}

// Weeks berdasarkan tahun dan bulan
const weeks = computed(() => {
  if (!props.year || !props.month) return []
  return getWeeksInMonth(props.year, props.month)
})

// Selected label (untuk placeholder)
const selectedLabel = computed(() =>
  weeks.value.find(w => w.value === parseInt(internalValue.value))?.label
)
</script>
