<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

const length = ref(20)
const includeLower = ref(true)
const includeUpper = ref(true)
const includeDigits = ref(true)
const includeSymbols = ref(true)

const copyToastText = 'Password copied'
const copyToast = ref<{ show: () => void } | null>(null)

const isDrawerOpen = ref(false)


// Shared checkbox UI configuration
const checkboxUi = {
  base: 'w-5 h-5 rounded-[4px] flex items-center justify-center',
  border: 'border-transparent ring-0'
}

const charset = computed(() => {
  let s = ''
  if (includeLower.value) s += LOWER
  if (includeUpper.value) s += UPPER
  if (includeDigits.value) s += DIGITS
  if (includeSymbols.value) s += SYMBOLS
  return s
})

const entropy = computed(() => {
  if (!charset.value.length) return 0
  return Math.floor(length.value * Math.log2(charset.value.length))
})

const strengthColor = computed(() => {
  if (length.value < 12) return '(--ck-strength-weak)'
  if (length.value < 16) return '(--ck-strength-fair)'
  return '(--ck-strength-strong)'
})

const strengthLabel = computed(() => {
  if (length.value < 12) return 'Weak'
  if (length.value < 16) return 'Fair'
  return 'Strong'
})

function generatePassword(): string {
  if (!charset.value.length) return ''
  const arr = new Uint32Array(length.value)
  crypto.getRandomValues(arr)
  return Array.from(arr, n => charset.value[n % charset.value.length]).join(
    ''
  )
}

const generatedPassword = ref(generatePassword())

function regenerate() {
  generatedPassword.value = generatePassword()
}

watch(
  [length, includeLower, includeUpper, includeDigits, includeSymbols],
  regenerate
)

async function onCopyPassword() {
  if (!generatedPassword.value) return
  await navigator.clipboard.writeText(generatedPassword.value)
  copyToast.value?.show()
}
</script>

<template>
  <section class="max-w-[800px] font-sans">
    <AppToast
      ref="copyToast"
      icon="i-lucide-check"
      :text="copyToastText"
      title="Copied"
    />

    <header class="mb-6">
      <h1 class="text-[26px] text-(--ck-text) font-medium mb-1.5 tracking-wide">
        Password Generator
      </h1>
      <p class="text-(--ck-text) text-[16px] mb-4">
        Cryptographically secure random passwords
      </p>

      <UButton
        class="flex items-center gap-2.5 px-4 py-2.5 bg-(--ck-panel) border border-(--ck-border) rounded-lg hover:bg-(--ck-panel-soft) transition-colors text-[14px] text-(--ck-text)"
        @click="isDrawerOpen = true"
      >
        <UIcon name="i-lucide-help-circle" class="w-[20px] h-[20px]" />
        Why does a strong password matter?
      </UButton>
    </header>

    <div
      class="bg-(--ck-panel) border border-(--ck-border) rounded-xl p-8 flex flex-col"
    >
      <div class="flex flex-col gap-4 mb-10">
        <div class="flex items-center justify-between">
          <span class="text-(--ck-text) text-[15px]">Length: {{ length }}</span>
          <span
            class="text-[13px] font-medium transition-colors"
            :style="{ color: strengthColor }"
          >{{ strengthLabel }}</span>
        </div>
        <div class="ck-strength-slider" :style="{ '--sc': strengthColor }">
          <USlider
            v-model="length"
            :min="8"
            :max="64"
            :step="1"
            :ui="{
              track: { background: 'bg-(--ck-bg)' },
              thumb: { ring: 'ring-2', size: 'h-[18px] w-[18px]' }
            }"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-y-5 gap-x-8 max-w-[420px] mb-12">
        <UCheckbox v-model="includeLower" label="Lower" :ui="checkboxUi" />
        <UCheckbox v-model="includeUpper" label="Upper" :ui="checkboxUi" />
        <UCheckbox v-model="includeDigits" label="Digits" :ui="checkboxUi" />
        <UCheckbox v-model="includeSymbols" label="Symbols" :ui="checkboxUi" />
      </div>

      <div class="flex items-center justify-between mb-8">
        <span class="text-(--ck-text) text-[15px]">~{{ entropy }} bits of entropy</span>
        <div class="flex items-center gap-3">
          <UButton color="primary" @click="regenerate">
            <UIcon name="i-lucide-refresh-cw" class="w-[18px] h-[18px]" />
            Generate
          </UButton>
          <UButton color="neutral" @click="onCopyPassword">
            <UIcon name="i-lucide-copy" class="w-[18px] h-[18px]" />
            Copy
          </UButton>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between" />
        <div
          class="relative bg-(--ck-bg) rounded-lg px-5 py-4 overflow-x-auto min-h-[56px] flex items-center"
        >
          <code
            v-if="generatedPassword"
            class="font-mono text-[15px] text-(--ck-text) break-all whitespace-pre-wrap leading-relaxed"
          >{{ generatedPassword }}</code>
          <span v-else class="text-(--ck-text) text-[14px] italic">
            Select at least one character type
          </span>
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
              A password is the first — and often the only — line of defense
              between your data and an attacker.
            </p>
          </div>

          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              The numbers
            </h3>
            <ul
              class="list-disc flex flex-col gap-4 text-[14px] text-(--ck-text) ml-2.5"
            >
              <li>
                An 8-character lowercase password can be brute-forced in
                seconds.
              </li>
              <li>
                A 16-character mixed password (~100 bits of entropy) would take
                billions of years.
              </li>
              <li>
                Over 80% of breaches involve weak or reused passwords (Verizon
                DBIR).
              </li>
            </ul>
          </div>

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
                  <UIcon name="i-lucide-mail" class="w-[20px] h-[20px]" />
                  Email takeover
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  An attacker who guesses your email password can reset every
                  other account you own — banking, social, work.
                </p>
              </div>

              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon name="i-lucide-key" class="w-[20px] h-[20px]" />
                  Credential stuffing
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Password leaked in one breach? Bots will try it on hundreds of
                  other sites within hours.
                </p>
              </div>

              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon name="i-lucide-eye" class="w-[20px] h-[20px]" />
                  Shoulder surfing
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Short or predictable passwords (like "qwerty2024") can be
                  memorized at a glance in a café or office.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Practical tips
            </h3>
            <ol
              class="flex flex-col gap-4 text-[14px] text-(--ck-text) ml-2.5 pl-5 list-decimal"
            >
              <li class="relative">
                Use at least 16 characters — length beats complexity.
              </li>
              <li class="relative">
                Never reuse a password across services.
              </li>
              <li class="relative">
                Store passwords in a manager (Bitwarden, 1Password, KeePassXC).
              </li>
              <li class="relative">
                Enable two-factor authentication wherever possible.
              </li>
              <li class="relative">
                Avoid personal info: names, birthdays, pet names.
              </li>
              <li class="relative">
                Rotate passwords if a service you use is breached (check
                haveibeenpwned.com).
              </li>
            </ol>
          </div>

          <div class="pb-6">
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Bad vs good
            </h3>
            <div class="flex flex-col gap-3">
              <div
                class="bg-(--ck-panel-soft) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-[#f87171] text-[14px] font-mono mb-1.5"
                >
                  <UIcon name="i-lucide-x-circle" class="w-[20px] h-[20px]" />
                  john1990!
                </div>
                <p class="text-[13px] text-(--ck-text) font-mono" />
              </div>

              <div
                class="bg-(--ck-panel-soft) border border-(--ck-accent-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-accent) text-[14px] font-mono mb-1.5"
                >
                  <UIcon name="i-lucide-check-circle" class="w-[20px] h-[20px]" />
                  k7$Qm9!nP2x@vL8r
                </div>
                <p class="text-[13px] text-(--ck-text) font-mono">
                  centuries to brute-force
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
.ck-strength-slider :deep([data-slot="range"]),
.ck-strength-slider :deep([data-slot="progress"]) {
  background-color: (--sc) !important;
  transition: background-color 0.3s ease;
}

.ck-strength-slider :deep([data-slot="thumb"]) {
  background-color: (--sc) !important;
  transition:
    background-color 0.3s ease,
    outline-color 0.3s ease,
    box-shadow 0.3s ease;
}

.ck-strength-slider :deep([data-slot="thumb"]:focus),
.ck-strength-slider :deep([data-slot="thumb"]:focus-visible),
.ck-strength-slider :deep([data-slot="thumb"]:active) {
  outline-color: (--sc) !important;
  box-shadow: 0 0 0 3px (--sc) !important;
}
</style>
