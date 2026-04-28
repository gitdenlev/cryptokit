<script setup lang="ts">
import { ref, computed } from 'vue'

const { secretKey, ciphertext } = useAesSession()

const isDrawerOpen = ref(false)
const copyToast = ref<{ show: () => void } | null>(null)

const plaintext = ref('')
const isProcessing = ref(false)
const errorMessage = ref('')
const showKey = ref(false)

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/workers/aes-encrypt.worker.js')
  }
  return worker
}

async function decrypt() {
  if (!ciphertext.value) return
  if (!secretKey.value) return

  isProcessing.value = true
  errorMessage.value = ''
  plaintext.value = ''

  const w = getWorker()

  w.onmessage = (event) => {
    const { ok, result, error } = event.data
    if (ok) {
      plaintext.value = result
    } else {
      errorMessage.value = error || 'Decryption failed'
    }
    isProcessing.value = false
  }

  w.onerror = () => {
    errorMessage.value = 'Decryption failed'
    isProcessing.value = false
  }

  w.postMessage({
    action: 'decrypt',
    text: ciphertext.value,
    key: secretKey.value
  })
}

async function copyToClipboard(text: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  copyToast.value?.show()
}
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
          Decrypt Text
        </h1>
        <p class="text-(--ck-text) text-[16px]">
          AES-GCM symmetric decryption with a secret key
        </p>
      </div>

      <button
        class="flex items-center gap-2.5 px-4 py-2.5 bg-(--ck-panel) border border-(--ck-border) rounded-lg hover:bg-(--ck-panel-soft) transition-colors text-[14px] text-(--ck-text) shadow-sm"
        @click="isDrawerOpen = true"
      >
        <UIcon name="i-lucide-help-circle" class="w-[20px] h-[20px]" />
        How does AES-GCM work?
      </button>
    </header>

    <div
      class="bg-(--ck-panel) border border-(--ck-border) rounded-[12px] p-6 sm:p-8 flex flex-col gap-8 shadow-sm"
    >
      <!-- Ciphertext -->
      <div>
        <span class="text-(--ck-text) text-[15px] mb-3 block">Ciphertext</span>
        <UTextarea
          v-model="ciphertext"
          autoresize
          variant="subtle"
          :rows="5"
          class="w-full font-mono text-[15px]"
        />
      </div>

      <!-- Key -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-(--ck-text) text-[15px]">Key</span>
        </div>
        <div class="flex items-center gap-3">
          <UInput
            v-model="secretKey"
            :type="showKey ? 'text' : 'password'"
            class="flex-1 font-mono text-[15px]"
            :color="secretKey ? 'primary' : 'neutral'"
            size="lg"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                :icon="showKey ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :padded="false"
                @click="showKey = !showKey"
              />
            </template>
          </UInput>
        </div>
      </div>

      <!-- Decrypt Button -->
      <div class="flex items-center gap-3">
        <UButton
          color="primary"
          size="lg"
          class="px-6"
          :loading="isProcessing"
          :disabled="!ciphertext || !secretKey"
          @click="decrypt"
        >
          <UIcon name="i-lucide-lock-open" class="w-5 h-5" />
          Decrypt
        </UButton>
      </div>

      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="flex items-start gap-3 text-[#ef4444] text-[14px]"
      >
        <UIcon name="i-lucide-x-circle" class="w-[24px] h-[24px] shrink-0 mt-0.5" />
        <span class="leading-relaxed font-mono">{{ errorMessage }}</span>
      </div>

      <!-- Plaintext result -->
      <div v-if="plaintext">
        <span class="text-(--ck-text) text-[15px] mb-3 block">Plaintext</span>
        <div class="flex items-center gap-3">
          <UInput
            :model-value="plaintext"
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
            @click="copyToClipboard(plaintext)"
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
              AES-GCM is an authenticated encryption algorithm. Decryption
              requires the exact same key and verifies the authentication tag —
              any tampered ciphertext will be rejected.
            </p>
          </div>

          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              How decryption works
            </h3>
            <ul
              class="list-disc flex flex-col gap-4 text-[14px] text-(--ck-text) ml-2.5 pl-5"
            >
              <li>
                The <strong>IV</strong> (first 12 bytes) is extracted from the
                ciphertext and used to initialise the GCM counter.
              </li>
              <li>
                The remaining bytes are decrypted using the
                <strong>secret key</strong>
                and the extracted IV.
              </li>
              <li>
                GCM verifies the
                <strong>authentication tag</strong> automatically — decryption
                fails if the data was modified.
              </li>
            </ul>
          </div>

          <div>
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
                  <UIcon
                    name="i-lucide-shield-alert"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  Wrong key = failure
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Any mismatch between the key used for encryption and
                  decryption will cause an authentication failure — no partial
                  results are returned.
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
                  Client-side only
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  All decryption happens in a Web Worker — neither the key nor
                  the plaintext ever leaves your browser.
                </p>
              </div>
            </div>
          </div>

          <div class="pb-6">
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Format
            </h3>
            <div
              class="bg-(--ck-panel-soft) border border-(--ck-border) p-4 rounded-lg"
            >
              <div
                class="text-[13px] font-mono text-(--ck-text) leading-relaxed"
              >
                <div class="mb-2">
                  Input = Base64(IV || Ciphertext)
                </div>
                <div class="text-[12px]">
                  IV: 12 bytes (96 bits)
                </div>
                <div class="text-[12px]">
                  Ciphertext: variable length
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UDrawer>
  </section>
</template>
