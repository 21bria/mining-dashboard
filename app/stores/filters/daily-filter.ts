// stores/chart-filter.ts

import { defineStore } from 'pinia'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const useDailyFilterStore = defineStore('dailyFilter', {
  state: () => ({
    date: todayISO()   // default = hari ini
  }),

  actions: {
    setDate(date: string) {
      this.date = date
    }
  }
})
