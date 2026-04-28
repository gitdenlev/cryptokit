---
trigger: always_on
---
## ESLint & Strict Formatting (Zero Tolerance)

AI must strictly adhere to the project's stylistic rules. Do not use default AI formatting habits. The code must be clean, readable, and pass strict ESLint checks without auto-fix warnings.

- **Quotes:** ALWAYS use single quotes (`'`) for strings in JavaScript/TypeScript (e.g., `const name = 'CryptoKit'`). Double quotes (`"`) are ONLY allowed in HTML/Vue template attributes.
- **Semicolons:** NO SEMICOLONS (`;`) at the end of statements. Never.
- **Trailing Commas:** NO TRAILING COMMAS (`,`) in arrays, objects, or function parameters.
- **Spacing:** Enforce consistent spacing inside objects (e.g., `{ label: '128-bit' }`).