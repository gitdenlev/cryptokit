<script setup lang="ts">
const { isPanic } = usePanicShortcut();
</script>

<template>
  <div
    class="flex h-screen"
    :class="{
      'panic-blur': isPanic,
    }"
  >
    <Sidebar />

    <main class="p-8 flex-1 overflow-y-auto bg-transparent w-full">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.panic-blur {
  filter: blur(20px);
  transition: filter 0.4s ease-in-out;
  pointer-events: none;
  user-select: none;
}
</style>
