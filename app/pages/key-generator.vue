<script setup lang="ts">
import { ref } from 'vue'

const isDrawerOpen = ref(false)
const selectedBits = ref<128 | 192 | 256 | 512>(256)
const isGenerating = ref(false)
const isHoveringGenerate = ref(false)

const base64Key = ref<string>('')

const copyToast = ref<{ show: () => void } | null>(null)

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/workers/aes-key.worker.js')
  }
  return worker
}

function generateKey() {
  isGenerating.value = true
  base64Key.value = ''

  const w = getWorker()

  w.onmessage = (event) => {
    const { ok, base64 } = event.data
    if (ok) {
      base64Key.value = base64
    }
    isGenerating.value = false
  }

  w.onerror = () => {
    isGenerating.value = false
  }

  w.postMessage({ bits: selectedBits.value })
}

generateKey()

async function copyBase64() {
  if (!base64Key.value) return
  await navigator.clipboard.writeText(base64Key.value)
  copyToast.value?.show()
}
</script>

<template>
  <section class="max-w-[800px] font-sans overflow-visible">
    <AppToast
      ref="copyToast"
      :icon="
        ($colorMode?.value || $colorMode) === 'dark'
          ? '/cat-playful-light.svg'
          : '/cat-playful-dark.svg'
      "
      text="Key copied"
      title="Copied"
    />

    <header class="mb-6">
      <h1 class="text-[26px] text-(--ck-text) font-medium mb-1.5 tracking-wide">
        Key Generator
      </h1>
      <p class="text-[16px] mb-4">
        Generate random symmetric keys for use with AES or HMAC
      </p>

      <UButton
        class="flex items-center gap-2.5 px-4 py-2.5 bg-(--ck-panel) border border-(--ck-border) rounded-lg hover:bg-[(--ck-panel-soft)] transition-colors text-[14px] text-(--ck-text)"
        @click="isDrawerOpen = true"
      >
        <NuxtImg
          :src="
            ($colorMode?.value || $colorMode) === 'dark'
              ? '/light-thinking-cat.svg'
              : '/dark-thinking-cat.svg'
          "
          class="w-[20px] h-[20px]"
          alt="Cat icon"
        />
        Why does key strength matter?
      </UButton>
    </header>

    <div
      class="bg-(--ck-panel) border border-(--ck-border) rounded-xl p-8 flex flex-col relative overflow-visible"
    >
      <!-- Key size -->
      <div class="mb-10 overflow-visible">
        <span class="text-(--ck-text) text-[15px] mb-4 block">Key size</span>
        <USelect
          v-model="selectedBits"
          :items="[
            { label: '128 bits', value: 128 },
            { label: '192 bits', value: 192 },
            { label: '256 bits', value: 256 },
            { label: '512 bits', value: 512 }
          ]"
          size="lg"
          class="w-[200px]"
        />
      </div>

      <!-- Actions & Meta -->
      <div class="flex items-center justify-between mb-5">
        <UButton
          color="primary"
          @click="generateKey"
          @mouseleave="isHoveringGenerate = false"
        >
          <UIcon
            name="i-lucide-refresh-cw"
            class="w-[18px] h-[18px]"
            :class="{ 'ck-spin': isHoveringGenerate || isGenerating }"
          />
          Generate
        </UButton>
      </div>

      <!-- Base64 -->
      <div>
        <span class="text-(--ck-text) text-[14px] mb-2 block">Key</span>
        <div class="flex items-center gap-4">
          <div
            class="flex-1 bg-(--ck-bg) border border-(--ck-border) rounded-lg px-4 py-3 flex items-center min-h-[48px] overflow-x-auto"
          >
            <code
              v-if="base64Key"
              class="font-mono text-[15px] text-(--ck-text) break-all whitespace-nowrap"
            >
              {{ base64Key }}
            </code>
            <span
              v-else-if="isGenerating"
              class="text-(--ck-text) text-[14px] italic"
            >Generating…</span>
            <span v-else class="text-(--ck-text) text-[14px] italic">—</span>
          </div>
          <UButton color="neutral" :disabled="!base64Key" @click="copyBase64">
            <UIcon name="i-lucide-copy" class="w-[18px] h-[18px]" />
            Copy
          </UButton>
        </div>
      </div>
    </div>

    <UDrawer v-model:open="isDrawerOpen" direction="right" :handle="false">
      <template #content>
        <div
          class="h-full w-[30vw] bg-(--ck-panel) text-(--ck-text) overflow-y-auto p-8 flex flex-col gap-8"
        >
          <!-- Header -->
          <div>
            <p class="text-[15px] text-(--ck-muted) leading-relaxed">
              A cryptographic key is the secret that protects everything you
              encrypt. Its quality decides whether your data stays private.
            </p>
          </div>

          <!-- Section 1 -->
          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              The numbers
            </h3>
            <ul
              class="list-disc flex flex-col gap-4 text-[14px] text-(--ck-text) ml-2.5 pl-5"
            >
              <li>
                A 128-bit key has 2¹²⁸ combinations — unbreakable with today's
                hardware.
              </li>
              <li>
                A 256-bit key is the standard for top-secret data (AES-256, NSA
                Suite B).
              </li>
              <li>Anything below 80 bits is considered broken in practice.</li>
            </ul>
          </div>

          <!-- Section 2 -->
          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Real-life scenarios
            </h3>
            <div class="flex flex-col gap-3">
              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <NuxtImg
                    :src="
                      ($colorMode?.value || $colorMode) === 'dark'
                        ? '/cat-database-light.svg'
                        : '/cat-database-dark.svg'
                    "
                    alt="Database leak"
                    width="30"
                    height="30"
                  />
                  Database leak
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  If your DB is stolen but encrypted with a strong key, the data
                  is useless to the attacker.
                </p>
              </div>

              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon
                    name="i-lucide-file-json"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  API tokens
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Weak HMAC keys let attackers forge signed requests and
                  impersonate your service.
                </p>
              </div>
            </div>
          </div>

          <!-- Section 3 -->
          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Practical tips
            </h3>
            <ul
              class="list-disc flex flex-col gap-4 text-[14px] text-(--ck-text) ml-2.5 pl-5"
            >
              <li class="marker:text-(--ck-accent)">
                Use 256 bits for AES-GCM and HMAC-SHA256.
              </li>
              <li class="marker:text-(--ck-accent)">
                Never hardcode keys in source code or commit them to Git.
              </li>
              <li class="marker:text-(--ck-accent)">
                Store keys in a secret manager (AWS KMS, Vault, env vars).
              </li>
              <li class="marker:text-(--ck-accent)">
                Rotate keys periodically, especially after a suspected breach.
              </li>
              <li class="marker:text-(--ck-accent)">
                Generate keys with a CSPRNG — never with Math.random().
              </li>
            </ul>
          </div>

          <!-- Section 4 -->
          <div class="pb-6">
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Bad vs good
            </h3>
            <div class="flex flex-col gap-3">
              <div
                class="bg-[(--ck-panel-soft)] border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-[#f87171] text-[14px] font-mono mb-1.5"
                >
                  <UIcon name="i-lucide-x" class="text-[#f87171] w-4 h-4" />
                  secret123
                </div>
                <p class="text-[13px] text-(--ck-text) font-mono">
                  Not a key — a guessable string
                </p>
              </div>

              <div
                class="bg-(--ck-panel-soft) border border-(--ck-accent-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-accent) text-[14px] font-mono mb-1.5"
                >
                  <UIcon
                    name="i-lucide-check"
                    class="text-(--ck-accent) w-4 h-4"
                  />
                  a3f1...e9c7 (256-bit Base64)
                </div>
                <p class="text-[13px] text-(--ck-text) font-mono">
                  Cryptographically random, full entropy
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UDrawer>
  </section>
</template>

<style scoped>
@keyframes ck-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.ck-spin {
  animation: ck-spin 0.6s linear infinite;
}
</style>
