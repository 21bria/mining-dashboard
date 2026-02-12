// stores/chartFilter.ts
import { defineStore } from 'pinia'

export const filterOptions = [
  { value: '', label: '-- Select --' },
  { value: 'all', label: 'All Data' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'range', label: 'Range' },
  { value: 'daily', label: 'Daily' }
] as const

export type LooseFilterType = typeof filterOptions[number]['value']
export type FilterType = Exclude<LooseFilterType, ''>

export interface ChartFilterPayload {
  type: FilterType
  year?: number
  month?: number
  week?: number
  range: { start: string; end: string }
  date: string
}



export const useChartFilterStore = defineStore('chartFilter', {
  state: () => {
    const now = new Date()
    const monthIndex = now.getMonth() + 1
    const monthName = now.toLocaleString('default', { month: 'short' })

    return {
      type: 'monthly' as LooseFilterType,
      year: now.getFullYear() as number | null,
      month: { name: monthName, value: monthIndex } as { name: string; value: number } | null,
      week: null as number | null,
      range: { start: '', end: '' },
      date: ''
    }
  },
  actions: {
    apply(payload: ChartFilterPayload) {
      this.type = payload.type
      this.year = payload.year ?? null
      this.month = payload.month
        ? {
            name: new Date(0, payload.month - 1).toLocaleString('default', { month: 'short' }),
            value: payload.month
          }
        : null
      this.week = payload.week ?? null
      this.range = payload.range
      this.date = payload.date
    },
    reset() {
      this.type = ''
      this.year = null
      this.month = null
      this.week = null
      this.range = { start: '', end: '' }
      this.date = ''
    }
  }
})
