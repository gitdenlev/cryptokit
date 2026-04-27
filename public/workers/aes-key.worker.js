self.onmessage = async (event) => {
  const { bits } = event.data;

  const bytes = bits / 8;

  try {
    let rawBytes;

    if (bits === 128 || bits === 192 || bits === 256) {
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: bits },
        true,
        ["encrypt", "decrypt"]
      );
      const exported = await crypto.subtle.exportKey("raw", key);
      rawBytes = new Uint8Array(exported);
    } else {
      rawBytes = crypto.getRandomValues(new Uint8Array(bytes));
    }

    const hex = Array.from(rawBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const base64 = btoa(String.fromCharCode(...rawBytes));

    self.postMessage({ ok: true, hex, base64, bits });
  } catch (err) {
    self.postMessage({ ok: false, error: String(err) });
  }
};
