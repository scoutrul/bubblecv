<template>
  <button 
    @click="handleReset"
    class="reset-button"
    title="Сбросить игру"
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
</template>

<script setup lang="ts">
import { useSessionStore } from '../../../entities/user-session/model/session-store'

const sessionStore = useSessionStore()

const handleReset = async () => {
  await sessionStore.resetSession()
}
</script>

<style scoped>
.reset-button {
  @apply fixed bottom-4 left-4 z-50;
  @apply w-12 h-12 rounded-full;
  @apply bg-background-glass backdrop-blur-md border border-border;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-all duration-300;
  @apply flex items-center justify-center;
  @apply hover:scale-110 hover:border-primary/50;
  @apply active:scale-95;
}

.reset-button:hover {
  @apply shadow-lg shadow-primary/20;
}

.reset-button svg {
  @apply transition-transform duration-300;
}

.reset-button:hover svg {
  @apply rotate-180;
}
</style> 