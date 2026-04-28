---
trigger: always_on
---
# CryptoKit — Security & Cryptography Rules

## Core Principle

All cryptographic operations MUST run client-side inside Web Workers.

* Raw keys, plaintext, and intermediate crypto state MUST NEVER leave Worker scope
* UI layer communicates with Workers via serialized, non-sensitive messages only
* No crypto logic is allowed in the main thread

---

## Cryptography Standards

### Symmetric Encryption

* Algorithm: **AES-256-GCM (mandatory)**
* IV:

  * 96-bit (12 bytes)
  * Generated via `crypto.getRandomValues()`
  * MUST be unique per encryption
* IV reuse with same key is **strictly forbidden**
* Use **Additional Authenticated Data (AAD)** when context binding is required

Forbidden:

* AES-CBC
* AES-ECB

---

### Authenticated Encryption (AAD)

* AAD is required for binding metadata to ciphertext
* Must include:

  * algorithm
  * version
  * purpose/context
* Must NOT include sensitive data

---

### Asymmetric Encryption

* Encryption:

  * RSA-OAEP (SHA-256)
  * or ECDH (P-256 / X25519)
* Key exchange:

  * ECDH only
  * Private keys MUST NEVER be transmitted
* Signing:

  * ECDSA (P-256)
  * or Ed25519 (if supported)

Forbidden:

* RSA-PKCS1v1.5

---

### Key Derivation

* Password-based:

  * PBKDF2 (SHA-256, ≥ 310,000 iterations)
  * or Argon2id (via WASM)
* Key wrapping:

  * AES-KW
  * or AES-GCM with derived KEK
* Salt must be random and unique per derivation

Forbidden:

* MD5
* SHA-1

---

### Hashing

* Minimum: SHA-256
* Use SHA-512 where appropriate

Forbidden:

* MD5
* SHA-1

---

## Encrypted Payload Format

All encrypted outputs MUST follow a consistent structure:

```json
{
  "version": 1,
  "algorithm": "AES-GCM",
  "iv": "base64",
  "ciphertext": "base64",
  "aad": "base64 (optional)"
}
```

Notes:

* Authentication tag is implicit in AES-GCM ciphertext
* Format MUST be consistent across the application

---

## Randomness

* Use `crypto.getRandomValues()` ONLY
* All IVs, salts, and random values must be cryptographically secure

Forbidden:

* `Math.random()`

---

## Web Crypto API Rules

* Use `window.crypto.subtle` (SubtleCrypto) exclusively
* Keys must be `CryptoKey` objects
* Use `extractable: false` unless export is explicitly required

Forbidden:

* CryptoJS
* forge
* sjcl
* any non-native crypto libraries

---

## Web Worker Security

* All crypto runs inside dedicated Workers
* Use structured clone only (no functions, no complex state)
* Use `Transferable` objects (`ArrayBuffer`) when possible
* Terminate Worker after sensitive one-time operations

Forbidden:

* `eval()`
* `importScripts()` from untrusted sources

---

## Sensitive Data Handling

* Minimize lifetime of sensitive data in memory
* Overwrite buffers when possible:

```ts
buffer.fill(0)
```

* Prefer:

  * non-extractable `CryptoKey`
  * ephemeral variables

Strictly forbidden:

* Storing raw keys in:

  * Vue state
  * logs
  * global variables

---

## Error Handling

* Fail closed — never fallback to weaker algorithms
* Do not expose internal crypto errors to UI
* Validate all inputs before processing
* Reject malformed payloads immediately

---

## Side-Channel Considerations

* Avoid branching based on sensitive data
* Do not expose timing differences in UI
* Do not leak operation results through side effects

---

## General Security

* CSP: `default-src 'self'`
* No `innerHTML` / `v-html` without sanitization (DOMPurify)
* All user input must be validated and sanitized before crypto use

---

## Versioning

* All crypto outputs MUST include a `version` field
* Changes to algorithms or formats must be backward-compatible
* Never silently change encryption behavior

---

## Threat Flags (MANDATORY WARNINGS)

The system MUST warn or block implementation if:

* Plaintext keys are stored in `localStorage` / `sessionStorage`
* Any key, IV, or salt is hardcoded
* Crypto runs outside Web Worker
* `Math.random()` is used for security
* Raw keys leave Worker boundary

---

## Forbidden Patterns

* Crypto in main thread
* Custom crypto implementations
* Weak algorithms
* Insecure randomness
* Unversioned encrypted data

---

## Goal

Provide secure, consistent, and future-proof cryptographic operations with strict isolation, zero trust to UI layer, and no deviation from modern standards.