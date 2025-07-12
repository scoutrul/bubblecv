<template>
  <div class="achievement-item unlocked">
    <!-- Левая колонка: иконка -->
    <div class="achievement-icon">
      <span class="text-2xl">{{ achievement.icon }}</span>
    </div>
    
    <!-- Правая колонка: контент -->
    <div class="achievement-content">
      <div class="achievement-header">
        <h4 class="achievement-name">
          {{ achievement.name }}
        </h4>
        <div class="achievement-xp">
          +{{ achievement.xpReward }}
        </div>
      </div>
      <p class="achievement-description">
        {{ achievement.description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Achievement } from '@/types/data'

interface Props {
  achievement: Achievement & { unlockedAt?: string }
}

defineProps<Props>()
</script>

<style scoped>
.achievement-item {
  @apply flex items-start gap-3 p-3 rounded-lg border transition-all duration-200;
}

.achievement-item.unlocked {
  @apply bg-green-50 border-green-200 shadow-sm;
}

.achievement-icon {
  @apply w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0;
  @apply bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md;
}

.achievement-content {
  @apply flex-1 min-w-0;
}

.achievement-header {
  @apply flex items-center gap-2 mb-1;
}

.achievement-name {
  @apply font-semibold text-gray-800 text-sm leading-tight flex-1 min-w-0;
}

.achievement-xp {
  @apply text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-md flex-shrink-0;
  white-space: nowrap;
}

.achievement-description {
  @apply text-xs text-gray-600 leading-relaxed;
}
</style> 