<script setup lang="ts">
type ToolCard = {
  title: string
  subtitle: string
  icon: string
}

const cards: ToolCard[] = [
  { title: 'Password Generator', subtitle: 'secure random passwords', icon: 'i-lucide-key-round' },
  { title: 'encrypt text', subtitle: 'aes-gcm symmetric encryption', icon: 'i-lucide-lock' },
  { title: 'hash text', subtitle: 'sha-256, sha-512, sha-1', icon: 'i-lucide-hash' },
  { title: 'hide in image', subtitle: 'lsb steganography', icon: 'i-lucide-image-up' },
  { title: 'encode / decode', subtitle: 'base64, hex, url, binary', icon: 'i-lucide-refresh-cw' },
  { title: 'xor tool', subtitle: 'byte-level xor cipher', icon: 'i-lucide-zap' }
]
</script>

<template>
  <section class="ck-home">
    <header class="ck-home-header">
      <h1>welcome to cryptokit</h1>
      <p>pick a tool from the sidebar, or jump in below.</p>
    </header>

    <div class="ck-grid">
      <article
        v-for="card in cards"
        :key="card.title"
        class="ck-card"
        role="button"
        tabindex="0"
      >
        <div class="ck-card-main">
          <UIcon :name="card.icon" class="ck-card-icon" />
          <div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.subtitle }}</p>
          </div>
        </div>

        <UIcon name="i-lucide-arrow-up-right" class="ck-card-arrow" />
      </article>
    </div>
  </section>
</template>
