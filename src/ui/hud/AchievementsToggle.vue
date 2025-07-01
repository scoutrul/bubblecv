<template>
  <div class="achievements-toggle-wrapper">
    <button 
      @click="$emit('toggle')"
      class="achievements-toggle"
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
.achievements-toggle-wrapper {
  position: relative;
}

.achievements-toggle {
  @apply relative w-12 h-12 bg-background-secondary rounded-full;
  @apply flex items-center justify-center;
  @apply text-2xl border-2 border-border;
  @apply transition-all duration-200;
}

.achievements-toggle:hover {
  @apply scale-105 shadow-lg shadow-primary/20;
}

.achievement-badge {
  @apply absolute -top-1 -right-1;
  @apply w-5 h-5 bg-primary rounded-full;
  @apply text-xs font-bold text-white;
  @apply flex items-center justify-center;
  @apply border-2 border-background-secondary;
}
</style> 