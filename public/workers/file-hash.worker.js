self.onmessage = async (event) => {
  const { action, file, algorithm } = event.data

  try {
    if (action === 'hash') {
      const hashAlgorithm = algorithm || 'SHA-256'

      const arrayBuffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest(hashAlgorithm, arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      self.postMessage({ ok: true, result: hashHex })
    }
  } catch (err) {
    self.postMessage({ ok: false, error: err.message || String(err) })
  }
}
