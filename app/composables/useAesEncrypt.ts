export function useAesEncrypt() {
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

  async function generateKey(bits: 128 | 192 | 256) {
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

    w.postMessage({ action: 'generateKey', bits })
  }

  async function encrypt() {
    if (!plaintext.value || !secretKey.value) return

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
    if (!ciphertext.value || !secretKey.value) return

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

  function clearAll() {
    plaintext.value = ''
    ciphertext.value = ''
    secretKey.value = ''
    errorMessage.value = ''
  }

  return {
    plaintext,
    ciphertext,
    secretKey,
    isProcessing,
    errorMessage,
    generateKey,
    encrypt,
    decrypt,
    clearAll
  }
}
