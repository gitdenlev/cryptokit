<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const { hash1, hash2, isMatch } = useCompareHashes()

const isDrawerOpen = ref(false)

watch([hash1, hash2], () => {
  if (hash1.value && hash2.value) {
    isMatch.value = hash1.value === hash2.value
  } else {
    isMatch.value = null
  }
})

async function copyToClipboard(text: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
}
</script>

<template>
  <section class="max-w-[800px] font-mono">
    <header class="mb-8 flex flex-col items-start gap-4">
      <div>
        <h1
          class="text-[28px] text-(--ck-text) font-semibold mb-2 tracking-wide"
        >
          Compare Hashes
        </h1>
        <p class="text-(--ck-text) text-[16px]">
          Compare two hash values to verify data integrity
        </p>
      </div>

      <button
        class="flex items-center gap-2.5 px-4 py-2.5 bg-(--ck-panel) border border-(--ck-border) rounded-lg hover:bg-(--ck-panel-soft) transition-colors text-[14px] text-(--ck-text) shadow-sm"
        @click="isDrawerOpen = true"
      >
        <UIcon name="i-lucide-help-circle" class="w-[20px] h-[20px]" />
        Why compare hashes?
      </button>
    </header>

    <div
      class="bg-(--ck-panel) border border-(--ck-border) rounded-[12px] p-6 sm:p-8 flex flex-col gap-8 shadow-sm"
    >
      <!-- Hash 1 -->
      <div>
        <span class="text-(--ck-text) text-[15px] mb-3 block">Hash 1</span>
        <div class="flex items-center gap-3">
          <UTextarea
            v-model="hash1"
            autoresize
            variant="subtle"
            :rows="3"
            class="flex-1 font-mono text-[15px]"
            placeholder="Paste first hash..."
          />
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            class="px-4"
            :disabled="!hash1"
            @click="copyToClipboard(hash1)"
          >
            <UIcon name="i-lucide-copy" class="w-5 h-5" />
          </UButton>
        </div>
      </div>

      <!-- Hash 2 -->
      <div>
        <span class="text-(--ck-text) text-[15px] mb-3 block">Hash 2</span>
        <div class="flex items-center gap-3">
          <UTextarea
            v-model="hash2"
            autoresize
            variant="subtle"
            :rows="3"
            class="flex-1 font-mono text-[15px]"
            placeholder="Paste second hash..."
          />
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            class="px-4"
            :disabled="!hash2"
            @click="copyToClipboard(hash2)"
          >
            <UIcon name="i-lucide-copy" class="w-5 h-5" />
          </UButton>
        </div>
      </div>

      <!-- Result -->
      <div
        v-if="isMatch !== null"
        class="flex items-center gap-3 p-4 rounded-lg border"
        :class="
          isMatch
            ? 'bg-(--ck-accent-soft) border-(--ck-accent-border)'
            : 'bg-(--ck-panel-soft) border-(--ck-border)'
        "
      >
        <UIcon
          :name="isMatch ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
          class="w-[24px] h-[24px] shrink-0"
        />
        <span
          class="text-[15px] font-medium"
          :class="isMatch ? 'text-(--ck-accent)' : 'text-(--ck-text)'"
        >
          {{ isMatch ? 'Hashes match' : 'Hashes do not match' }}
        </span>
      </div>
    </div>

    <UDrawer v-model:open="isDrawerOpen" direction="right" :handle="false">
      <template #content>
        <div
          class="h-full w-[30vw] bg-(--ck-panel) text-(--ck-text) overflow-y-auto p-8 flex flex-col gap-8"
        >
          <div>
            <p class="text-[15px] text-(--ck-text) leading-relaxed">
              Comparing hashes is a fundamental technique for verifying data
              integrity. If two hashes match, the underlying data is identical
              with near certainty.
            </p>
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
                    name="i-lucide-download"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  Download verification
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Software publishers provide hash values. Compare the hash of
                  your downloaded file with the official one to detect
                  tampering.
                </p>
              </div>

              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon
                    name="i-lucide-database"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  Database integrity
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Store hashes of records. Periodically recompute and compare to
                  detect unauthorized modifications.
                </p>
              </div>

              <div
                class="bg-(--ck-bg) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon
                    name="i-lucide-git-branch"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  Version control
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Git uses SHA-1 hashes to identify commits. Comparing commit
                  hashes ensures you're working with the exact same codebase.
                </p>
              </div>
            </div>
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
                Hash functions are deterministic — the same input always
                produces the same output.
              </li>
              <li>
                Even a single bit change in the input produces a completely
                different hash (avalanche effect).
              </li>
              <li>
                Collision resistance makes it practically impossible for two
                different inputs to have the same hash.
              </li>
            </ul>
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
                Always verify hashes from trusted sources — the hash itself can
                be spoofed if the source is compromised.
              </li>
              <li>
                Use strong algorithms (SHA-256 or higher). Avoid MD5 and SHA-1
                for security-critical applications.
              </li>
              <li>
                Trim whitespace when comparing — copy-paste operations often
                include extra spaces or newlines.
              </li>
              <li>
                Case sensitivity matters — some systems use uppercase, others
                lowercase. Normalize before comparing.
              </li>
            </ul>
          </div>

          <div class="pb-6">
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Example workflow
            </h3>
            <div
              class="bg-(--ck-panel-soft) border border-(--ck-border) p-4 rounded-lg"
            >
              <div class="text-[13px] font-mono text-(--ck-text) leading-relaxed">
                <div class="mb-2">1. Download file from publisher</div>
                <div class="mb-2">
                  2. Hash the file using Hash Text or File Integrity tool
                </div>
                <div class="mb-2">
                  3. Copy the official hash from publisher's website
                </div>
                <div class="mb-2">
                  4. Paste both hashes here to compare
                </div>
                <div>5. Match = file is authentic</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UDrawer>
  </section>
</template>
