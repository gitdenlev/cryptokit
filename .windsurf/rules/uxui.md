---
trigger: always_on
---

# CryptoKit — UX/UI Design System

## Design Philosophy

Minimalist cybersecurity terminal aesthetic. Clean, functional, dark-first interface. No decorative elements without purpose. Every UI element must serve a role in cryptographic workflows.

---

## Tech Stack

- Nuxt v4
- Vue 3 (`<script setup>` only)
- NuxtUI v4
- TailwindCSS
- CSS Variables (`--ck-*`)

---

## Code Generation Rules

- Use Vue 3 Composition API (`<script setup>`)
- Follow Nuxt 4 conventions strictly
- Use TailwindCSS only (no inline styles)
- Always use design tokens (`--ck-*`)
- Do not invent new colors, spacing, or typography
- Prefer NuxtUI components over custom ones
- Avoid custom components unless necessary
- Keep components small and focused (<200 lines)
- Extract logic into composables (`useX` pattern)

---

## Strict Design Enforcement

- Do not redesign components
- Do not add gradients, shadows, or visual noise
- Do not change spacing scale
- Do not introduce new UI patterns
- Follow this system exactly

---

## Color System

### Dark Mode (Default)

- Background: `#161618` (`--ck-bg`)
- Panel: `#1e1e21` (`--ck-panel`)
- Panel Soft: `#2a2a2f` (`--ck-panel-soft`)
- Border: `#3a3a41` (`--ck-border`)
- Text: `#ececea` (`--ck-text`)
- Muted: `#a1a1aa` (`--ck-muted`)
- Accent: `#10b968` (`--ck-accent`)
- Accent Strong: `#0da85e`
- Accent Soft: `#1a3d2a`
- Accent Border: `#2d5a3f`

### Light Mode

- Background: `#f5f5f0`
- Panel: `#ffffff`
- Panel Soft: `#f0f0eb`
- Border: `#d8d8d2`
- Text: `#19191c`
- Muted: `#52525b`
- Accent: `#0a8f53`

---

## Typography

- Primary: `Geist Mono`
- Code: `Geist`
- Headings: 26px
- Body: 16px
- Labels: 15px
- Small: 14px

Rules:

- Use monospace everywhere except long code blocks
- No decorative fonts

---

## Layout

### Sidebar

- Width: 280px (320px desktop)
- Collapsed: 64px
- Transition: 300ms ease

### Main Content

- Max width: 800px
- Padding: 32px

---

## Components

### Cards

- Background: `--ck-panel`
- Border: `--ck-border`
- Rounded: `xl`

### Buttons (NuxtUI)

- `color="primary"` → accent
- `color="neutral"` → muted
- `variant="ghost"` → icon buttons

### Inputs

- No default outline
- Custom focus ring using `--ck-muted`

### Select (NuxtUI v4)

- Use `:items`
- No deprecated props

---

## Spacing

Base: 4px

- 4px / 8px / 10px / 18px / 32px
- Use Tailwind scale only

---

## Naming Conventions

- Components: `PascalCase.vue`
- Composables: `useSomething.ts`
- Variables: `--ck-*`

---

## Example Component

```vue
<template>
  <div
    class="bg-[--ck-panel] border border-[--ck-border] rounded-xl p-6 space-y-4"
  >
    <div class="flex items-center justify-between">
      <h1 class="text-[--ck-text] text-lg">Key Generator</h1>
      <UButton icon="i-lucide-refresh-cw" variant="ghost" />
    </div>

    <USelect :items="keySizes" size="lg" class="w-[200px]" />

    <UButton color="primary" label="Generate Key" class="w-full" />
  </div>
</template>

<script setup lang="ts">
const keySizes = [
  { label: '128-bit', value: 128 },
  { label: '256-bit', value: 256 }
]
</script>
```

---

## Forbidden Patterns

- No inline styles
- No `!important`
- No external UI libraries
- No jQuery or DOM hacks
- No decorative UI
- No custom styling unless explicitly required

---

## Dark Mode

- Dark mode is default
- Use `useColorMode()`
- Use CSS variables only

---

## Security Notes

- No `v-html` without sanitization
- Sensitive data must not be logged
- Password inputs must be masked

---

## Goal

Generate consistent, clean, production-ready UI using Nuxt 4 + NuxtUI 4 without deviation from this system.
