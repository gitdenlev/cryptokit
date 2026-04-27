<script setup lang="ts">
import { ref, computed } from "vue";

const { getThemeImage } = useThemeImage();
const { secretKey, ciphertext } = useAesSession();

const catThinking = computed(() =>
  getThemeImage("/light-thinking-cat.svg", "/dark-thinking-cat.svg")
);
const catPlayful = computed(() =>
  getThemeImage("/cat-playful-light.svg", "/cat-playful-dark.svg")
);
const catSuccess = computed(() =>
  getThemeImage("/cat-success-light.svg", "/cat-success-dark.svg")
);
const catError = computed(() =>
  getThemeImage("/cat-error-light.svg", "/cat-error-dark.svg")
);

const isDrawerOpen = ref(false);
const copyToast = ref<{ show: () => void } | null>(null);

const plaintext = ref("");
const isProcessing = ref(false);
const errorMessage = ref("");
const showKey = ref(true);

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker("/workers/aes-encrypt.worker.js");
  }
  return worker;
}

async function generateKey() {
  isProcessing.value = true;
  errorMessage.value = "";
  secretKey.value = "";

  const w = getWorker();

  w.onmessage = (event) => {
    const { ok, base64, error } = event.data;
    if (ok) {
      secretKey.value = base64;
    } else {
      errorMessage.value = error || "Failed to generate key";
    }
    isProcessing.value = false;
  };

  w.onerror = () => {
    errorMessage.value = "Worker error";
    isProcessing.value = false;
  };

  w.postMessage({ action: "generateKey", bits: 256 });
}

async function encrypt() {
  if (!plaintext.value) return;
  if (!secretKey.value) return;

  isProcessing.value = true;
  errorMessage.value = "";
  ciphertext.value = "";

  const w = getWorker();

  w.onmessage = (event) => {
    const { ok, result, error } = event.data;
    if (ok) {
      ciphertext.value = result;
    } else {
      errorMessage.value = error || "Encryption failed";
    }
    isProcessing.value = false;
  };

  w.onerror = () => {
    errorMessage.value = "Encryption failed";
    isProcessing.value = false;
  };

  w.postMessage({
    action: "encrypt",
    text: plaintext.value,
    key: secretKey.value,
  });
}

const { copy } = useClipboard();

async function copyToClipboard(text: string) {
  if (!text) return;
  await copy(text);
  copyToast.value?.show();
}
</script>

<template>
  <section class="max-w-[800px] font-mono">
    <AppToast ref="copyToast" :icon="catPlayful" text="Copied to clipboard" title="Copied" />

    <header class="mb-8 flex flex-col items-start gap-4">
      <div>
        <h1 class="text-[28px] text-[var(--ck-text)] font-semibold mb-2 tracking-wide">
          Encrypt Text
        </h1>
        <p class="text-[var(--ck-muted)] text-[16px]">
          AES-GCM symmetric encryption with a secret key
        </p>
      </div>

      <button
        class="flex items-center gap-2.5 px-4 py-2.5 bg-[var(--ck-panel)] border border-[var(--ck-border)] rounded-lg hover:bg-[var(--ck-panel-soft)] transition-colors text-[14px] text-[var(--ck-text)] shadow-sm"
        @click="isDrawerOpen = true">
        <NuxtImg :src="catThinking" class="w-[20px] h-[20px]" alt="Cat icon" />
        How does AES-GCM work?
      </button>
    </header>

    <div
      class="bg-[var(--ck-panel)] border border-[var(--ck-border)] rounded-[12px] p-6 sm:p-8 flex flex-col gap-8 shadow-sm">
      <!-- Plaintext -->
      <div>
        <span class="text-[var(--ck-muted)] text-[15px] mb-3 block">Plaintext</span>
        <UTextarea autoresize variant="subtle" v-model="plaintext" :rows="5"
          class="w-full font-mono text-[15px]" />
      </div>

      <!-- Key / Passphrase -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-[var(--ck-muted)] text-[15px]">Key</span>
        </div>
        <div class="flex items-center gap-3">
          <UInput v-model="secretKey" :type="showKey ? 'text' : 'password'" class="flex-1 font-mono text-[15px]"
            :color="secretKey ? 'primary' : 'neutral'" size="lg" readonly>
            <template #trailing>
              <UButton color="neutral" variant="link" :icon="showKey ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                @click="showKey = !showKey" :padded="false" />
            </template>
          </UInput>
          <UButton color="neutral" variant="outline" size="lg" class="px-4" @click="copyToClipboard(secretKey)">
            <UIcon name="i-lucide-copy" class="w-5 h-5" />
            Copy
          </UButton>
          <UButton color="neutral" variant="outline" size="lg" class="px-4" @click="generateKey"
            :loading="isProcessing && !secretKey">
            <UIcon name="i-lucide-key" class="w-5 h-5" />
            Generate Key
          </UButton>
        </div>
      </div>

      <!-- Encrypt Button -->
      <div class="flex items-center gap-3">
        <UButton color="primary" size="lg" class="px-6" @click="encrypt"
          :loading="isProcessing && !!plaintext && !!secretKey && !ciphertext" :disabled="!plaintext || !secretKey">
          <UIcon name="i-lucide-lock" class="w-5 h-5" />
          Encrypt
        </UButton>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="flex items-start gap-3 text-[#ef4444] text-[14px]">
        <NuxtImg :src="catError" class="w-[24px] h-[24px] shrink-0 mt-0.5" alt="Error" />
        <span class="leading-relaxed font-mono">{{ errorMessage }}</span>
      </div>

      <!-- Ciphertext -->
      <div v-if="ciphertext">
        <span class="text-[var(--ck-muted)] text-[15px] mb-3 block">Ciphertext</span>
        <div class="flex items-center gap-3">
          <UInput :model-value="ciphertext" class="flex-1 font-mono text-[15px]" color="neutral" size="lg" readonly />
          <UButton color="neutral" variant="outline" size="lg" class="px-4" @click="copyToClipboard(ciphertext)">
            <UIcon name="i-lucide-copy" class="w-5 h-5" />
            Copy
          </UButton>
        </div>
      </div>
    </div>

    <UDrawer v-model:open="isDrawerOpen" direction="right" :handle="false">
      <template #content>
        <div class="h-full w-[30vw] bg-[var(--ck-panel)] text-[var(--ck-text)] overflow-y-auto p-8 flex flex-col gap-8">
          <div>
            <p class="text-[15px] text-[var(--ck-muted)] leading-relaxed">
              AES-GCM is an authenticated encryption algorithm that provides
              both confidentiality and integrity. It's the gold standard for
              symmetric encryption.
            </p>
          </div>

          <div>
            <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">
              How it works
            </h3>
            <ul class="list-disc flex flex-col gap-4 text-[14px] text-[var(--ck-muted)] ml-2.5 pl-5">
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
            <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">
              Security features
            </h3>
            <div class="flex flex-col gap-3">
              <div class="bg-[var(--ck-bg)] border border-[var(--ck-border)] p-4 rounded-lg">
                <div class="flex items-center gap-2 text-[var(--ck-text)] text-[14px] mb-1.5">
                  <NuxtImg :src="catSuccess" alt="Authentic" width="20" height="20" />
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

          <div class="pb-6">
            <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">
              Format
            </h3>
            <div class="bg-[var(--ck-panel-soft)] border border-[var(--ck-border)] p-4 rounded-lg">
              <div class="text-[13px] font-mono text-[var(--ck-muted)] leading-relaxed">
                <div class="mb-2">Output = Base64(IV || Ciphertext)</div>
                <div class="text-[12px]">IV: 12 bytes (96 bits)</div>
                <div class="text-[12px]">Ciphertext: variable length</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UDrawer>
  </section>
</template>
