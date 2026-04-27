# CryptoKit — UI & Code Style Rules

## Stack
- Nuxt 4, Vue 3 (`<script setup>` + Composition API)
- NuxtUI v4 (exclusively — no third-party UI libs)
- TailwindCSS v4 (utility classes only, no custom CSS unless unavoidable)
- Web Workers (client-side only, no backend)

## Component Rules
- Use NuxtUI components as-is — no custom wrappers unless functionality is missing
- Never override NuxtUI internal styles directly; use `ui` prop or CSS variables
- Icons: use only `@iconify` via NuxtUI icon system

## Code Style
- TypeScript strictly — no `any`, no implicit types
- Composables for all reusable logic (`composables/use*.ts`)
- No Options API, no `this`, no mixins
- File naming: `PascalCase` for components, `camelCase` for composables/utils

## Design Principles
- Clean, modern, minimal — cybersecurity terminal aesthetic
- Dark mode first
- No decorative elements without functional purpose
- Consistent spacing via Tailwind scale (no magic numbers)

## Forbidden
- No inline styles
- No `!important`
- No third-party component libraries (Vuetify, PrimeVue, etc.)
- No jQuery or DOM manipulation outside Vue reactivity