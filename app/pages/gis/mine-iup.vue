<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectGroup, SelectItem, SelectLabel
} from '@/components/ui/select'

/* ==== TYPE=== */
type IUPItem = {
  id: number
  label: string
  code?: string
}

const BASEMAPS = [
  { label: 'Standard', value: 'standard' },
  { label: 'Standard Light', value: 'light' },
  { label: 'Standard Dark', value: 'dark' },
  { label: 'Outdoors', value: 'outdoor' },
  { label: 'OSM', value: 'osm' },
  { label: 'Satellite', value: 'satellite' }
] as const

type BasemapType = typeof BASEMAPS[number]['value']

const basemapFilter = ref<BasemapType>('light')

const baseLayers: Record<BasemapType, L.TileLayer> = {
  standard: L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  ),
  light: L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  ),
  dark: L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  ),
  outdoor: L.tileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  ),
  osm: L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  ),
  // SATELLITE
  satellite: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '© Esri, Maxar, Earthstar Geographics'
    }
  )
}

let currentBaseLayer: L.TileLayer | null = null

function switchBasemap(type: BasemapType) {
  if (!map) return

  if (currentBaseLayer) {
    map.removeLayer(currentBaseLayer)
  }

  currentBaseLayer = baseLayers[type]
  currentBaseLayer.addTo(map)
}

const SOURCE_COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f97316', // orange
  '#a855f7', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#eab308', // yellow
  '#ef4444', // red
]

/* === STATE === */
const iupList = ref<IUPItem[]>([])
const iupFilter = ref<number | null>(null)
const isLoading = ref(false)

let map: L.Map
let iupLayer: L.GeoJSON | null = null
let sourceLayer: L.GeoJSON | null = null

/* === MAP INIT === */
function initMap() {
  map = L.map('map')

  // DEFAULT → Standard Light
  switchBasemap('light')
  // default view (fallback)
  map.setView([-0.07, 129.41], 12)
}

function getSourceColor(sourceId: number) {
  return SOURCE_COLORS[sourceId % SOURCE_COLORS.length]
}

function sourceStyle(feature: any) {
  const p = feature.properties || {}
  return {
    color: getSourceColor(p.id),
    weight: 2,
    fillOpacity: 0.5,
    dashArray: '3',
  }
}

/* === LOAD IUP LIST === */
async function loadIUPList() {
  try {
    const res = await fetch(`${URL_GET_DATA}dropdown/get-mine/iup/`)
    const data = await res.json()

    // mapping dari backend
    iupList.value = (data.results || []).map((item: any) => ({
      id: item.id,
      label: item.text
    }))
  } catch (err) {
    console.error('❌ Gagal load IUP list', err)
  }
}

/* === LOAD IUP GEOJSON === */
async function loadIUP(iupId: number) {
  if (!map) return
  isLoading.value = true
  try {
    const res = await fetch(`${URL_GET_DATA}gis/api/mine-iup/${iupId}/`)
    const data = await res.json()

    if (iupLayer) map.removeLayer(iupLayer)
    if (sourceLayer) map.removeLayer(sourceLayer)

    iupLayer = L.geoJSON(data.iup, {
      style: { color: '#16a34a', weight: 2, fillOpacity: 0.15, dashArray: '', }
    }).addTo(map)

    map.fitBounds(iupLayer.getBounds(), { padding: [30, 30] })


    sourceLayer = L.geoJSON(data.sources, {
      // style: { color: '#dc2626', weight: 2, fillOpacity: 0.5 },
      style: sourceStyle,
      onEachFeature(feature, layer) {
        const p = feature.properties || {}

        const productions = p.productions
        const materials = productions?.materials || []
        const totalTonnage = productions?.total || 0

        let productionHtml = '<i>No production</i>'

        if (materials.length > 0) {
          productionHtml = `
            <table style="width:100%; font-size:12px; margin-top:6px">
              <thead>
                <tr>
                  <th align="left">Material</th>
                  <th align="right">Tonnage</th>
                </tr>
              </thead>
              <tbody>
                ${materials.map((prod: any) => `
                  <tr>
                    <td>${prod.material}</td>
                    <td align="right">${prod.tonnage.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="font-weight:bold; border-top:1px solid #ccc">
                  <td>Total</td>
                  <td align="right">${totalTonnage.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          `
        }
        layer.bindPopup(`
          <div style="min-width:220px">
            <b>Source:</b> ${p.sources_area || '-'}<br>
            <b>PIT:</b> ${p.pit || '-'}<br>
            <b>Area:</b> ${p.luas_ha ?? '-'} ha
            <hr style="margin:4px 0"/>
            <b>Production:</b>
            ${productionHtml}
          </div>
        `)
      }
    }).addTo(map)

    setTimeout(() => map.invalidateSize(), 200)

  } finally {
    isLoading.value = false
  }
}

// WATCH & MOUNT
watch(iupFilter, async (val) => {
  if (!val || !map) return

  isLoading.value = true
  await nextTick()
  map.invalidateSize()

  await loadIUP(val)

  await nextTick()
  map.invalidateSize()

  isLoading.value = false
})

watch(basemapFilter, async (val) => {
  if (!map) return

  await nextTick()
  switchBasemap(val)
  map.invalidateSize()
})

onMounted(async () => {
  await nextTick()
  initMap()

  // PAKSA UKURAN SAAT AWAL
  setTimeout(() => map.invalidateSize(), 400)

  loadIUPList()
})

</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Mine IUP - Boundary
        </h1>
        <p class="text-muted-foreground">
          Please&apos; select IUP in the right side option to display data according to geographic area.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Select v-model="iupFilter">
          <SelectTrigger class="w-56">
            <SelectValue placeholder="Select IUP" />
          </SelectTrigger>
          <SelectContent class="z-[9999]">
            <SelectGroup>
              <SelectLabel>Mine IUP</SelectLabel>
              <SelectItem v-for="iup in iupList" :key="iup.id" :value="iup.id">
                {{ iup.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="relative">
      <div v-show="isLoading" class="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
        Loading...
      </div>
      <div id="map" class="w-full h-[750px] rounded-lg border"></div>
      <div class="absolute bottom-3 left-3 z-[1000] bg-white dark:bg-zinc-700 rounded-md shadow  flex overflow-hidden">
        <button v-for="item in [
          { label: 'Standard', value: 'standard' },
          { label: 'Satellite', value: 'satellite' },
          { label: 'Standard Light', value: 'light' },
          { label: 'Standard Dark', value: 'dark' },
          { label: 'Outdoors', value: 'outdoor' },
          { label: 'OSM', value: 'osm' },
        
        ]" :key="item.value" @click="basemapFilter = item.value as BasemapType"
          class="px-3 py-1 text-xs border-r last:border-r-0 transition" :class="basemapFilter === item.value
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'hover:bg-gray-100 dark:hover:bg-zinc-800'">
          {{ item.label }}
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
#map {
  z-index: 0;
}
</style>
