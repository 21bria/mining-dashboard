<template>
  <div class="flex items-center gap-3">
    <div class="flex-1">
      <DatePicker v-model="selectedDate" :single="true" class="w-full" />
    </div>

    <Button @click="emitFilters" :disabled="!selectedDate" class="shrink-0">
      Filter
    </Button>
  </div>
</template>




<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DatePicker from '@/components/filters/DatePicker.vue'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const selectedDate = ref<string>(todayISO())

const emit = defineEmits<{
  (e: 'apply', payload: { date: string }): void
}>()

function emitFilters() {
  emit('apply', { date: selectedDate.value })
}
</script>
