<template>
  <div class="fixed bottom-4 left-4 z-50 group">
    <button 
      @click="handleReset"
      class="reset-button"
      title="Сбросить прогресс и начать заново"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
      </svg>
    </button>
    <div 
      class="absolute bottom-0 left-full ml-4 px-3 py-1.5 bg-background-secondary border border-border rounded-lg shadow-lg text-sm text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    >
      Сбросить игру
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '@/stores/session.store'

const sessionStore = useSessionStore()

const handleReset = () => {
  sessionStore.resetSession()
}
</script>

<style scoped>
.reset-button {
  @apply w-12 h-12 rounded-full;
  @apply flex items-center justify-center;
  @apply bg-background-glass backdrop-blur-md border border-border;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-all duration-300;
  @apply hover:scale-110;
  @apply active:scale-95;
}

.reset-button:hover {
  @apply shadow-xl shadow-primary/30;
}

.reset-button svg {
  @apply transition-transform duration-300;
}

.reset-button:hover svg {
  @apply rotate-180;
}
</style> 