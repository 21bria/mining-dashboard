export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('access')
  const publicPages = ['/login', '/sso']

  if (!token.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }

  if (token.value && publicPages.includes(to.path)) {
    return navigateTo('/')
  }
})

