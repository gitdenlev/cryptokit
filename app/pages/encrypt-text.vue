<script setup lang="ts">
import { ref, computed } from 'vue'

const { getThemeImage } = useThemeImage()

const catThinking = computed(() => getThemeImage('/light-thinking-cat.svg', '/dark-thinking-cat.svg'))
const catPlayful = computed(() => getThemeImage('/cat-playful-light.svg', '/cat-playful-dark.svg'))
const catSuccess = computed(() => getThemeImage('/cat-success-light.svg', '/cat-success-dark.svg'))
const catError = computed(() => getThemeImage('/cat-error-light.svg', '/cat-error-dark.svg'))

const isDrawerOpen = ref(false)
const copyToast = ref<{ show: () => void } | null>(null)

const selectedKeySize = ref<128 | 192 | 256>(256)
const keySizeOptions = [
  { label: '128 bits', value: 128 },
  { label: '192 bits', value: 192 },
  { label: '256 bits', value: 256 }
]

const plaintext = ref('')
const ciphertext = ref('')
const secretKey = ref('')
const isProcessing = ref(false)
const errorMessage = ref('')

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

  w.postMessage({ action: 'generateKey', bits: selectedKeySize.value })
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

  w.postMessage({ action: 'encrypt', text: plaintext.value, key: secretKey.value })
}

async function decrypt() {
  if (!ciphertext.value) return
  if (!secretKey.value) return

  isProcessing.value = true
  errorMessage.value = ''

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

  w.postMessage({ action: 'decrypt', text: ciphertext.value, key: secretKey.value })
}

async function copyToClipboard(text: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  copyToast.value?.show()
}

function clearAll() {
  plaintext.value = ''
  ciphertext.value = ''
  secretKey.value = ''
  errorMessage.value = ''
}
</script>

<template>
  <section class="max-w-[800px] font-sans">
    <AppToast
      ref="copyToast"
      :icon="catPlayful"
      text="Copied to clipboard"
      title="Copied"
    />

    <header class="mb-6">
      <h1 class="text-[26px] text-[var(--ck-text)] font-medium mb-1.5 tracking-wide">
        Encrypt Text
      </h1>
      <p class="text-[var(--ck-muted)] text-[16px] mb-4">
        AES-GCM symmetric encryption with a secret key
      </p>

      <UButton
        class="flex items-center gap-2.5 px-4 py-2.5 bg-[var(--ck-panel)] border border-[var(--ck-border)] rounded-lg hover:bg-[var(--ck-panel-soft)] transition-colors text-[14px] text-[var(--ck-muted)]"
        @click="isDrawerOpen = true"
      >
        <NuxtImg
          :src="catThinking"
          class="w-[20px] h-[20px]"
          alt="Cat icon"
        />
        How does AES-GCM work?
      </UButton>
    </header>

    <div class="bg-[var(--ck-panel)] border border-[var(--ck-border)] rounded-xl p-8 flex flex-col gap-8">
      <div>
        <span class="text-[var(--ck-muted)] text-[15px] mb-4 block">Secret Key</span>
        <div class="flex items-center gap-4">
          <USelect
            v-model="selectedKeySize"
            :items="keySizeOptions"
            class="w-[140px]"
          />
          <UButton
            color="primary"
            @click="generateKey"
            :loading="isProcessing && !secretKey"
          >
            <UIcon name="i-lucide-key" class="w-[18px] h-[18px]" />
            Generate Key
          </UButton>
          <UButton
            color="neutral"
            :disabled="!secretKey"
            @click="copyToClipboard(secretKey)"
          >
            <UIcon name="i-lucide-copy" class="w-[18px] h-[18px]" />
            Copy
          </UButton>
        </div>
        <div
          v-if="secretKey"
          class="mt-3 bg-[var(--ck-bg)] border border-[var(--ck-border)] rounded-lg px-4 py-3 overflow-x-auto"
        >
          <code class="font-mono text-[14px] text-[var(--ck-text)] break-all whitespace-nowrap">
            {{ secretKey }}
          </code>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-[var(--ck-muted)] text-[15px]">Plaintext</span>
          <div class="flex items-center gap-2">
            <UButton
              variant="ghost"
              size="sm"
              :disabled="!plaintext"
              @click="plaintext = ''"
            >
              Clear
            </UButton>
          </div>
        </div>
        <UTextarea
          v-model="plaintext"
          placeholder="Enter text to encrypt..."
          :rows="4"
          class="font-mono"
        />
      </div>

      <div class="flex items-center gap-3">
        <UButton
          color="primary"
          @click="encrypt"
          :loading="isProcessing && !!plaintext && !!secretKey && !ciphertext"
          :disabled="!plaintext || !secretKey"
        >
          <UIcon name="i-lucide-lock" class="w-[18px] h-[18px]" />
          Encrypt
        </UButton>
        <UButton
          color="neutral"
          @click="decrypt"
          :loading="isProcessing && !!ciphertext && !!secretKey && !plaintext"
          :disabled="!ciphertext || !secretKey"
        >
          <UIcon name="i-lucide-unlock" class="w-[18px] h-[18px]" />
          Decrypt
        </UButton>
      </div>

      <div v-if="errorMessage" class="flex items-center gap-2 text-[#f87171] text-[14px]">
        <NuxtImg
          :src="catError"
          class="w-[20px] h-[20px]"
          alt="Error"
        />
        {{ errorMessage }}
      </div>

      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-[var(--ck-muted)] text-[15px]">Ciphertext</span>
          <UButton
            variant="ghost"
            size="sm"
            :disabled="!ciphertext"
            @click="copyToClipboard(ciphertext)"
          >
            <UIcon name="i-lucide-copy" class="w-[16px] h-[16px]" />
            Copy
          </UButton>
        </div>
        <div class="bg-[var(--ck-bg)] border border-[var(--ck-border)] rounded-lg px-4 py-3 min-h-[100px] overflow-x-auto">
          <code
            v-if="ciphertext"
            class="font-mono text-[14px] text-[var(--ck-text)] break-all whitespace-pre-wrap"
          >
            {{ ciphertext }}
          </code>
          <span
            v-else
            class="text-[var(--ck-muted)] text-[14px] italic"
          >
            Encrypted text will appear here...
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-[var(--ck-border)]">
        <span class="text-[var(--ck-muted)] text-[13px]">
          Output is Base64-encoded (IV + ciphertext)
        </span>
        <UButton
          variant="ghost"
          size="sm"
          @click="clearAll"
        >
          Clear All
        </UButton>
      </div>
    </div>

    <UDrawer v-model:open="isDrawerOpen" direction="right" :handle="false">
      <template #content>
        <div class="h-full w-[30vw] bg-[var(--ck-panel)] text-[var(--ck-text)] overflow-y-auto p-8 flex flex-col gap-8">
          <div>
            <p class="text-[15px] text-[var(--ck-muted)] leading-relaxed">
              AES-GCM is an authenticated encryption algorithm that provides both
              confidentiality and integrity. It's the gold standard for symmetric encryption.
            </p>
          </div>

          <div>
            <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">
              How it works
            </h3>
            <ul class="list-disc flex flex-col gap-4 text-[14px] text-[var(--ck-muted)] ml-2.5 pl-5">
              <li>
                <strong>GCM</strong> mode turns a block cipher into a stream cipher
                using counter mode, allowing encryption of data of any size.
              </li>
              <li>
                The <strong>IV</strong> (Initialization Vector) is randomly generated
                for each encryption and prepended to the ciphertext.
              </li>
              <li>
                AES-256 uses a 256-bit key — the strongest variant approved for
                classified government information.
              </li>
            </ul>
          </div>

          <div>
            <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">
              Security features
            </h3>
            <div class="flex flex-col gap-3">
              <div class="bg-[var(--ck-bg)] border border-[var(--ck-border)] p-4 rounded-lg">
                <div class="flex items-center gap-2 text-[var(--ck-text)] text-[14px] mb-1.5">
                  <NuxtImg
                    :src="catSuccess"
                    alt="Authentic"
                    width="20"
                    height="20"
                  />
                  Authentication
                </div>
                <p class="text-[13px] text-[var(--ck-muted)] leading-relaxed">
                  GCM produces an authentication tag that detects tampering.
                  Decryption will fail if the ciphertext was modified.
                </p>
              </div>

              <div class="bg-[var(--ck-bg)] border border-[var(--ck-border)] p-4 rounded-lg">
                <div class="flex items-center gap-2 text-[var(--ck-text)] text-[14px] mb-1.5">
                  <UIcon name="i-lucide-shield-check" class="w-4 h-4 text-[var(--ck-muted)]" />
                  No padding needed
                </div>
                <p class="text-[13px] text-[var(--ck-muted)] leading-relaxed">
                  Unlike CBC mode, GCM doesn't require padding, eliminating
                  padding oracle attacks.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">
              Best practices
            </h3>
            <ul class="list-disc flex flex-col gap-4 text-[14px] text-[var(--ck-muted)] ml-2.5 pl-5">
              <li>Always use a fresh random key for each encryption session.</li>
              <li>Never reuse an IV with the same key.</li>
              <li>Store the full ciphertext (IV + ciphertext), it's self-contained.</li>
              <li>Use 256-bit keys for sensitive data.</li>
              <li>Keep your secret key safe — anyone with it can decrypt.</li>
            </ul>
          </div>

          <div class="pb-6">
            <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">
              Format
            </h3>
            <div class="bg-[var(--ck-panel-soft)] border border-[var(--ck-border)] p-4 rounded-lg">
              <div class="text-[13px] font-mono text-[var(--ck-muted)] leading-relaxed">
                <div class="mb-2">
                  Output = Base64(IV || Ciphertext)
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
