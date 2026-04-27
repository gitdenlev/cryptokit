<script setup lang="ts">
const route = useRoute()
const { getThemeImage } = useThemeImage()
const catLogo = computed(() => getThemeImage('/cat-success-light.svg', '/cat-success-dark.svg'))

const collapsed = useState<boolean>('sidebar-collapsed', () => false)

type NavItem = { label: string; icon: string; to: string }

const navGroups: NavItem[][] = [
  [
    { label: 'Password Generator', icon: 'i-lucide-key-round', to: '/password-generator' },
    { label: 'Key Generator', icon: 'i-lucide-key', to: '/key-generator' }
  ],
  [
    { label: 'Encrypt Text', icon: 'i-lucide-lock', to: '/encrypt-text' },
    { label: 'Decrypt Text', icon: 'i-lucide-unlock', to: '/decrypt-text' },
    { label: 'Classical Ciphers', icon: 'i-lucide-scroll-text', to: '/' }
  ],
  [
    { label: 'Hash Text', icon: 'i-lucide-hash', to: '/' },
    { label: 'Compare Hashes', icon: 'i-lucide-search-check', to: '/' },
    { label: 'File Integrity', icon: 'i-lucide-file-check-2', to: '/' }
  ],
  [
    { label: 'Hide in Image', icon: 'i-lucide-image-up', to: '/' },
    { label: 'Extract from Image', icon: 'i-lucide-scan-search', to: '/' }
  ],
  [
    { label: 'Encode / Decode', icon: 'i-lucide-refresh-cw', to: '/' },
    { label: 'Text Analysis', icon: 'i-lucide-chart-column', to: '/' },
    { label: 'XOR Tool', icon: 'i-lucide-zap', to: '/' }
  ]
]
</script>

<template>
  <aside
    :class="collapsed ? 'sidebar--collapsed' : 'sidebar--expanded'"
    class="sidebar border-r border-[var(--ck-border)] bg-[var(--ck-bg)] flex flex-col shrink-0"
  >
    <!-- Header -->
    <div class="h-[76px] flex items-center px-[18px] font-medium tracking-[-0.01em] relative">
      <NuxtImg
        :src="catLogo"
        alt="Cryptokit logo"
        width="24"
        height="24"
        class="w-[24px] h-[24px] block object-contain shrink-0"
        :class="{ 'cursor-pointer': collapsed }"
        @click="collapsed = false"
      />
      <span class="sidebar-label ml-[12px] text-[1.5rem] overflow-hidden whitespace-nowrap">
        Сryptokit
      </span>
      <UButton
        variant="ghost"
        color="neutral"
        v-if="!collapsed"
        title="Collapse sidebar"
        @click="collapsed = true"
        class="absolute right-[12px] top-[50%] translate-y-[-50%]"
      >
        <UIcon
          name="i-lucide-panel-left-close"
          size="22"
        />
      </UButton>
    </div>

    <!-- Nav -->
    <nav
      class="flex-1 py-[20px] overflow-y-auto overflow-x-hidden space-y-[18px]"
      :class="collapsed ? 'px-[10px]' : 'px-[10px]'"
      aria-label="Dashboard navigation"
    >
      <section v-for="(group, gi) in navGroups" :key="gi" class="flex flex-col gap-[2px]">
        <UTooltip
          v-for="item in group"
          :key="item.label"
          :text="item.label"
          :disabled="!collapsed"
          :content="{ side: 'right', sideOffset: 14 }"
          :delay-duration="0"
          class="w-full"
        >
          <NuxtLink
            :to="item.to"
            :class="[
              route.path === item.to
                ? 'text-[var(--ck-text)] bg-[var(--ck-panel)]'
                : 'text-[var(--ck-muted)] hover:text-[var(--ck-text)] hover:bg-[var(--ck-panel)]',
              'nav-item flex items-center py-[9px] rounded-[10px] no-underline transition-all duration-300 ease-in-out w-full',
              collapsed ? 'justify-center px-0 gap-0' : 'px-[8px] gap-[10px]'
            ]"
          >
            <UIcon :name="item.icon" />
            <span class="sidebar-label overflow-hidden whitespace-nowrap">{{ item.label }}</span>
          </NuxtLink>
        </UTooltip>
      </section>
    </nav>

    <SidebarSettingsMenu :collapsed="collapsed" />
  </aside>
</template>

<style scoped>
.sidebar {
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar--expanded { width: 280px; }
.sidebar--collapsed { width: 64px; }

@media (min-width: 1024px) {
  .sidebar--expanded { width: 320px; }
}

/* Labels — fade + width collapse */
.sidebar-label {
  transition:
    opacity 200ms ease,
    max-width 300ms cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 300px;
  opacity: 1;
}

.sidebar--collapsed .sidebar-label {
  opacity: 0;
  max-width: 0;
  pointer-events: none;
}

/* Collapse button */
.collapse-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: var(--ck-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0;
  transition: background 150ms ease, color 150ms ease, opacity 200ms ease;
}

.sidebar:hover .collapse-btn {
  opacity: 1;
}

.collapse-btn:hover {
  background: var(--ck-panel);
  color: var(--ck-text);
}

.nav-item {
  min-height: 38px;
}
</style>
