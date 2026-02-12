<script setup lang="ts">
import { computed } from "vue";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import FilterControls from '@/components/filters/FilterMonitoring.vue'

const fx2 = (v: number | null | undefined) =>
  v ? Number(v).toFixed(2) : "-"

const isLoading = ref(false)
const sampleData = ref<any[]>([])

async function fetchSamples(params: {
  typeFilter?: string
  startDate?: string
  endDate?: string
}) {
  try {
    isLoading.value = true

    const q = new URLSearchParams()
    if (params.startDate) q.set('startDate', params.startDate)
    if (params.endDate) q.set('endDate', params.endDate)
    if (params.typeFilter) q.set('typeFilter', params.typeFilter);

    const url = `${URL_GET_DATA}selling/monitoring/sample/list/?${q.toString()}`
    const res = await fetch(url)
    const json = await res.json()

    sampleData.value = json.data ?? []
  } catch (err) {
    console.error("❌ Fetch Monitoring failed", err)
  } finally {
    isLoading.value = false
  }
}

const mappedSamples = computed(() =>
  sampleData.value.map(row => {
    const samples: any[] = [];

    // Plan / Monitoring / Split
    samples.push(
      { source: "Plan", ni: row.ni_plan, fe: row.fe_plan, co: row.co_plan, mgo: row.mgo_plan, sio2: row.sio2_plan },
      { source: "Monitoring", ni: row.ni_monitoring, fe: row.fe_monitoring, co: row.co_monitoring, mgo: row.mgo_monitoring, sio2: row.sio2_monitoring },
      { source: "Split", ni: row.ni_split, fe: row.fe_split, co: row.co_split, mgo: row.mgo_split, sio2: row.sio2_split }
    );

    // Officials (COA)
    if (row.officials && row.officials.length) {
      row.officials.forEach((o: any) => {
        samples.push({
          source: `COA - ${o.re_assay}`,
          ni: o.ni,
          fe: o.fe,
          co: o.co,
          mgo: o.mgo,
          sio2: o.sio2
        });
      });
    }

    return {
      ...row,
      samples
    };
  })
);
// Summary 
const summaryData = ref<any[]>([])
// ------------------- Grand Total Computed -------------------
const grandTotals = computed(() => {
  const totals = {
    totalOre: 0,
    sumNiInternal: 0,
    sumNiOfficial: 0,
    sumNiDiff: 0,
    sumNiDiffPerc: 0,
    sumFeInternal: 0,
    sumFeOfficial: 0,
    sumFeDiff: 0,
    sumFeDiffPerc: 0,
    sumSMInternal: 0,
    sumSMOfficial: 0,
    sumSMDiff: 0,
    sumSMDiffPerc: 0,
  }

  summaryData.value.forEach(row => {
    totals.totalOre += row.tonnage_official
    totals.sumNiInternal += row.tonnage_official * row.ni_split
    totals.sumNiOfficial += row.tonnage_official * row.ni_official
    totals.sumNiDiff += row.tonnage_official * row.ni_diff
    totals.sumNiDiffPerc += row.tonnage_official * row.ni_diff_perc

    totals.sumFeInternal += row.tonnage_official * row.fe_split
    totals.sumFeOfficial += row.tonnage_official * row.fe_official
    totals.sumFeDiff += row.tonnage_official * row.fe_diff
    totals.sumFeDiffPerc += row.tonnage_official * row.fe_diff_perc

    totals.sumSMInternal += row.tonnage_official * row.sm_split
    totals.sumSMOfficial += row.tonnage_official * row.sm_official
    totals.sumSMDiff += row.tonnage_official * row.sm_diff
    totals.sumSMDiffPerc += row.tonnage_official * row.sm_diff_perc
  })

  // Bagi dengan total ore untuk rata-rata
  if (totals.totalOre > 0) {
    totals.sumNiInternal /= totals.totalOre
    totals.sumNiOfficial /= totals.totalOre
    totals.sumNiDiff /= totals.totalOre
    totals.sumNiDiffPerc /= totals.totalOre
    totals.sumFeInternal /= totals.totalOre
    totals.sumFeOfficial /= totals.totalOre
    totals.sumFeDiff /= totals.totalOre
    totals.sumFeDiffPerc /= totals.totalOre
    totals.sumSMInternal /= totals.totalOre
    totals.sumSMOfficial /= totals.totalOre
    totals.sumSMDiff /= totals.totalOre
    totals.sumSMDiffPerc /= totals.totalOre
  }

  return totals
})

// ------------------- Fetch API -------------------
async function fetchSummary(params: { typeFilter?: string; startDate?: string; endDate?: string }) {
  try {
    isLoading.value = true

    const q = new URLSearchParams()
    if (params.typeFilter) q.set("typeFilter", params.typeFilter)
    if (params.startDate) q.set("startDate", params.startDate)
    if (params.endDate) q.set("endDate", params.endDate)

    const url = `${URL_GET_DATA}selling/monitoring/sample/summary/?${q.toString()}`
    const res = await fetch(url)
    const json = await res.json()

    summaryData.value = json.data ?? []
  } catch (err) {
    console.error("❌ Fetch Summary failed", err)
  } finally {
    isLoading.value = false
  }
}

// By Re-Assay
const summaryReAssay = ref<any[]>([])
// ------------------- Grand Total Computed -------------------
const grandTotalsReAssay = computed(() => {
  const totals = {
    totalOre: 0,
    sumNiInternal: 0,
    sumNiOfficial: 0,
    sumNiDiff: 0,
    sumNiDiffPerc: 0,
    sumFeInternal: 0,
    sumFeOfficial: 0,
    sumFeDiff: 0,
    sumFeDiffPerc: 0,
    sumSMInternal: 0,
    sumSMOfficial: 0,
    sumSMDiff: 0,
    sumSMDiffPerc: 0,
  }

  summaryReAssay.value.forEach(row => {
    totals.totalOre += row.tonnage_official
    totals.sumNiInternal += row.tonnage_official * row.ni_split
    totals.sumNiOfficial += row.tonnage_official * row.ni_official
    totals.sumNiDiff += row.tonnage_official * row.ni_diff
    totals.sumNiDiffPerc += row.tonnage_official * row.ni_diff_perc

    totals.sumFeInternal += row.tonnage_official * row.fe_split
    totals.sumFeOfficial += row.tonnage_official * row.fe_official
    totals.sumFeDiff += row.tonnage_official * row.fe_diff
    totals.sumFeDiffPerc += row.tonnage_official * row.fe_diff_perc

    totals.sumSMInternal += row.tonnage_official * row.sm_split
    totals.sumSMOfficial += row.tonnage_official * row.sm_official
    totals.sumSMDiff += row.tonnage_official * row.sm_diff
    totals.sumSMDiffPerc += row.tonnage_official * row.sm_diff_perc
  })

  // Bagi dengan total ore untuk rata-rata
  if (totals.totalOre > 0) {
    totals.sumNiInternal /= totals.totalOre
    totals.sumNiOfficial /= totals.totalOre
    totals.sumNiDiff /= totals.totalOre
    totals.sumNiDiffPerc /= totals.totalOre
    totals.sumFeInternal /= totals.totalOre
    totals.sumFeOfficial /= totals.totalOre
    totals.sumFeDiff /= totals.totalOre
    totals.sumFeDiffPerc /= totals.totalOre
    totals.sumSMInternal /= totals.totalOre
    totals.sumSMOfficial /= totals.totalOre
    totals.sumSMDiff /= totals.totalOre
    totals.sumSMDiffPerc /= totals.totalOre
  }

  return totals
})

// ------------------- Fetch API -------------------
async function fetchSummaryReAssay(params: { typeFilter?: string; startDate?: string; endDate?: string }) {
  try {
    isLoading.value = true

    const q = new URLSearchParams()
    if (params.typeFilter) q.set("typeFilter", params.typeFilter)
    if (params.startDate) q.set("startDate", params.startDate)
    if (params.endDate) q.set("endDate", params.endDate)

    const url = `${URL_GET_DATA}selling/monitoring/sample/summary/re-assay/?${q.toString()}`
    const res = await fetch(url)
    const json = await res.json()

    summaryReAssay.value = json.data ?? []
  } catch (err) {
    console.error("❌ Fetch Summary failed", err)
  } finally {
    isLoading.value = false
  }
}
// By Shipment Re-Assay
const summaryShipment = ref<any[]>([])
// ------------------- Grand Total Computed -------------------
const grandTotalShipment = computed(() => {
  const totals = {
    totalOre: 0,
    sumNiInternal: 0,
    sumNiOfficial: 0,
    sumNiDiff: 0,
    sumNiDiffPerc: 0,
    sumFeInternal: 0,
    sumFeOfficial: 0,
    sumFeDiff: 0,
    sumFeDiffPerc: 0,
    sumSMInternal: 0,
    sumSMOfficial: 0,
    sumSMDiff: 0,
    sumSMDiffPerc: 0,
  }

  summaryShipment.value.forEach(row => {
    totals.totalOre += row.tonnage_official
    totals.sumNiInternal += row.tonnage_official * row.ni_split
    totals.sumNiOfficial += row.tonnage_official * row.ni_official
    totals.sumNiDiff += row.tonnage_official * row.ni_diff
    totals.sumNiDiffPerc += row.tonnage_official * row.ni_diff_perc

    totals.sumFeInternal += row.tonnage_official * row.fe_split
    totals.sumFeOfficial += row.tonnage_official * row.fe_official
    totals.sumFeDiff += row.tonnage_official * row.fe_diff
    totals.sumFeDiffPerc += row.tonnage_official * row.fe_diff_perc

    totals.sumSMInternal += row.tonnage_official * row.sm_split
    totals.sumSMOfficial += row.tonnage_official * row.sm_official
    totals.sumSMDiff += row.tonnage_official * row.sm_diff
    totals.sumSMDiffPerc += row.tonnage_official * row.sm_diff_perc
  })

  // Bagi dengan total ore untuk rata-rata
  if (totals.totalOre > 0) {
    totals.sumNiInternal /= totals.totalOre
    totals.sumNiOfficial /= totals.totalOre
    totals.sumNiDiff /= totals.totalOre
    totals.sumNiDiffPerc /= totals.totalOre
    totals.sumFeInternal /= totals.totalOre
    totals.sumFeOfficial /= totals.totalOre
    totals.sumFeDiff /= totals.totalOre
    totals.sumFeDiffPerc /= totals.totalOre
    totals.sumSMInternal /= totals.totalOre
    totals.sumSMOfficial /= totals.totalOre
    totals.sumSMDiff /= totals.totalOre
    totals.sumSMDiffPerc /= totals.totalOre
  }

  return totals
})

// --- Grouping per buyer
const groupedShipment = computed(() => {
  return summaryShipment.value.reduce((acc, row) => {
    const key = row.buyer || "UNKNOWN";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {} as Record<string, any[]>);
});

// --- Helper functions
function subtotal(rows: any[], field: string) {
  return rows.reduce((sum, r) => sum + parseFloat(r[field]), 0);
}

function avg(rows: any[], field: string) {
  const totalOre = subtotal(rows, "tonnage_official");
  if (totalOre === 0) return 0;
  const weighted = rows.reduce((sum, r) => sum + parseFloat(r["tonnage_official"]) * parseFloat(r[field]), 0);
  return weighted / totalOre;
}
// ------------------- Fetch API -------------------
async function fetchSummaryShipment(params: { typeFilter?: string; startDate?: string; endDate?: string }) {
  try {
    isLoading.value = true

    const q = new URLSearchParams()
    if (params.typeFilter) q.set("typeFilter", params.typeFilter)
    if (params.startDate) q.set("startDate", params.startDate)
    if (params.endDate) q.set("endDate", params.endDate)

    const url = `${URL_GET_DATA}selling/monitoring/shipment/summary/?${q.toString()}`
    const res = await fetch(url)
    const json = await res.json()

    summaryShipment.value = json.data ?? []
  } catch (err) {
    console.error("❌ Fetch Summary failed", err)
  } finally {
    isLoading.value = false
  }
}

// By Shipment Re-Assay by Month
const summaryByMonth = ref<any[]>([])
// ------------------- Helper functions -------------------
function subtotalMonth(rows: any[], field: string) {
  return rows.reduce((sum, r) => sum + parseFloat(r[field] || 0), 0)
}

function avgMonth(rows: any[], field: string) {
  const totalOre = subtotalMonth(rows, "tonnage_official")
  if (totalOre === 0) return 0
  const weighted = rows.reduce(
    (sum, r) => sum + parseFloat(r["tonnage_official"] || 0) * parseFloat(r[field] || 0),
    0
  )
  return weighted / totalOre
}

// ------------------- Grand Total Computed -------------------
const grandTotaByMonth = computed(() => {
  const totals = {
    totalOre: 0,
    sumNiInternal: 0,
    sumNiOfficial: 0,
    sumNiDiff: 0,
    sumNiDiffPerc: 0,
    sumFeInternal: 0,
    sumFeOfficial: 0,
    sumFeDiff: 0,
    sumFeDiffPerc: 0,
    sumSMInternal: 0,
    sumSMOfficial: 0,
    sumSMDiff: 0,
    sumSMDiffPerc: 0,
  }

  summaryByMonth.value.forEach((row) => {
    const ton = parseFloat(row.tonnage_official || 0)
    totals.totalOre += ton
    totals.sumNiInternal += ton * (parseFloat(row.ni_split) || 0)
    totals.sumNiOfficial += ton * (parseFloat(row.ni_official) || 0)
    totals.sumNiDiff += ton * (parseFloat(row.ni_diff) || 0)
    totals.sumNiDiffPerc += ton * (parseFloat(row.ni_diff_perc) || 0)

    totals.sumFeInternal += ton * (parseFloat(row.fe_split) || 0)
    totals.sumFeOfficial += ton * (parseFloat(row.fe_official) || 0)
    totals.sumFeDiff += ton * (parseFloat(row.fe_diff) || 0)
    totals.sumFeDiffPerc += ton * (parseFloat(row.fe_diff_perc) || 0)

    totals.sumSMInternal += ton * (parseFloat(row.sm_split) || 0)
    totals.sumSMOfficial += ton * (parseFloat(row.sm_official) || 0)
    totals.sumSMDiff += ton * (parseFloat(row.sm_diff) || 0)
    totals.sumSMDiffPerc += ton * (parseFloat(row.sm_diff_perc) || 0)
  })

  // Bagi dengan total ore untuk rata-rata
  if (totals.totalOre > 0) {
    totals.sumNiInternal /= totals.totalOre
    totals.sumNiOfficial /= totals.totalOre
    totals.sumNiDiff /= totals.totalOre
    totals.sumNiDiffPerc /= totals.totalOre
    totals.sumFeInternal /= totals.totalOre
    totals.sumFeOfficial /= totals.totalOre
    totals.sumFeDiff /= totals.totalOre
    totals.sumFeDiffPerc /= totals.totalOre
    totals.sumSMInternal /= totals.totalOre
    totals.sumSMOfficial /= totals.totalOre
    totals.sumSMDiff /= totals.totalOre
    totals.sumSMDiffPerc /= totals.totalOre
  }

  return totals
})

// ------------------- Grouping per bulan -------------------
const groupedMonth = computed(() => {
  return summaryByMonth.value.reduce((acc, row) => {
    const key = row.month_name || "UNKNOWN"
    if (!acc[key]) acc[key] = []
    acc[key].push(row)
    return acc
  }, {} as Record<string, any[]>)
})

// ------------------- Fetch API -------------------
async function fetchSummaryMonth(params: { typeFilter?: string; startDate?: string; endDate?: string }) {
  try {
    isLoading.value = true

    const q = new URLSearchParams()
    if (params.typeFilter) q.set("typeFilter", params.typeFilter)
    if (params.startDate) q.set("startDate", params.startDate)
    if (params.endDate) q.set("endDate", params.endDate)

    const url = `${URL_GET_DATA}selling/monitoring/shipment/summary/by-month/?${q.toString()}`
    const res = await fetch(url)
    const json = await res.json()

    summaryByMonth.value = json.data ?? []
  } catch (err) {
    console.error("❌ Fetch Summary failed", err)
  } finally {
    isLoading.value = false
  }
}


// panggil saat user klik Apply
function handleApply(payload: { typeFilter: string; startDate: string; endDate: string }) {
  fetchSamples(payload);
  fetchSummary(payload);
  fetchSummaryReAssay(payload);
  fetchSummaryShipment(payload);
  fetchSummaryMonth(payload);

}


</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Compare Internal vs Official COA
        </h1>
        <p class="text-muted-foreground">
          Here&apos;s a list of your coa for this data!
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <FilterControls @apply="handleApply" />
      </div>
    </div>
    <div class="grid grid-cols-12 gap-6">
      <div class="xl:col-span-12 col-span-12">
    <Card class="w-full">
        <CardHeader>
          <!-- <CardTitle>Basic</CardTitle> -->
        </CardHeader>

        <CardContent>
          <div class="w-full flex flex-col">
            <Tabs default-value="monitoring" class="w-full">

              <!-- TAB HEADER -->
              <TabsList class="inline-flex gap-2">
                <TabsTrigger value="monitoring" class="text-sm w-auto px-4">
                  Monitoring
                </TabsTrigger>
                <TabsTrigger value="summary" class="text-sm w-auto px-4">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="summary-month" class="text-sm w-auto px-4">
                  By Month
                </TabsTrigger>
              </TabsList>


              <!-- TAB CONTENT 1 -->
              <TabsContent value="monitoring" class="w-full mt-4">
                <Card class="w-full overflow-x-auto mt-6">
                  <CardHeader>
                    <CardTitle class="text-base">Data Compare Internal vs Official</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div v-if="isLoading" class="py-4 text-center text-sm text-gray-500">Loading...</div>
                    <div v-else>
                      <Table class="text-sm table-auto border border-gray-200 dark:border-gray-700">
                        <TableCaption>Latest compare list</TableCaption>
                        <TableRow>
                          <TableHead>No</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead class="text-left">Barge Code</TableHead>
                          <TableHead class="text-left">Quantity</TableHead>
                          <TableHead class="text-left">Sample source</TableHead>
                          <TableHead class="text-right">Ni</TableHead>
                          <TableHead class="text-right">Fe</TableHead>
                          <TableHead class="text-right">Co</TableHead>
                          <TableHead class="text-right">MgO</TableHead>
                          <TableHead class="text-right">SiO2</TableHead>
                          <TableHead class="text-right">S/M</TableHead>
                        </TableRow>
                        <TableBody>
                          <template v-for="(row, i) in mappedSamples" :key="row.code_lot">
                            <template v-for="(samp, idx) in row.samples">
                              <TableRow
                                class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                                <TableCell v-if="idx === 0" :rowspan="row.samples.length" class="px-2 py-1">{{ i + 1 }}
                                </TableCell>
                                <TableCell v-if="idx === 0" :rowspan="row.samples.length" class="px-2 py-1">{{
                                  row.code_lot }}</TableCell>
                                <TableCell v-if="idx === 0" :rowspan="row.samples.length" class="px-2 py-1">{{
                                  row.barge_code }}</TableCell>
                                <TableCell v-if="idx === 0" :rowspan="row.samples.length" class="px-2 py-1 text-left">
                                  {{
                                    row.tonnage_split.toLocaleString() }}</TableCell>

                                <TableCell class="px-2 py-1">{{ samp.source }}</TableCell>
                                <TableCell class="px-2 py-1 text-right">{{ samp.ni?.toFixed(2) ?? "-" }}</TableCell>
                                <TableCell class="px-2 py-1 text-right">{{ samp.fe?.toFixed(2) ?? "-" }}</TableCell>
                                <TableCell class="px-2 py-1 text-right">{{ samp.co?.toFixed(2) ?? "-" }}</TableCell>
                                <TableCell class="px-2 py-1 text-right">{{ samp.mgo?.toFixed(2) ?? "-" }}</TableCell>
                                <TableCell class="px-2 py-1 text-right">{{ samp.sio2?.toFixed(2) ?? "-" }}</TableCell>
                                <TableCell class="px-2 py-1 text-right">{{ samp.mgo && samp.sio2 ?
                                  (samp.sio2 / samp.mgo).toFixed(2) : "-" }}</TableCell>
                              </TableRow>
                            </template>
                          </template>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <!-- TAB CONTENT 2 -->
              <TabsContent value="summary" class="w-full mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle class="text-base">Summary Selling Samples</CardTitle>
                    <CardDescription class="text-sm">
                      This section provides a summary of all selling samples, including monthly totals, internal and
                      surveyor
                      measurements.
                      Apply filters to focus on specific periods or types
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div v-if="isLoading" class="py-4 text-center text-sm text-gray-500">Loading...</div>
                    <div v-else class="overflow-auto">
                      <table class="table whitespace-nowrap mb-0 min-w-full ti-custom-table-hover text-sm">
                        <thead>
                          <!-- Row 1: Header utama -->
                          <TableRow
                            class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                            <TableHead colspan="4" class="text-center px-1 py-0.3">All Selling Original</TableHead>
                            <TableHead colspan="4" class="text-center px-1 py-0.3">Ni</TableHead>
                            <TableHead colspan="4" class="text-center px-1 py-0.3">Fe</TableHead>
                            <TableHead colspan="4" class="text-center px-1 py-0.3">S/M</TableHead>
                          </TableRow>

                          <!-- Row 2: Sub-header -->
                          <TableRow
                            class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                            <TableHead>No</TableHead>
                            <TableHead>Completed</TableHead>
                            <TableHead class="text-left">Barge Code</TableHead>
                            <TableHead class="text-right">Quantity</TableHead>

                            <TableHead class="text-right">Internal</TableHead>
                            <TableHead class="text-right">Surveyor</TableHead>
                            <TableHead class="text-right">Diff</TableHead>
                            <TableHead class="text-right">%Diff</TableHead>

                            <TableHead class="text-right">Internal</TableHead>
                            <TableHead class="text-right">Surveyor</TableHead>
                            <TableHead class="text-right">Diff</TableHead>
                            <TableHead class="text-right">%Diff</TableHead>

                            <TableHead class="text-right">Internal</TableHead>
                            <TableHead class="text-right">Surveyor</TableHead>
                            <TableHead class="text-right">Diff</TableHead>
                            <TableHead class="text-right">%Diff</TableHead>
                          </TableRow>
                        </thead>

                        <tbody>
                          <template v-for="(row, i) in summaryData" :key="row.code_lot">
                            <TableRow
                              class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                              <TableCell class="px-1 py-0.7">{{ i + 1 }}</TableCell>
                              <TableCell class="px-1 py-0.7">{{ row.date_barge_out }}</TableCell>
                              <TableCell class="px-1 py-0.7">{{ row.barge_name }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.tonnage_official.toLocaleString() }}
                              </TableCell>

                              <TableCell class="px-1 py-0.7 text-right">{{ row.ni_split.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.ni_official.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.ni_diff.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.ni_diff_perc.toFixed(2) }}</TableCell>

                              <TableCell class="px-1 py-0.7 text-right">{{ row.fe_split.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.fe_official.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.fe_diff.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.fe_diff_perc.toFixed(2) }}</TableCell>

                              <TableCell class="px-1 py-0.7 text-right">{{ row.sm_split.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.sm_official.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.sm_diff.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.sm_diff_perc.toFixed(2) }}</TableCell>
                            </TableRow>
                          </template>
                        </tbody>
                        <tfoot>
                          <tr class="text-sm">
                            <th colspan="3" class="px-1 py-0.7">Grand Total</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.totalOre.toLocaleString() }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumNiInternal.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumNiOfficial.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumNiDiff.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumNiDiffPerc.toFixed(2) }}</th>

                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumFeInternal.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumFeOfficial.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumFeDiff.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumFeDiffPerc.toFixed(2) }}</th>

                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumSMInternal.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumSMOfficial.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumSMDiff.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotals.sumSMDiffPerc.toFixed(2) }}</th>
                          </tr>
                        </tfoot>

                      </table>
                    </div>
                  </CardContent>
                  <!-- All Shipment after Re- Assay -->
                  <CardContent>
                    <div v-if="isLoading" class="py-4 text-center text-sm text-gray-500">Loading...</div>
                    <div v-else class="overflow-auto">
                      <table class="table whitespace-nowrap mb-0 min-w-full ti-custom-table-hover text-sm">
                        <thead>
                          <!-- Row 1: Header utama -->
                          <TableRow
                            class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                            <TableHead colspan="4" class="text-center px-1 py-0.3">All Shipment after Re-Assay
                            </TableHead>
                            <TableHead colspan="4" class="text-center px-1 py-0.3">Ni</TableHead>
                            <TableHead colspan="4" class="text-center px-1 py-0.3">Fe</TableHead>
                            <TableHead colspan="4" class="text-center px-1 py-0.3">S/M</TableHead>
                          </TableRow>

                          <!-- Row 2: Sub-header -->
                          <TableRow
                            class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                            <TableHead>No</TableHead>
                            <TableHead>Completed</TableHead>
                            <TableHead class="text-left">Barge Code</TableHead>
                            <TableHead class="text-right">Quantity</TableHead>

                            <TableHead class="text-right">Internal</TableHead>
                            <TableHead class="text-right">Surveyor</TableHead>
                            <TableHead class="text-right">Diff</TableHead>
                            <TableHead class="text-right">%Diff</TableHead>

                            <TableHead class="text-right">Internal</TableHead>
                            <TableHead class="text-right">Surveyor</TableHead>
                            <TableHead class="text-right">Diff</TableHead>
                            <TableHead class="text-right">%Diff</TableHead>

                            <TableHead class="text-right">Internal</TableHead>
                            <TableHead class="text-right">Surveyor</TableHead>
                            <TableHead class="text-right">Diff</TableHead>
                            <TableHead class="text-right">%Diff</TableHead>
                          </TableRow>
                        </thead>

                        <tbody>
                          <template v-for="(row, i) in summaryReAssay" :key="row.code_lot">
                            <TableRow
                              class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                              <TableCell class="px-1 py-0.7">{{ i + 1 }}</TableCell>
                              <TableCell class="px-1 py-0.7">{{ row.date_barge_out }}</TableCell>
                              <TableCell class="px-1 py-0.7">{{ row.barge_name }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.tonnage_official.toLocaleString() }}
                              </TableCell>

                              <TableCell class="px-1 py-0.7 text-right">{{ row.ni_split.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.ni_official.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.ni_diff.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.ni_diff_perc.toFixed(2) }}</TableCell>

                              <TableCell class="px-1 py-0.7 text-right">{{ row.fe_split.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.fe_official.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.fe_diff.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.fe_diff_perc.toFixed(2) }}</TableCell>

                              <TableCell class="px-1 py-0.7 text-right">{{ row.sm_split.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.sm_official.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.sm_diff.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.7 text-right">{{ row.sm_diff_perc.toFixed(2) }}</TableCell>
                            </TableRow>
                          </template>
                        </tbody>
                        <tfoot>
                          <tr class="text-sm">
                            <th colspan="3" class="px-1 py-0.7">Grand Total</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.totalOre.toLocaleString() }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumNiInternal.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumNiOfficial.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumNiDiff.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumNiDiffPerc.toFixed(2) }}</th>

                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumFeInternal.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumFeOfficial.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumFeDiff.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumFeDiffPerc.toFixed(2) }}</th>

                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumSMInternal.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumSMOfficial.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumSMDiff.toFixed(2) }}</th>
                            <th class="px-1 py-0.7 text-right">{{ grandTotalsReAssay.sumSMDiffPerc.toFixed(2) }}</th>
                          </tr>
                        </tfoot>

                      </table>
                    </div>
                  </CardContent>

                  <!-- By Shipment after Re-Assay -->
                  <CardContent>
                    <div v-if="isLoading" class="py-4 text-center text-sm text-gray-500">Loading...</div>
                    <div v-else class="overflow-auto">
                      <table class="table whitespace-nowrap mb-0 min-w-full ti-custom-table-hover text-sm">
                        <thead>
                          <!-- Row 1: Header utama -->
                          <TableRow
                            class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                            <TableHead colspan="4" class="text-center px-1 py-0.3">Selling By Shipment </TableHead>
                            <TableHead colspan="4" class="text-center px-1 py-0.3">Ni</TableHead>
                            <TableHead colspan="4" class="text-center px-1 py-0.3">Fe</TableHead>
                            <TableHead colspan="4" class="text-center px-1 py-0.3">S/M</TableHead>
                          </TableRow>

                          <!-- Row 2: Sub-header -->
                          <TableRow
                            class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                            <TableHead>No</TableHead>
                            <TableHead>Completed</TableHead>
                            <TableHead class="text-left">Barge Code</TableHead>
                            <TableHead class="text-right">Quantity</TableHead>

                            <TableHead class="text-right">Internal</TableHead>
                            <TableHead class="text-right">Surveyor</TableHead>
                            <TableHead class="text-right">Diff</TableHead>
                            <TableHead class="text-right">%Diff</TableHead>

                            <TableHead class="text-right">Internal</TableHead>
                            <TableHead class="text-right">Surveyor</TableHead>
                            <TableHead class="text-right">Diff</TableHead>
                            <TableHead class="text-right">%Diff</TableHead>

                            <TableHead class="text-right">Internal</TableHead>
                            <TableHead class="text-right">Surveyor</TableHead>
                            <TableHead class="text-right">Diff</TableHead>
                            <TableHead class="text-right">%Diff</TableHead>
                          </TableRow>
                        </thead>

                        <tbody>
                          <template v-for="(group, buyer) in groupedShipment" :key="buyer">
                            <!-- Header per Buyer -->
                            <TableRow class="font-bold bg-gray-200 dark:bg-gray-700 text-sm">
                              <TableCell colspan="16">Shipment to {{ buyer }}</TableCell>
                            </TableRow>

                            <!-- Rows per buyer -->
                            <TableRow v-for="(row, i) in group" :key="row.code_lot"
                              class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                              <TableCell class="px-1 py-0.5">{{ i + 1 }}</TableCell>
                              <TableCell class="px-1 py-0.5">{{ row.date_barge_out }}</TableCell>
                              <TableCell class="px-1 py-0.5">{{ row.barge_name }}</TableCell>
                              <TableCell class="px-1 py-0.5 text-right">{{ row.tonnage_official.toLocaleString() }}
                              </TableCell>

                              <TableCell class="px-1 py-0.5 text-right">{{ row.ni_split.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.5 text-right">{{ row.ni_official.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.5 text-right">{{ row.ni_diff.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.5 text-right">{{ row.ni_diff_perc.toFixed(2) }}</TableCell>

                              <TableCell class="px-1 py-0.5 text-right">{{ row.fe_split.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.5 text-right">{{ row.fe_official.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.5 text-right">{{ row.fe_diff.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.5 text-right">{{ row.fe_diff_perc.toFixed(2) }}</TableCell>

                              <TableCell class="px-1 py-0.5 text-right">{{ row.sm_split.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.5 text-right">{{ row.sm_official.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.5 text-right">{{ row.sm_diff.toFixed(2) }}</TableCell>
                              <TableCell class="px-1 py-0.5 text-right">{{ row.sm_diff_perc.toFixed(2) }}</TableCell>
                            </TableRow>

                            <!-- Subtotal per buyer -->
                            <TableRow class="font-bold bg-gray-100 dark:bg-gray-800">
                              <TableCell colspan="3" class="text-right">Subtotal</TableCell>
                              <TableCell class="text-right">{{ subtotal(group, 'tonnage_official').toLocaleString() }}
                              </TableCell>

                              <TableCell class="text-right">{{ avg(group, 'ni_split').toFixed(2) }}</TableCell>
                              <TableCell class="text-right">{{ avg(group, 'ni_official').toFixed(2) }}</TableCell>
                              <TableCell class="text-right">{{ avg(group, 'ni_diff').toFixed(2) }}</TableCell>
                              <TableCell class="text-right">{{ avg(group, 'ni_diff_perc').toFixed(2) }}</TableCell>

                              <TableCell class="text-right">{{ avg(group, 'fe_split').toFixed(2) }}</TableCell>
                              <TableCell class="text-right">{{ avg(group, 'fe_official').toFixed(2) }}</TableCell>
                              <TableCell class="text-right">{{ avg(group, 'fe_diff').toFixed(2) }}</TableCell>
                              <TableCell class="text-right">{{ avg(group, 'fe_diff_perc').toFixed(2) }}</TableCell>

                              <TableCell class="text-right">{{ avg(group, 'sm_split').toFixed(2) }}</TableCell>
                              <TableCell class="text-right">{{ avg(group, 'sm_official').toFixed(2) }}</TableCell>
                              <TableCell class="text-right">{{ avg(group, 'sm_diff').toFixed(2) }}</TableCell>
                              <TableCell class="text-right">{{ avg(group, 'sm_diff_perc').toFixed(2) }}</TableCell>
                            </TableRow>
                          </template>
                        </tbody>

                        <!-- GRAND TOTAL -->
                        <tfoot>
                          <TableRow
                            class="font-bold odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm">
                            <TableCell colspan="3" class="text-right">Grand Total</TableCell>
                            <TableCell class="text-right">{{ grandTotalShipment.totalOre.toLocaleString() }}</TableCell>

                            <TableCell class="text-right">{{ grandTotalShipment.sumNiInternal.toFixed(2) }}</TableCell>
                            <TableCell class="text-right">{{ grandTotalShipment.sumNiOfficial.toFixed(2) }}</TableCell>
                            <TableCell class="text-right">{{ grandTotalShipment.sumNiDiff.toFixed(2) }}</TableCell>
                            <TableCell class="text-right">{{ grandTotalShipment.sumNiDiffPerc.toFixed(2) }}</TableCell>

                            <TableCell class="text-right">{{ grandTotalShipment.sumFeInternal.toFixed(2) }}</TableCell>
                            <TableCell class="text-right">{{ grandTotalShipment.sumFeOfficial.toFixed(2) }}</TableCell>
                            <TableCell class="text-right">{{ grandTotalShipment.sumFeDiff.toFixed(2) }}</TableCell>
                            <TableCell class="text-right">{{ grandTotalShipment.sumFeDiffPerc.toFixed(2) }}</TableCell>

                            <TableCell class="text-right">{{ grandTotalShipment.sumSMInternal.toFixed(2) }}</TableCell>
                            <TableCell class="text-right">{{ grandTotalShipment.sumSMOfficial.toFixed(2) }}</TableCell>
                            <TableCell class="text-right">{{ grandTotalShipment.sumSMDiff.toFixed(2) }}</TableCell>
                            <TableCell class="text-right">{{ grandTotalShipment.sumSMDiffPerc.toFixed(2) }}</TableCell>
                          </TableRow>
                        </tfoot>

                      </table>
                    </div>
                  </CardContent>

                </Card>
              </TabsContent>

              <!-- TAB CONTENT 3 -->
              <TabsContent value="summary-month" class="w-full mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle class="text-base">By Month</CardTitle>
                    <CardDescription class="text-sm">
                      Here you can explore your data month by month. Apply filters to see totals and averages for each
                      month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div v-if="isLoading" class="py-4 text-center text-sm text-gray-500">Loading...</div>
                    <div v-else class="overflow-auto">
                      <table
                        class="table whitespace-nowrap mb-0 min-w-full ti-custom-table-hover text-sm border border-gray-300 dark:border-gray-600">
                        <thead>
                          <!-- Row 1: Header utama -->
                          <TableRow
                            class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm border-b border-gray-300 dark:border-gray-600">
                            <TableHead colspan="5" class="text-center px-1 py-0.5 border-gray-300 dark:border-gray-600">
                              All
                              Selling</TableHead>
                            <TableHead colspan="3" class="text-center px-1 py-0.5 border-gray-300 dark:border-gray-600">
                              Internal</TableHead>
                            <TableHead colspan="3" class="text-center px-1 py-0.5">Surveyor</TableHead>
                          </TableRow>

                          <!-- Row 2: Sub-header -->
                          <TableRow
                            class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/20 dark:even:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-sm border-b border-gray-300 dark:border-gray-600">
                            <TableHead class="border-gray-300 dark:border-gray-600">Month</TableHead>
                            <TableHead class="border-gray-300 dark:border-gray-600">Type</TableHead>
                            <TableHead class=" border-gray-300 dark:border-gray-600">Destination</TableHead>
                            <TableHead class="text-left  border-gray-300 dark:border-gray-600">Barge</TableHead>
                            <TableHead class="text-right border-gray-300 dark:border-gray-600">Quantity
                            </TableHead>

                            <TableHead class="text-right border-gray-300 dark:border-gray-600">Ni</TableHead>
                            <TableHead class="text-right border-gray-300 dark:border-gray-600">Fe</TableHead>
                            <TableHead class="text-right border-gray-300 dark:border-gray-600">S/M</TableHead>

                            <TableHead class="text-right border-gray-300 dark:border-gray-600">Ni</TableHead>
                            <TableHead class="text-right border-gray-300 dark:border-gray-600">Fe</TableHead>
                            <TableHead class="text-right">S/M</TableHead>
                          </TableRow>
                        </thead>

                        <tbody>
                          <template v-for="(group, month) in groupedMonth" :key="month">
                            <!-- Header per Month -->
                            <tr
                              class="font-bold bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                              <td colspan="12">Data : {{ month }}</td>
                            </tr>

                            <!-- Rows -->
                            <tr v-for="(row, i) in group" :key="row.code_lot"
                              class="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                              <td class="border-r border-gray-200 dark:border-gray-600 px-1 py-0.5">{{ i + 1 }}</td>
                              <td class="border-r border-gray-200 dark:border-gray-600 px-1 py-0.5">{{ row.type_selling=== 'LIS' ?
                                'Limonite' : row.type_selling === 'SAS' ? 'Saprolite' : row.type_selling }}</td>
                              <td class="border-r border-gray-200 dark:border-gray-600 px-1 py-0.5">{{ row.buyer }}</td>
                              <td class="border-r border-gray-200 dark:border-gray-600 px-1 py-0.5">{{ row.total_barge}}</td>
                              <td class="text-right border-r border-gray-200 dark:border-gray-600 px-1 py-0.5">{{
                                row.tonnage_official.toLocaleString('en-US', { maximumFractionDigits: 2 }) }}</td>
                              <td class="text-right border-r border-gray-200 dark:border-gray-600 px-1 py-0.5 ">{{
                                row.ni_split.toFixed(2) }}</td>
                              <td class="text-right border-r border-gray-200 dark:border-gray-600 px-1 py-0.5">{{
                                row.fe_split.toFixed(2) }}</td>
                              <td class="text-right border-r border-gray-200 dark:border-gray-600 px-1 py-0.5">{{
                                row.sm_split.toFixed(2) }}</td>
                              <td class="text-right border-r border-gray-200 dark:border-gray-600 px-1 py-0.5">{{
                                row.ni_official.toFixed(2) }}</td>
                              <td class="text-right border-r border-gray-200 dark:border-gray-600 px-1 py-0.5">{{
                                row.fe_official.toFixed(2) }}</td>
                              <td class="text-right px-1 py-0.5">{{ row.sm_official.toFixed(2) }}</td>
                            </tr>

                            <!-- Subtotal per month -->
                            <tr
                              class="font-bold bg-gray-50 dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-600">
                              <td colspan="4">Total {{ month }}</td>
                              <td class="text-right px-1 py-0.5">{{ subtotalMonth(group,
                                'tonnage_official').toLocaleString('en-US', { maximumFractionDigits: 2 }) }}</td>
                              <td class="text-right px-1 py-0.5">{{ avgMonth(group, 'ni_split').toFixed(2) }}</td>
                              <td class="text-right px-1 py-0.5">{{ avgMonth(group, 'fe_split').toFixed(2) }}</td>
                              <td class="text-right px-1 py-0.5">{{ avgMonth(group, 'sm_split').toFixed(2) }}</td>
                              <td class="text-right px-1 py-0.5">{{ avgMonth(group, 'ni_official').toFixed(2) }}</td>
                              <td class="text-right px-1 py-0.5">{{ avgMonth(group, 'fe_official').toFixed(2) }}</td>
                              <td class="text-right px-1 py-0.5">{{ avgMonth(group, 'sm_official').toFixed(2) }}</td>
                            </tr>
                          </template>
                        </tbody>

                        <tfoot>
                          <tr
                            class="font-bold bg-gray-200 dark:bg-gray-700 border-t border-gray-300 dark:border-gray-600">
                            <td colspan="4">Grand Total</td>
                            <td class="text-right">{{ grandTotaByMonth.totalOre.toLocaleString('en-US',
                              { maximumFractionDigits: 2 }) }}
                            </td>
                            <td class="text-right px-1 py-0.5">{{ grandTotaByMonth.sumNiInternal.toFixed(2) }}</td>
                            <td class="text-right px-1 py-0.5">{{ grandTotaByMonth.sumFeInternal.toFixed(2) }}</td>
                            <td class="text-right px-1 py-0.5">{{ grandTotaByMonth.sumSMInternal.toFixed(2) }}</td>
                            <td class="text-right px-1 py-0.5">{{ grandTotaByMonth.sumNiOfficial.toFixed(2) }}</td>
                            <td class="text-right px-1 py-0.5">{{ grandTotaByMonth.sumFeOfficial.toFixed(2) }}</td>
                            <td class="text-right px-1 py-0.5">{{ grandTotaByMonth.sumSMOfficial.toFixed(2) }}</td>
                          </tr>
                        </tfoot>
                      </table>

                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
 

  </div>
</template>

<style scoped></style>
