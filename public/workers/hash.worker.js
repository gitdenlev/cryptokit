self.onmessage = async (event) => {
  const { action, text, algorithm } = event.data

  try {
    if (action === 'hash') {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)

      let hashAlgorithm
      if (algorithm === 'SHA-256') {
        hashAlgorithm = 'SHA-256'
      } else if (algorithm === 'SHA-384') {
        hashAlgorithm = 'SHA-384'
      } else if (algorithm === 'SHA-512') {
        hashAlgorithm = 'SHA-512'
      } else {
        throw new Error('Unsupported algorithm')
      }

      const hashBuffer = await crypto.subtle.digest(hashAlgorithm, data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      const hashBase64 = btoa(String.fromCharCode(...hashArray))

      self.postMessage({ ok: true, result: hashHex, base64: hashBase64 })
    }
  } catch (err) {
    self.postMessage({ ok: false, error: err.message || String(err) })
  }
}
