<template>
  <div class="p-4">
    <div class="grid grid-cols-2 gap-4">
      <CalendarMonth
        :month="displayedMonth"
        :selected="selected"
        @select="onSelect"
      />
      <CalendarMonth
        :month="displayedMonthNext"
        :selected="selected"
        @select="onSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { startOfMonth, addMonths, isSameDay, isAfter, isBefore } from 'date-fns'

const props = defineProps<{
  modelValue: { start: Date | null; end: Date | null }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { start: Date | null; end: Date | null }): void
}>()

const today = new Date()
const displayedMonth = ref(startOfMonth(today))
const displayedMonthNext = computed(() => addMonths(displayedMonth.value, 1))

const selected = ref({ ...props.modelValue })

watch(() => props.modelValue, (val) => {
  selected.value = { ...val }
})

function onSelect(date: Date) {
  const { start, end } = selected.value
  if (!start || (start && end)) {
    selected.value = { start: date, end: null }
  } else if (start && !end) {
    if (isBefore(date, start)) {
      selected.value = { start: date, end: start }
    } else {
      selected.value = { start, end: date }
    }
  }
  emit('update:modelValue', selected.value)
}
</script>
