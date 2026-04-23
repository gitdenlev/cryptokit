<template>
  <div class="flex h-screen">
    <Sidebar />

    <main class="p-8 flex-1 overflow-y-auto bg-transparent w-full">
      <slot />
    </main>
  </div>
</template>
