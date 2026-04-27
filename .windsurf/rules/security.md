---
trigger: always_on
---
# CryptoKit — Security & Cryptography Rules

## Core Principle
All cryptographic operations run client-side via Web Workers.
Never expose raw keys, plaintext, or intermediate crypto state outside Worker boundary.

## Cryptography Standards

### Symmetric Encryption
- Algorithm: AES-256-GCM (authenticated encryption — mandatory)
- IV: 96-bit, cryptographically random (`crypto.getRandomValues`)
- Never reuse IV with the same key — generate fresh IV per operation
- No AES-CBC, AES-ECB — forbidden

### Asymmetric Encryption
- Algorithm: RSA-OAEP (SHA-256) or ECDH (P-256 / X25519)
- Key exchange: ECDH only — never transmit private keys
- Signing: ECDSA (P-256) or Ed25519 if SubtleCrypto supports it
- No RSA-PKCS1v1.5 — forbidden (vulnerable to padding oracle)

### Key Derivation
- Password-based: PBKDF2 (SHA-256, minimum 310 000 iterations) or Argon2id via WASM
- Key wrapping: AES-KW or AES-GCM with derived KEK
- Never derive keys with MD5/SHA-1

### Hashing
- SHA-256 minimum for all integrity checks
- No MD5, no SHA-1 — forbidden

## Web Crypto API Rules
- Use `SubtleCrypto` exclusively (`window.crypto.subtle`)
- No third-party crypto libs (CryptoJS, forge, sjcl) — they bypass native optimizations and audits
- Keys must be `CryptoKey` objects — never raw bytes in memory longer than necessary
- Use `extractable: false` where key export is not needed

## Web Worker Security
- Structured clone: never pass non-serializable crypto state
- Use `Transferable` objects (e.g., `ArrayBuffer`) for performance + memory safety
- Terminate Worker after sensitive operation if it's a one-shot task
- No `eval()`, no `importScripts()` from untrusted sources

## General Security
- CSP: strict Content Security Policy — `default-src 'self'`
- No `innerHTML`, `v-html` unless explicitly sanitized (DOMPurify)
- Validate and sanitize all user inputs before passing to crypto functions
- Zeroize sensitive buffers after use:
```ts
  buffer.fill(0)
```

## Threat Flags (must warn before implementing)
- Any operation that stores a plaintext key in `localStorage` / `sessionStorage`
- Any hardcoded key, salt, or IV
- Any crypto operation outside a Web Worker
- Any use of `Math.random()` for security purposes