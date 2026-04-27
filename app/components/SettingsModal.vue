<script setup lang="ts">
const isOpen = defineModel<boolean>()

type ThemePreference = 'light' | 'dark' | 'system'

const colorMode = useColorMode()

const hapticsEnabled = useLocalStorage<boolean>('ck-haptics-enabled', true)
const compactModeEnabled = useLocalStorage<boolean>('ck-compact-mode-enabled', false)
const autoCopyEnabled = useLocalStorage<boolean>('ck-auto-copy-enabled', false)
const labsEntropyHeatmapEnabled = useLocalStorage<boolean>('ck-labs-entropy-heatmap-enabled', false)

const themePreference = computed<ThemePreference>({
  get: () => {
    const p = colorMode.preference
    return (p === 'light' || p === 'dark' || p === 'system') ? p : 'system'
  },
  set: (value) => {
    colorMode.preference = value
  }
})

const themeOptions = [
  { value: 'light' as ThemePreference, label: 'Light', icon: 'i-lucide-sun' },
  { value: 'dark' as ThemePreference, label: 'Dark', icon: 'i-lucide-moon' },
  { value: 'system' as ThemePreference, label: 'System', icon: 'i-lucide-monitor-cog' }
]
</script>

<template>
  <UModal v-model:open="isOpen" title="Settings" :ui="{ width: 'sm:max-w-[480px]' }">
    <template #body>
      <div class="space-y-6 py-1">
        <!-- Appearance -->
        <div class="space-y-3">
          <p class="text-[13px] font-semibold text-[var(--ck-muted)] uppercase tracking-wider">
            Appearance
          </p>
          <URadioGroup v-model="themePreference" :items="themeOptions" value-key="value">
            <template #label="{ item }">
              <div class="flex items-center gap-2">
                <UIcon :name="item.icon" class="size-3.5 text-[var(--ck-muted)]" />
                <span class="text-[13px]">{{ item.label }}</span>
              </div>
            </template>
          </URadioGroup>
        </div>

        <!-- Behavior -->
        <div class="space-y-1">
          <p class="text-[13px] font-semibold text-[var(--ck-muted)] uppercase tracking-wider mb-3">
            Behavior
          </p>
          <div class="divide-y divide-[var(--ck-border)] border border-[var(--ck-border)] rounded-xl overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 gap-4">
              <div>
                <p class="text-[13px] font-medium text-[var(--ck-text)]">Haptic Effects</p>
                <p class="text-[12px] text-[var(--ck-muted)]">Toggle vibration feedback on mobile.</p>
              </div>
              <USwitch v-model="hapticsEnabled" color="primary" aria-label="Toggle haptic effects" />
            </div>
            <div class="flex items-center justify-between px-4 py-3 gap-4">
              <div>
                <p class="text-[13px] font-medium text-[var(--ck-text)]">Compact Mode</p>
                <p class="text-[12px] text-[var(--ck-muted)]">Tighter spacing in cards and forms.</p>
              </div>
              <USwitch v-model="compactModeEnabled" color="primary" aria-label="Toggle compact mode" />
            </div>
            <div class="flex items-center justify-between px-4 py-3 gap-4">
              <div>
                <p class="text-[13px] font-medium text-[var(--ck-text)]">Auto-copy Output</p>
                <p class="text-[12px] text-[var(--ck-muted)]">Copy generated values right away.</p>
              </div>
              <USwitch v-model="autoCopyEnabled" color="primary" aria-label="Toggle auto copy" />
            </div>
            <div class="flex items-center justify-between px-4 py-3 gap-4">
              <div>
                <p class="text-[13px] font-medium text-[var(--ck-text)]">Entropy Heatmap</p>
                <p class="text-[12px] text-[var(--ck-muted)]">Visual entropy hints in generators.</p>
              </div>
              <USwitch v-model="labsEntropyHeatmapEnabled" color="primary" aria-label="Toggle entropy heatmap" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
