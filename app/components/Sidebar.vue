<script setup lang="ts">
const route = useRoute()

const { getThemeImage } = useThemeImage()

const catLogo = computed(() => getThemeImage('/cat-success-light.svg', '/cat-success-dark.svg'))

type NavItem = {
  label: string
  icon: string
  to: string
}

type NavGroup = {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Generate',
    items: [
      { label: 'Password Generator', icon: 'i-lucide-key-round', to: '/password-generator' },
      { label: 'Key Generator', icon: 'i-lucide-key', to: '/key-generator' }
    ]
  },
  {
    title: 'Cipher',
    items: [
      { label: 'Encrypt Text', icon: 'i-lucide-lock', to: '/encrypt-text' },
      { label: 'Decrypt Text', icon: 'i-lucide-unlock', to: '/' },
      { label: 'Classical Ciphers', icon: 'i-lucide-scroll-text', to: '/' }
    ]
  },
  {
    title: 'Hashing',
    items: [
      { label: 'Hash Text', icon: 'i-lucide-hash', to: '/' },
      { label: 'Compare Hashes', icon: 'i-lucide-search-check', to: '/' },
      { label: 'File Integrity', icon: 'i-lucide-file-check-2', to: '/' }
    ]
  },
  {
    title: 'Steganography',
    items: [
      { label: 'Hide in Image', icon: 'i-lucide-image-up', to: '/' },
      { label: 'Extract from Image', icon: 'i-lucide-scan-search', to: '/' }
    ]
  },
  {
    title: 'Utilities',
    items: [
      { label: 'Encode / Decode', icon: 'i-lucide-refresh-cw', to: '/' },
      { label: 'Text Analysis', icon: 'i-lucide-chart-column', to: '/' },
      { label: 'XOR Tool', icon: 'i-lucide-zap', to: '/' }
    ]
  }
]
</script>

<template>
  <aside class="w-[280px] lg:w-[320px] border-r border-[var(--ck-border)] bg-[var(--ck-bg)] flex flex-col shrink-0">
    <div class="h-[76px] flex items-center gap-[12px] px-[18px] font-medium tracking-[-0.01em]">
      <NuxtImg
        :src="catLogo"
        alt="Cryptokit logo"
        width="24"
        height="24"
        class="w-[24px] h-[24px] block object-contain"
      />
      <h1 class="text-[1.5rem]">
        Сryptokit
      </h1>
    </div>

    <nav class="flex-1 py-[20px] px-[14px] overflow-y-auto space-y-[18px]" aria-label="Dashboard navigation">
      <section
        v-for="group in navGroups"
        :key="group.title"
      >
        <h2 class="m-0 mx-[8px] mb-[8px] text-[var(--ck-muted)] text-[13px] font-medium">
          {{ group.title }}
        </h2>

        <NuxtLink
          v-for="item in group.items"
          :key="`${group.title}-${item.label}`"
          :to="item.to"
          :class="[route.path === item.to ? 'text-[var(--ck-text)] bg-[var(--ck-panel)]' : 'text-[var(--ck-muted)] hover:text-[var(--ck-text)] hover:bg-[var(--ck-panel)]', 'flex items-center gap-[10px] py-[9px] px-[8px] rounded-[10px] text-[1.125rem] no-underline transition-colors duration-200 ease-in-out']"
        >
          <UIcon :name="item.icon" class="w-[17px] h-[17px]" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </section>
    </nav>

    <SidebarSettingsMenu />
  </aside>
</template>
