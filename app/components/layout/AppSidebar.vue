<script setup lang="ts">
import type { NavGroup, NavLink, NavSectionTitle } from '~/types/nav'
import { navMenu, navMenuBottom } from '~/constants/menus'

function resolveNavItemComponent(item: NavLink | NavGroup | NavSectionTitle): any {
  if ('children' in item)
    return resolveComponent('LayoutSidebarNavGroup')

  return resolveComponent('LayoutSidebarNavLink')
}

const teams: {
  name: string
  logo: string
  plan: string
}[] = [
  {
    name: 'Karya Wijaya',
    logo: 'i-lucide-waypoints',
    plan: 'Nickel Mining',
  },
  // {
  //   name: 'Acme Corp.',
  //   logo: 'i-lucide-audio-waveform',
  //   plan: 'Startup',
  // },
  // {
  //   name: 'Evil Corp.',
  //   logo: 'i-lucide-command',
  //   plan: 'Free',
  // },
]
const userData = ref<{ name: string; email: string; avatar: string }>({
  name: '',
  email: '',
 avatar: '/avatars/avatartion.png',
})
// const user: {
//   name: string
//   email: string
//   avatar: string
// } = {
//   name: 'Bria Seran',
//   email: 'brya.seran@gmail.com',
//   avatar: '/avatars/avatartion.png',
// }

const user = useCookie<{ name: string; email: string }>('user')

onMounted(() => {
  if (user.value) {
    userData.value.name = user.value.name || 'Unknown'
    userData.value.email = user.value.email || '-'
  }
})

const { sidebar } = useAppSettings()
</script>

<template>
  <Sidebar :collapsible="sidebar?.collapsible" :side="sidebar?.side" :variant="sidebar?.variant">
    <SidebarHeader>
      <LayoutSidebarNavHeader :teams="teams" />
      <Search />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup v-for="(nav, indexGroup) in navMenu" :key="indexGroup">
        <SidebarGroupLabel v-if="nav.heading">
          {{ nav.heading }}
        </SidebarGroupLabel>
        <component :is="resolveNavItemComponent(item)" v-for="(item, index) in nav.items" :key="index" :item="item" />
      </SidebarGroup>
      <SidebarGroup class="mt-auto">
        <component :is="resolveNavItemComponent(item)" v-for="(item, index) in navMenuBottom" :key="index" :item="item" size="sm" />
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <LayoutSidebarNavFooter :user="userData" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>

<style scoped>

</style>
