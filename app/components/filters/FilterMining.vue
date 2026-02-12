<template>
  <div class="flex flex-wrap gap-3 items-center">
    <!-- Date Range Picker -->
    <DatePicker v-model="dateRange" type="range" placeholder="Pick Date Range" />
    <Select v-model="vendorsFilter">
      <SelectTrigger class="w-40">
        <SelectValue placeholder="Select Vendor" />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>Vendors</SelectLabel>
          <SelectItem v-for="v in vendors" :key="v.code" :value="v.code">
            {{ v.code }}
          </SelectItem>

        </SelectGroup>
      </SelectContent>
    </Select>
    <Button size="lg" variant="outline" class="text-sm" @click="applyFilters" :disabled="!isValid">
      Filter
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import DatePicker from "@/components/filters/DatePicker.vue";
import { URL_GET_DATA } from '@/utils/api'
// state utama
const dateRange = ref<{ start: string; end: string }>({ start: "", end: "" })
const selectedCategories = ref<string[]>([])

interface Vendor {
  vendor_name: string
  code: string
}

const vendors = ref<Vendor[]>([])
const vendorsFilter = ref<string | undefined>()

async function fetchVendors() {
  try {
    const res = await fetch(`${URL_GET_DATA}dropdown/get-mine/vendors/`)
    const data = await res.json()
    vendors.value = data.list || []
  } catch (err) {
    console.error("Failed fetch vendors", err)
  }
}

// enable Apply hanya jika lengkap
const isValid = computed(() => {
  return Boolean(
    // material.value && dateRange.value.start && dateRange.value.end
    dateRange.value.start && dateRange.value.end && vendorsFilter.value
  );
});

// emit hasil filter
const emit = defineEmits<{
  (e: "apply", payload: {
    startDate: string;
    endDate: string;
    vendor: string;
    categories: string[]
  }): void;
}>();

function applyFilters() {
  if (!isValid.value) return;

  emit("apply", {
    startDate   : dateRange.value.start,
    endDate     : dateRange.value.end,
    vendor      : vendorsFilter.value!,
    categories  : selectedCategories.value,
  });
}
onMounted(() => {
  fetchVendors()
})
</script>
