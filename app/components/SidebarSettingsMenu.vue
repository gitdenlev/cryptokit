<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <section class="border-t border-[var(--ck-border)] px-[14px] py-4">
    <NuxtLink
      to="/settings"
      :class="[
        route.path === '/settings'
          ? 'text-[var(--ck-text)] bg-[var(--ck-panel)]'
          : 'text-[var(--ck-muted)] hover:text-[var(--ck-text)] hover:bg-[var(--ck-panel-soft)]',
        'flex w-full items-center justify-between rounded-xl border border-[var(--ck-border)] px-3 py-2.5 transition-colors'
      ]"
    >
      <span class="flex items-center gap-2 text-[13px]">
        <UIcon name="i-lucide-settings-2" class="size-4" />
        Settings
      </span>
      <UIcon name="i-lucide-chevron-right" class="size-4" />
    </NuxtLink>
  </section>
</template>
