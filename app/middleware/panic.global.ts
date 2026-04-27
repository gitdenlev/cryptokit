// Global route middleware — blocks ALL navigation while panic mode is active.
// Reads directly from sessionStorage (client-only) so it works on hard refresh too.
export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.client) return

  const isPanic = sessionStorage.getItem('cryptokit_panic') === 'true'
  if (!isPanic) return

  // If there's a valid "from" route, stay there; otherwise stay on "to" (initial load).
  const target = from.name ? from : to
  return navigateTo(target.fullPath)
})
