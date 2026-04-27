<script setup lang="ts">
const route = useRoute()

defineProps<{ collapsed?: boolean }>()

const isSettingsModalOpen = ref(false)
</script>

<template>
  <section class="px-3 py-4">
    <UTooltip text="Settings" :disabled="!collapsed" :content="{ side: 'right', sideOffset: 14 }" :delay-duration="0">
      <UButton variant="ghost" color="neutral" :icon="collapsed ? 'f7:gear' : ''" @click="isSettingsModalOpen = true"
        :class="[
          isSettingsModalOpen ? 'text-[var(--ck-text)]' : 'text-[var(--ck-muted)]',
          collapsed ? 'justify-center px-0 gap-0' : 'px-3 gap-2',
          'flex w-full items-center py-2.5 transition-all duration-300 ease-in-out min-h-[42px] cursor-pointer'
        ]">
      </UButton>
    </UTooltip>

    <SettingsModal v-model="isSettingsModalOpen" />
  </section>
</template>
