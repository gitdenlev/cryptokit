<script setup lang="ts">
import { ref, watch } from 'vue'

const { selectedFile, fileHash, selectedAlgorithm, isProcessing, errorMessage } = useFileIntegrity()

const isDrawerOpen = ref(false)
const copyToast = ref<{ show: () => void } | null>(null)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const algorithms = [
  { label: 'SHA-256', value: 'SHA-256' },
  { label: 'SHA-384', value: 'SHA-384' },
  { label: 'SHA-512', value: 'SHA-512' }
]

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/workers/file-hash.worker.js')
  }
  return worker
}

async function hashFile() {
  if (!selectedFile.value) return

  isProcessing.value = true
  errorMessage.value = ''
  fileHash.value = ''

  const w = getWorker()

  w.onmessage = (event) => {
    const { ok, result, error } = event.data
    if (ok) {
      fileHash.value = result
    } else {
      errorMessage.value = error || 'File hashing failed'
    }
    isProcessing.value = false
  }

  w.onerror = () => {
    errorMessage.value = 'File hashing failed'
    isProcessing.value = false
  }

  w.postMessage({
    action: 'hash',
    file: selectedFile.value,
    algorithm: selectedAlgorithm.value
  })
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0] || null
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0] || null
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
}

function openFileDialog() {
  fileInputRef.value?.click()
}

function clearFile() {
  selectedFile.value = null
  fileHash.value = ''
  errorMessage.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function copyToClipboard(text: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  copyToast.value?.show()
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

watch([selectedFile, selectedAlgorithm], () => {
  if (selectedFile.value) {
    hashFile()
  } else {
    fileHash.value = ''
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
          File Integrity
        </h1>
        <p class="text-(--ck-text) text-[16px]">
          Verify file integrity by computing cryptographic hashes
        </p>
      </div>

      <button
        class="flex items-center gap-2.5 px-4 py-2.5 bg-(--ck-panel) border border-(--ck-border) rounded-lg hover:bg-(--ck-panel-soft) transition-colors text-[14px] text-(--ck-text) shadow-sm"
        @click="isDrawerOpen = true"
      >
        <UIcon name="i-lucide-help-circle" class="w-[20px] h-[20px]" />
        What is file integrity?
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

      <!-- File Upload Area -->
      <div>
        <span class="text-(--ck-text) text-[15px] mb-3 block">File</span>
        <div
          class="relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer"
          :class="
            isDragging
              ? 'border-(--ck-accent) bg-(--ck-accent-soft)'
              : 'border-(--ck-border) bg-(--ck-bg) hover:border-(--ck-muted)'
          "
          @click="openFileDialog"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            @change="handleFileSelect"
          />

          <UIcon
            :name="selectedFile ? 'i-lucide-file-check' : 'i-lucide-upload-cloud'"
            class="w-12 h-12"
            :class="selectedFile ? 'text-(--ck-accent)' : 'text-(--ck-muted)'"
          />

          <div class="text-center">
            <p
              v-if="!selectedFile"
              class="text-(--ck-text) text-[15px] mb-1"
            >
              Drag and drop a file here, or click to browse
            </p>
            <p
              v-else
              class="text-(--ck-text) text-[15px] mb-1 font-medium"
            >
              {{ selectedFile.name }}
            </p>
            <p
              v-if="selectedFile"
              class="text-(--ck-muted) text-[13px]"
            >
              {{ formatFileSize(selectedFile.size) }}
            </p>
          </div>

          <UButton
            v-if="selectedFile"
            color="neutral"
            variant="ghost"
            size="sm"
            @click.stop="clearFile"
          >
            <UIcon name="i-lucide-x" class="w-4 h-4" />
            Clear
          </UButton>
        </div>
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
      <div v-if="fileHash">
        <span class="text-(--ck-text) text-[15px] mb-3 block">Hash (Hex)</span>
        <div class="flex items-center gap-3">
          <UInput
            :model-value="fileHash"
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
            :disabled="isProcessing"
            @click="copyToClipboard(fileHash)"
          >
            <UIcon name="i-lucide-copy" class="w-5 h-5" />
            Copy
          </UButton>
        </div>
      </div>

      <!-- Processing indicator -->
      <div
        v-if="isProcessing"
        class="flex items-center gap-3 text-(--ck-muted) text-[14px]"
      >
        <UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
        <span>Computing hash...</span>
      </div>
    </div>

    <UDrawer v-model:open="isDrawerOpen" direction="right" :handle="false">
      <template #content>
        <div
          class="h-full w-[30vw] bg-(--ck-panel) text-(--ck-text) overflow-y-auto p-8 flex flex-col gap-8"
        >
          <div>
            <p class="text-[15px] text-(--ck-text) leading-relaxed">
              File integrity verification ensures that a file has not been
              altered or corrupted. By computing a cryptographic hash of a file,
              you can compare it against a known good value to detect any
              changes.
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
                A hash function processes the entire file and produces a
                fixed-size string of characters.
              </li>
              <li>
                Even a single bit change in the file results in a completely
                different hash (avalanche effect).
              </li>
              <li>
                Compare the computed hash with the official hash provided by
                the file publisher.
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
                    name="i-lucide-download"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  Software downloads
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Verify downloaded software matches the publisher's official
                  hash to detect tampering.
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
                  Backup verification
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Ensure backup files haven't been corrupted by comparing hashes
                  before and after storage.
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
                  Data transfer
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Verify files transferred over networks haven't been corrupted
                  during transmission.
                </p>
              </div>
            </div>
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
                  <UIcon name="i-lucide-check-circle" class="w-[24px] h-[24px] shrink-0" />
                  Client-side only
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  All hashing happens in a Web Worker — your file never leaves
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
                  Trust the source
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Hash verification only works if you trust the source of the
                  official hash value.
                </p>
              </div>
            </div>
          </div>

          <div class="pb-6">
            <h3
              class="flex items-center gap-2.5 text-(--ck-text) font-medium mb-4"
            >
              Related tools
            </h3>
            <div class="flex flex-col gap-3">
              <div
                class="bg-(--ck-panel-soft) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon
                    name="i-lucide-text"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  <NuxtLink
                    to="/hash-text"
                    class="text-(--ck-accent) underline hover:no-underline"
                  >
                    Hash Text
                  </NuxtLink>
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Hash text strings instead of files.
                </p>
              </div>

              <div
                class="bg-(--ck-panel-soft) border border-(--ck-border) p-4 rounded-lg"
              >
                <div
                  class="flex items-center gap-2 text-(--ck-text) text-[14px] mb-1.5"
                >
                  <UIcon
                    name="i-lucide-scale"
                    class="w-4 h-4 text-(--ck-text)"
                  />
                  <NuxtLink
                    to="/compare-hashes"
                    class="text-(--ck-accent) underline hover:no-underline"
                  >
                    Compare Hashes
                  </NuxtLink>
                </div>
                <p class="text-[13px] text-(--ck-text) leading-relaxed">
                  Compare two hash values to verify they match.
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UDrawer>
  </section>
</template>
