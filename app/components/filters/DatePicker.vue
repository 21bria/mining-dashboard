<template>
  <div class="flex items-center gap-2">
    <!-- SINGLE DATE -->
    <input v-if="single" type="date" v-model="date" @input="emitSingle"
      class="form-input px-3 py-2 rounded-md border text-sm bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-violet-500" />

    <!-- RANGE DATE -->
    <template v-else>
      <input type="date" v-model="startDate" @input="emitRange"
        class="form-input px-3 py-2 rounded-md border text-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600" />
      <span class="text-gray-500 dark:text-gray-400">to</span>
      <input type="date" v-model="endDate" @input="emitRange"
        class="form-input px-3 py-2 rounded-md border text-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Props typing
type RangeValue = {
  start: string
  end: string
}

type ModelValue = string | RangeValue

const props = defineProps<{
  modelValue: ModelValue
  single?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue): void
}>()

// SINGLE MODE
const date = ref<string>(typeof props.modelValue === 'string' ? props.modelValue : '')

// RANGE MODE
const startDate = ref<string>((props.modelValue as RangeValue)?.start || '')
const endDate = ref<string>((props.modelValue as RangeValue)?.end || '')

// Sync when prop changes
watch(() => props.modelValue, (val) => {
  if (props.single) {
    date.value = typeof val === 'string' ? val : ''
  } else {
    const range = val as RangeValue
    startDate.value = range?.start || ''
    endDate.value = range?.end || ''
  }
})

// Emitters
const emitSingle = () => emit('update:modelValue', date.value)
const emitRange = () => emit('update:modelValue', { start: startDate.value, end: endDate.value })
</script>
