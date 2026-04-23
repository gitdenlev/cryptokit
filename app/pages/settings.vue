<script setup lang="ts">
type ThemePreference = 'light' | 'dark' | 'system'

const colorMode = useColorMode()

const hapticsEnabled = useLocalStorage<boolean>('ck-haptics-enabled', true)
const compactModeEnabled = useLocalStorage<boolean>('ck-compact-mode-enabled', false)
const autoCopyEnabled = useLocalStorage<boolean>('ck-auto-copy-enabled', false)
const labsEntropyHeatmapEnabled = useLocalStorage<boolean>('ck-labs-entropy-heatmap-enabled', false)

const themePreference = computed<ThemePreference>({
  get: () => {
    if (colorMode.preference === 'light' || colorMode.preference === 'dark' || colorMode.preference === 'system') {
      return colorMode.preference
    }

    return 'system'
  },
  set: (value) => {
    colorMode.preference = value
  }
})

const themeOptions: Array<{
  value: ThemePreference
  label: string
  icon: string
  description: string
}> = [
  { value: 'light', label: 'Light', icon: 'i-lucide-sun' },
  { value: 'dark', label: 'Dark', icon: 'i-lucide-moon' },
  { value: 'system', label: 'System', icon: 'i-lucide-monitor-cog' }
]
</script>

<template>
  <section class="w-full space-y-4">
    <header class="space-y-1">
      <h1 class="text-[28px] font-medium tracking-tight text-[var(--ck-text)]">
        Settings
      </h1>
      <p class="text-[14px] text-[var(--ck-muted)]">
        Customize cryptokit like a dedicated preferences page.
      </p>
    </header>

    <UPageCard variant="subtle" :ui="{ body: 'space-y-5' }">
      <template #header>
        <div>
          <h2 class="text-[15px] font-medium text-[var(--ck-text)]">
            Appearance
          </h2>
        </div>
      </template>

      <URadioGroup v-model="themePreference" :items="themeOptions" value-key="value">
        <template #label="{ item }">
          <div class="flex items-start gap-2">
            <UIcon :name="item.icon" class="mt-0.5 size-3.5 text-[var(--ck-muted)]" />
            <span class="text-[13px] text-[var(--ck-text)]">
              {{ item.label }}
            </span>
          </div>
        </template>
      </URadioGroup>
    </UPageCard>

    <UPageCard variant="subtle" :ui="{ body: 'divide-y divide-[var(--ck-border)]' }">
      <template #header>
        <div class="space-y-0.5">
          <h2 class="text-[15px] font-medium text-[var(--ck-text)]">
            Behavior
          </h2>
          <p class="text-[12px] text-[var(--ck-muted)]">
            Control app interactions and defaults.
          </p>
        </div>
      </template>

      <UFormField
        label="Haptic Effects"
        description="Toggle vibration feedback on mobile."
        class="flex items-center justify-between gap-4 py-3"
      >
        <USwitch v-model="hapticsEnabled" color="primary" aria-label="Toggle haptic effects" />
      </UFormField>

      <UFormField
        label="Compact Mode"
        description="Tighter spacing in cards and forms."
        class="flex items-center justify-between gap-4 py-3"
      >
        <USwitch v-model="compactModeEnabled" color="primary" aria-label="Toggle compact mode" />
      </UFormField>

      <UFormField
        label="Auto-copy Output"
        description="Copy generated values right away."
        class="flex items-center justify-between gap-4 py-3"
      >
        <USwitch v-model="autoCopyEnabled" color="primary" aria-label="Toggle auto copy" />
      </UFormField>

      <UFormField
        label="Entropy Heatmap"
        description="Visual entropy hints in generators."
        class="flex items-center justify-between gap-4 py-3"
      >
        <USwitch v-model="labsEntropyHeatmapEnabled" color="primary" aria-label="Toggle entropy heatmap" />
      </UFormField>
    </UPageCard>
  </section>
</template>
