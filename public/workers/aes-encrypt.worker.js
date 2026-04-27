self.onmessage = async (event) => {
  const { action, text, key, iv, bits } = event.data;

  try {
    if (action === 'encrypt') {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const keyBuffer = Uint8Array.from(atob(key), c => c.charCodeAt(0));
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const ivBytes = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: ivBytes },
        cryptoKey,
        data
      );

      const combined = new Uint8Array(ivBytes.length + encrypted.byteLength);
      combined.set(ivBytes);
      combined.set(new Uint8Array(encrypted), ivBytes.length);

      const result = btoa(String.fromCharCode(...combined));
      const ivBase64 = btoa(String.fromCharCode(...ivBytes));

      self.postMessage({ ok: true, result, iv: ivBase64 });
    } else if (action === 'decrypt') {
      const decoder = new TextDecoder();
      const combined = Uint8Array.from(atob(text), c => c.charCodeAt(0));
      const ivBytes = combined.slice(0, 12);
      const encryptedData = combined.slice(12);

      const keyBuffer = Uint8Array.from(atob(key), c => c.charCodeAt(0));
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes },
        cryptoKey,
        encryptedData
      );

      const result = decoder.decode(decrypted);
      self.postMessage({ ok: true, result });
    } else if (action === 'generateKey') {
      const bytes = bits / 8;
      let rawBytes;

      if (bits === 128 || bits === 192 || bits === 256) {
        const key = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: bits },
          true,
          ['encrypt', 'decrypt']
        );
        const exported = await crypto.subtle.exportKey('raw', key);
        rawBytes = new Uint8Array(exported);
      } else {
        rawBytes = crypto.getRandomValues(new Uint8Array(bytes));
      }

      const hex = Array.from(rawBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const base64 = btoa(String.fromCharCode(...rawBytes));

      self.postMessage({ ok: true, hex, base64, bits });
    }
  } catch (err) {
    self.postMessage({ ok: false, error: err.message || String(err) });
  }
};
