<template>
  <div class="flex flex-wrap gap-3 items-center">

    <!-- Material Filter -->
    <Select v-model="material">
      <SelectTrigger class="w-40">
        <SelectValue placeholder="Select Material" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Material</SelectLabel>
          <!-- Opsi “reset” -->
          <SelectItem value="all">-- All Materials --</SelectItem>
          <SelectItem value="HPAL">Limonite</SelectItem>
          <SelectItem value="RKEF">Saprolite</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <!-- Date Range Picker -->
    <DatePicker v-model="dateRange" type="range" placeholder="Pick Date Range" />

    <Button @click="applyFilters" :disabled="!isValid">
      Filter
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectGroup, SelectItem, SelectLabel
} from "@/components/ui/select";
import DatePicker from "@/components/filters/DatePicker.vue";

// state utama
const material = ref<string>();
const dateRange = ref<{ start: string; end: string }>({ start: "", end: "" })

// enable Apply hanya jika lengkap
const isValid = computed(() => {
  return Boolean(
    // material.value && dateRange.value.start && dateRange.value.end
    dateRange.value.start && dateRange.value.end
  );
});

// emit hasil filter
const emit = defineEmits<{
  (e: "apply", payload: {
    typeFilter: string;
    startDate: string;
    endDate: string;
  }): void;
}>();

function applyFilters() {
  if (!isValid.value) return;

  emit("apply", {
    typeFilter: material.value === "all" ? "" : material.value!, // "" artinya semua
    startDate: dateRange.value.start,
    endDate: dateRange.value.end,
  });
}
</script>
