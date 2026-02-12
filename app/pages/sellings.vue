<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits(['update:limGrade', 'update:sapGrade'])

interface GradeOre {
    total_ore: number
    ni: number
    co: number
    al2o3: number
    cr2o3: number
    fe: number
    mgo: number
    sio2: number
    sm: number
    grade: string
}

const limGrade = ref<GradeOre | null>(null) // ← buat ref di induk
const sapGrade = ref<GradeOre | null>(null) // ← buat ref di induk

function handleUpdateLimGrade(data: GradeOre) {
    limGrade.value = data
}

function handleUpdateSapGrade(data: GradeOre) {
    sapGrade.value = data
}


// Ambil query params dari URL
const route = useRoute()
const filterType = String(route.query.filter_type || '')


</script>

<template>
    <div class="w-full flex flex-col gap-4">
        <div class="mb-2">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Detail Selling</h1>
            <button @click="$router.push('/')" class="text-sm text-blue-500 underline">
                ← Back to Dashboard
            </button>
        </div>

        <!-- Tombol Kembali -->
        <main class="flex flex-1 flex-col gap-4 md:gap-6">
            <div class="grid grid-cols-12 gap-6">
                <!-- Kiri -->
                <div class="xl:col-span-6 col-span-12">
                    <div class="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
                        <Card class="xxl:col-span-12 xl:col-span-12 col-span-12 px-2 w-full overflow-hidden">
                            <CardHeader>
                                <div class="flex items-start justify-between w-full">
                                    <CardTitle>Selling Limonite</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                                <DashboardSellingDetailLimonite :filterType="filterType"
                                    @update:limGrade="handleUpdateLimGrade" />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <!-- Kanan -->
                <div class="xl:col-span-6 col-span-12">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="xl:col-span-12 col-span-12">
                            <Card class="h-full w-full overflow-hidden">
                                <CardHeader>
                                    <div class="flex items-start justify-between w-full">
                                        <CardTitle>Selling Saprolite</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                                    <DashboardSellingDetailSaprolite :filterType="filterType"
                                        @update:limGrade="handleUpdateSapGrade" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-6">
                <!-- Kiri: Lim COA Chart -->
                <div class="xl:col-span-6 col-span-12">
                    <div class="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
                        <Card class="xxl:col-span-12 xl:col-span-12 col-span-12 px-2  w-full overflow-hidden">
                            <CardHeader>
                                <div class="flex items-start justify-between w-full">
                                    <CardTitle>Compare Internal vs COA Limonite (Ni%)</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                                <DashboardSellingDetailLimNi metric="ni":filterType="filterType" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
               <!-- Kanan: SAP COA Chart -->
                <div class="xl:col-span-6 col-span-12">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="xl:col-span-12 col-span-12">
                            <Card class="h-full w-full overflow-hidden">
                                <CardHeader>
                                    <div class="flex items-start justify-between w-full">
                                        <CardTitle>Compare Internal vs COA Saprolite (Ni%)</CardTitle>
                                    </div>
                                </CardHeader>
                                  <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                                <DashboardSellingDetailSapNi metric="ni" :filterType="filterType" />
                            </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-6">
                <!-- Kiri: Lim COA Chart -->
                <div class="xl:col-span-6 col-span-12">
                    <div class="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
                        <Card class="xxl:col-span-12 xl:col-span-12 col-span-12 px-2 w-full overflow-hidden">
                            <CardHeader>
                                <div class="flex items-start justify-between w-full">
                                    <CardTitle>Compare Internal vs COA Limonite (Fe%)</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                                 <DashboardSellingDetailLimFe metric="fe" :filterType="filterType" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
               <!-- Kanan: SAP COA Chart -->
                <div class="xl:col-span-6 col-span-12">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="xl:col-span-12 col-span-12">
                            <Card class="h-full w-full overflow-hidden">
                                <CardHeader>
                                    <div class="flex items-start justify-between w-full">
                                        <CardTitle>Compare Internal vs COA Saprolite (Fe%)</CardTitle>
                                    </div>
                                </CardHeader>
                                  <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                                <DashboardSellingDetailSapFe metric="fe":filterType="filterType" />
                            </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-6">
                <!-- Kiri: Lim COA Chart -->
                <div class="xl:col-span-6 col-span-12">
                    <div class="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
                        <Card class="xxl:col-span-12 xl:col-span-12 col-span-12 px-2 w-full overflow-hidden">
                            <CardHeader>
                                <div class="flex items-start justify-between w-full">
                                    <CardTitle>Compare Internal vs COA Limonite (MgO%)</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                                <DashboardSellingDetailLimMgO metric="mgo":filterType="filterType" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
               <!-- Kanan: SAP COA Chart -->
                <div class="xl:col-span-6 col-span-12">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="xl:col-span-12 col-span-12">
                            <Card class="h-full w-full overflow-hidden">
                                <CardHeader>
                                    <div class="flex items-start justify-between w-full">
                                        <CardTitle>Compare Internal vs COA Saprolite (MgO%)</CardTitle>
                                    </div>
                                </CardHeader>
                                  <CardContent class="pl-2 overflow-hidden overflow-x-auto">
                                <DashboardSellingDetailSapMgO metric="mgo":filterType="filterType" />
                            </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            
        </main>
    </div>
</template>
