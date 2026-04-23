/**
 * AES Key Generator Worker
 * Uses Web Crypto API (CSPRNG) to generate cryptographically secure symmetric keys.
 * Runs off the main thread to keep the UI responsive.
 */
self.onmessage = async (event) => {
  const { bits } = event.data;

  // Only 128, 192, 256 are valid AES key lengths;
  // 512 is not an AES standard — we generate raw random bytes for it.
  const bytes = bits / 8;

  try {
    let rawBytes;

    if (bits === 128 || bits === 192 || bits === 256) {
      // Use WebCrypto to generate a proper AES key and export as raw bytes
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: bits },
        true, // extractable
        ["encrypt", "decrypt"]
      );
      const exported = await crypto.subtle.exportKey("raw", key);
      rawBytes = new Uint8Array(exported);
    } else {
      // For non-standard sizes (e.g. 512-bit HMAC keys), use CSPRNG directly
      rawBytes = crypto.getRandomValues(new Uint8Array(bytes));
    }

    // Convert to hex
    const hex = Array.from(rawBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Convert to base64
    const base64 = btoa(String.fromCharCode(...rawBytes));

    self.postMessage({ ok: true, hex, base64, bits });
  } catch (err) {
    self.postMessage({ ok: false, error: String(err) });
  }
};
