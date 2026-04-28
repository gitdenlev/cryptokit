<script setup lang="ts">
type Props = {
  icon: string
  text: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Success'
})

const toast = useToast()

function show() {
  toast.add({
    description: props.text,
    orientation: 'horizontal',
    class: 'ml-auto inline-flex w-fit max-w-fit',
    close: false,
    progress: false,
    duration: 3000,
    avatar: {
      src: props.icon,
      alt: props.title,
      size: '2xs',
      ui: {
        root: '!rounded-none !bg-[var(--ck-panel)] !text-(--ck-text)'
      }
    },
    ui: {
      root: 'inline-flex items-center gap-2 px-3 py-2',
      wrapper: 'w-auto flex-none',
      description: 'm-0 text-lg font-medium text-(--ck-text)'
    },
    color: 'success'
  })
}

defineExpose<{ show: () => void }>({
  show
})
</script>

<template>
  <slot />
</template>
