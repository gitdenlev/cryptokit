<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const { inputText, hashResult, selectedAlgorithm } = useHashSession()

const isDrawerOpen = ref(false)
const copyToast = ref<{ show: () => void } | null>(null)

const isProcessing = ref(false)
const errorMessage = ref('')

const algorithms = [
  { label: 'SHA-256', value: 'SHA-256' },
  { label: 'SHA-384', value: 'SHA-384' },
  { label: 'SHA-512', value: 'SHA-512' }
]

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/workers/hash.worker.js')
  }
  return worker
}

async function hash() {
  if (!inputText.value) return

  isProcessing.value = true
  errorMessage.value = ''

  const w = getWorker()

  w.onmessage = (event) => {
    const { ok, result, error } = event.data
    if (ok) {
      hashResult.value = result
    } else {
      errorMessage.value = error || 'Hashing failed'
    }
    isProcessing.value = false
  }

  w.onerror = () => {
    errorMessage.value = 'Hashing failed'
    isProcessing.value = false
  }

  w.postMessage({
    action: 'hash',
    text: inputText.value,
    algorithm: selectedAlgorithm.value
  })
}

async function copyToClipboard(text: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  copyToast.value?.show()
}

watch([inputText, selectedAlgorithm], () => {
  if (inputText.value) {
    hash()
  } else {
    hashResult.value = ''
  }
})
</script>

<template>
  <section class="max-w-[800px] font-mono">
    <AppToast
      ref="copyToast"
      icon="i-lucide-check"
      text="Copied to clipboard"
      title="Copied"
    />

    <header class="mb-8 flex flex-col items-start gap-4">
      <div>
        <h1
          class="text-[28px] text-(--ck-text) font-semibold mb-2 tracking-wide"
        >
          Hash Text
        </h1>
        <p class="text-(--ck-text) text-[16px]">
          Cryptographic hash functions for data integrity
        </p>
      </div>

      <button
        class="flex items-center gap-2.5 px-4 py-2.5 bg-(--ck-panel) border border-(--ck-border) rounded-lg hover:bg-(--ck-panel-soft) transition-colors text-[14px] text-(--ck-text) shadow-sm"
        @click="isDrawerOpen = true"
      >
        <UIcon name="i-lucide-help-circle" class="w-[20px] h-[20px]" />
        What is a cryptographic hash?
      </button>
    </header>

    <div
      class="bg-(--ck-panel) border border-(--ck-border) rounded-[12px] p-6 sm:p-8 flex flex-col gap-8 shadow-sm"
    >
      <!-- Algorithm Selection -->
      <div>
        <span class="text-(--ck-text) text-[15px] mb-3 block">Algorithm</span>
        <USelect
          v-model="selectedAlgorithm"
          :items="algorithms"
          size="lg"
          class="w-full font-mono text-[15px]"
        />
      </div>

      <!-- Input Text -->
      <div>
        <span class="text-(--ck-text) text-[15px] mb-3 block">Input Text</span>
        <UTextarea
          v-model="inputText"
          autoresize
          variant="subtle"
          :rows="5"
          class="w-full font-mono text-[15px]"
          placeholder="Enter text to hash..."
        />
      </div>

      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="flex items-start gap-3 text-[#ef4444] text-[14px]"
      >
        <UIcon name="i-lucide-x-circle" class="w-[24px] h-[24px] shrink-0 mt-0.5" />
        <span class="leading-relaxed font-mono">{{ errorMessage }}</span>
      </div>

      <!-- Hash Result -->
      <div v-if="hashResult">
        <span class="text-(--ck-text) text-[15px] mb-3 block">Hash (Hex)</span>
        <div class="flex items-center gap-3">
          <UInput
            :model-value="hashResult"
            class="flex-1 font-mono text-[15px]"
            color="neutral"
            size="lg"
            readonly
          />
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            class="px-4"
            @click="copyToClipboard(hashResult)"
          >
            <UIcon name="i-lucide-copy" class="w-5 h-5" />
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
          <div>
            <p class="text-[15px] text-(--ck-text) leading-relaxed">
              A cryptographic hash is a one-way function that converts data of
              any size into a fixed-size string of characters. It's
              deterministic — the same input always produces the same output.
            </p>
          </div>

          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Key properties
            </h3>
            <ul
              class="list-disc flex flex-col gap-4 text-[14px] text-(--ck-text) ml-2.5 pl-5"
            >
              <li>
                <strong>Pre-image resistance:</strong> Given a hash, it's
                computationally infeasible to find the original input.
              </li>
              <li>
                <strong>Collision resistance:</strong> It's extremely unlikely
                two different inputs will produce the same hash.
              </li>
              <li>
                <strong>Avalanche effect:</strong> A tiny change in input
                produces a completely different hash.
              </li>
            </ul>
          </div>

          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Common use cases
            </h3>
            <div class="flex flex-col gap-3">
              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon
                    name="i-lucide-file-check"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  <NuxtLink
                    to="/file-integrity"
                    class="text-(--ck-accent) underline hover:no-underline"
                  >
                    File integrity
                  </NuxtLink>
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Verify downloaded files haven't been tampered with by
                  comparing hash values.
                </p>
              </div>

              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon
                    name="i-lucide-shield-check"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  Password storage
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Store password hashes instead of plaintext. Never use raw
                  hashes alone — always use salted key derivation (PBKDF2,
                  Argon2).
                </p>
              </div>

              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon
                    name="i-lucide-fingerprint"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  Data deduplication
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Identify identical data blocks by their hash values without
                  comparing content.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Algorithm comparison
            </h3>
            <div class="flex flex-col gap-3">
              <div
                class="bg-(--ck-panel-soft) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] font-mono mb-1.5"
                >
                  SHA-256
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  256-bit output. Most widely used. Bitcoin, TLS certificates,
                  Git commits.
                </p>
              </div>

              <div
                class="bg-(--ck-panel-soft) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] font-mono mb-1.5"
                >
                  SHA-384
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  384-bit output. Higher security margin than SHA-256. Used in
                  some TLS configurations.
                </p>
              </div>

              <div
                class="bg-(--ck-panel-soft) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] font-mono mb-1.5"
                >
                  SHA-512
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  512-bit output. Maximum security. Slower but future-proof for
                  high-security applications.
                </p>
              </div>
            </div>
          </div>

          <div class="pb-6">
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Security notes
            </h3>
            <div class="flex flex-col gap-3">
              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon name="i-lucide-check-circle" class="w-[24px] h-[24px] shrink-0" />
                  Client-side only
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  All hashing happens in a Web Worker — your input never leaves
                  your browser.
                </p>
              </div>

              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon
                    name="i-lucide-shield-alert"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  Not encryption
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Hashes are one-way. You cannot "decrypt" a hash to recover the
                  original input.
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UDrawer>
  </section>
</template>
