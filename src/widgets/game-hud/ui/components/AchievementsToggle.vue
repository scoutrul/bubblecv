<template>
  <div class="achievements-toggle-wrapper">
    <button 
      @click="$emit('toggle')"
      class="achievements-toggle"
    >
      🏆
      <span class="achievement-badge">{{ unlockedCount }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  unlockedCount: number
}

interface Emits {
  toggle: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.achievements-toggle-wrapper {
  @apply flex-shrink-0;
}

.achievements-toggle {
  @apply flex items-center gap-2 px-3 py-2;
  @apply bg-background-card hover:bg-background-secondary;
  @apply border border-border hover:border-border-light;
  @apply rounded-lg transition-all duration-200;
  @apply text-sm font-medium;
}

.achievement-badge {
  @apply text-xs bg-primary text-white rounded-full;
  @apply px-2 py-0.5 min-w-[1.25rem] text-center;
}
</style> 