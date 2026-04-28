<script setup lang="ts">
import { ref, computed } from 'vue'

const { secretKey, ciphertext } = useAesSession()

const isDrawerOpen = ref(false)
const copyToast = ref<{ show: () => void } | null>(null)

const plaintext = ref('')
const isProcessing = ref(false)
const errorMessage = ref('')
const showKey = ref(true)
const isCustomKey = ref(false)

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/workers/aes-encrypt.worker.js')
  }
  return worker
}

async function generateKey() {
  isProcessing.value = true
  errorMessage.value = ''
  secretKey.value = ''
  isCustomKey.value = false

  const w = getWorker()

  w.onmessage = (event) => {
    const { ok, base64, error } = event.data
    if (ok) {
      secretKey.value = base64
    } else {
      errorMessage.value = error || 'Failed to generate key'
    }
    isProcessing.value = false
  }

  w.onerror = () => {
    errorMessage.value = 'Worker error'
    isProcessing.value = false
  }

  w.postMessage({ action: 'generateKey', bits: 256 })
}

function onKeyInput() {
  isCustomKey.value = true
}

async function encrypt() {
  if (!plaintext.value) return
  if (!secretKey.value) return

  isProcessing.value = true
  errorMessage.value = ''
  ciphertext.value = ''

  const w = getWorker()

  w.onmessage = (event) => {
    const { ok, result, error } = event.data
    if (ok) {
      ciphertext.value = result
    } else {
      errorMessage.value = error || 'Encryption failed'
    }
    isProcessing.value = false
  }

  w.onerror = () => {
    errorMessage.value = 'Encryption failed'
    isProcessing.value = false
  }

  w.postMessage({
    action: 'encrypt',
    text: plaintext.value,
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
          Encrypt Text
        </h1>
        <p class="text-(--ck-text) text-[16px]">
          AES-GCM symmetric encryption with a secret key
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
      <!-- Plaintext -->
      <div>
        <span class="text-(--ck-text) text-[15px] mb-3 block">Plaintext</span>
        <UTextarea
          v-model="plaintext"
          autoresize
          variant="subtle"
          :rows="5"
          class="w-full font-mono text-[15px]"
        />
      </div>

      <div>
        <div class="flex items-center gap-3">
          <UInput
            v-model="secretKey"
            :type="showKey ? 'text' : 'password'"
            class="flex-1 font-mono text-[15px]"
            :color="secretKey ? 'primary' : 'neutral'"
            size="lg"
            @input="onKeyInput"
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
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            class="px-4"
            :disabled="!secretKey"
            @click="copyToClipboard(secretKey)"
          >
            <UIcon name="i-lucide-copy" class="w-5 h-5" />
            Copy
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            class="px-4"
            :loading="isProcessing && !secretKey"
            @click="generateKey"
          >
            <UIcon name="i-lucide-key" class="w-5 h-5" />
            Generate Key
          </UButton>
        </div>
      </div>

      <!-- Encrypt Button -->
      <div class="flex items-center gap-3">
        <UButton
          color="primary"
          size="lg"
          class="px-6"
          :loading="isProcessing && !!plaintext && !!secretKey && !ciphertext"
          :disabled="!plaintext || !secretKey"
          @click="encrypt"
        >
          <UIcon name="i-lucide-lock" class="w-5 h-5" />
          Encrypt
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

      <!-- Ciphertext -->
      <div v-if="ciphertext">
        <span class="text-(--ck-text) text-[15px] mb-3 block">Ciphertext</span>
        <div class="flex items-center gap-3">
          <UInput
            :model-value="ciphertext"
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
            @click="copyToClipboard(ciphertext)"
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
              AES-GCM is an authenticated encryption algorithm that provides
              both confidentiality and integrity. It's the gold standard for
              symmetric encryption.
            </p>
          </div>

          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              How it works
            </h3>
            <ul
              class="list-disc flex flex-col gap-4 text-[14px] text-(--ck-text) ml-2.5 pl-5"
            >
              <li>
                <strong>GCM</strong> mode turns a block cipher into a stream
                cipher using counter mode, allowing encryption of data of any
                size.
              </li>
              <li>
                The <strong>IV</strong> (Initialization Vector) is randomly
                generated for each encryption and prepended to the ciphertext.
              </li>
              <li>
                AES-256 uses a 256-bit key — the strongest variant approved for
                classified government information.
              </li>
            </ul>
          </div>

          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Security features
            </h3>
            <div class="flex flex-col gap-3">
              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon name="i-lucide-shield-check" class="w-[20px] h-[20px]" />
                  Authentication
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  GCM produces an authentication tag that detects tampering.
                  Decryption will fail if the ciphertext was modified.
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
                  No padding needed
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Unlike CBC mode, GCM doesn't require padding, eliminating
                  padding oracle attacks.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Best practices
            </h3>
            <ul
              class="list-disc flex flex-col gap-4 text-[14px] text-(--ck-text) ml-2.5 pl-5"
            >
              <li>
                Always use a fresh random key for each encryption session.
              </li>
              <li>Never reuse an IV with the same key.</li>
              <li>
                Store the full ciphertext (IV + ciphertext), it's
                self-contained.
              </li>
              <li>Use 256-bit keys for sensitive data.</li>
              <li>Keep your secret key safe — anyone with it can decrypt.</li>
            </ul>
          </div>
        </div>
      </template>
    </UDrawer>
  </section>
</template>
