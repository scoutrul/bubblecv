<template>
  <div class="achievements-corner">
    <button 
      @click="$emit('toggle')"
      class="achievements-toggle w-8 h-8 sm:w-12 sm:h-12"
      :class="{ 'util-shake-hud': isShaking }"
    >
      🏆
      <span class="achievement-badge">{{ unlockedCount }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  unlockedCount: number
  isShaking: boolean
}

interface Emits {
  (e: 'toggle'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.achievements-corner {
  @apply fixed bottom-4 right-2 sm:right-4 z-50;
}

.achievements-toggle {
  @apply bg-background-secondary rounded-full;
  @apply flex items-center justify-center;
  @apply text-lg sm:text-2xl border border-border;
  @apply transition-all duration-200;
}

.achievements-toggle:hover {
  @apply scale-105 shadow-lg shadow-primary/20;
}

.achievement-badge {
  @apply absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1;
  @apply w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full;
  @apply text-xs font-bold text-white;
  @apply flex items-center justify-center;
  @apply border border-background-secondary sm:border-2;
}
</style> 