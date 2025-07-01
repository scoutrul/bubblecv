<template>
  <button 
    @click="handleReset"
    class="reset-button"
    title="Сбросить прогресс и начать заново"
  >
    ♻️
  </button>
</template>

<script setup lang="ts">
import { useSessionStore } from '@/app/stores/session.store'

const sessionStore = useSessionStore()

const handleReset = () => {
  sessionStore.resetSession()
}
</script>

<style scoped>
.reset-button {
  @apply fixed bottom-4 left-4;
  @apply w-10 h-10 bg-background-secondary rounded-full;
  @apply flex items-center justify-center;
  @apply text-lg border-2 border-border;
  @apply transition-all duration-200;
  @apply hover:bg-red-500/20 hover:border-red-500/50;
  z-index: 1500;
}
</style> 