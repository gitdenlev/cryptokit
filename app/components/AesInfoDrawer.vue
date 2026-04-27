<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const { getThemeImage } = useThemeImage()

const catSuccess = computed(() =>
  getThemeImage('/cat-success-light.svg', '/cat-success-dark.svg')
)
</script>

<template>
  <UDrawer :open="isOpen" direction="right" :handle="false" @update:open="$emit('update:isOpen', $event)">
    <template #content>
      <div class="h-full w-[30vw] bg-[var(--ck-panel)] text-[var(--ck-text)] overflow-y-auto p-8 flex flex-col gap-8">
        <div>
          <p class="text-[15px] text-[var(--ck-muted)] leading-relaxed">
            AES-GCM is an authenticated encryption algorithm that provides both confidentiality and integrity. It's the gold standard for symmetric encryption.
          </p>
        </div>

        <div>
          <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">How it works</h3>
          <ul class="list-disc flex flex-col gap-4 text-[14px] text-[var(--ck-muted)] ml-2.5 pl-5">
            <li>
              <strong>GCM</strong> mode turns a block cipher into a stream cipher using counter mode, allowing encryption of data of any size.
            </li>
            <li>
              The <strong>IV</strong> (Initialization Vector) is randomly generated for each encryption and prepended to the ciphertext.
            </li>
            <li>
              AES-256 uses a 256-bit key — the strongest variant approved for classified government information.
            </li>
          </ul>
        </div>

        <div>
          <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">Security features</h3>
          <div class="flex flex-col gap-3">
            <div class="bg-[var(--ck-bg)] border border-[var(--ck-border)] p-4 rounded-lg">
              <div class="flex items-center gap-2 text-[var(--ck-text)] text-[14px] mb-1.5">
                <NuxtImg :src="catSuccess" alt="Authentic" width="20" height="20" />
                Authentication
              </div>
              <p class="text-[13px] text-[var(--ck-muted)] leading-relaxed">
                GCM produces an authentication tag that detects tampering. Decryption will fail if the ciphertext was modified.
              </p>
            </div>

            <div class="bg-[var(--ck-bg)] border border-[var(--ck-border)] p-4 rounded-lg">
              <div class="flex items-center gap-2 text-[var(--ck-text)] text-[14px] mb-1.5">
                <UIcon name="i-lucide-shield-check" class="w-4 h-4 text-[var(--ck-muted)]" />
                No padding needed
              </div>
              <p class="text-[13px] text-[var(--ck-muted)] leading-relaxed">
                Unlike CBC mode, GCM doesn't require padding, eliminating padding oracle attacks.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">Best practices</h3>
          <ul class="list-disc flex flex-col gap-4 text-[14px] text-[var(--ck-muted)] ml-2.5 pl-5">
            <li>Always use a fresh random key for each encryption session.</li>
            <li>Never reuse an IV with the same key.</li>
            <li>Store the full ciphertext (IV + ciphertext), it's self-contained.</li>
            <li>Use 256-bit keys for sensitive data.</li>
            <li>Keep your secret key safe — anyone with it can decrypt.</li>
          </ul>
        </div>

        <div class="pb-6">
          <h3 class="flex items-center gap-2.5 text-[var(--ck-text)] font-medium mb-4">Format</h3>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
