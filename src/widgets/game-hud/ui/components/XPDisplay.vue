<template>
  <div class="xp-display">
    <div class="xp-row">
      <div class="xp-info">
        <span class="stat-title">Опыт</span>
        <span class="stat-value">{{ currentXP }} / {{ nextLevelXP }}</span>
      </div>
      
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: xpPercentage + '%' }"
        >
          <div class="progress-shine" v-if="isAnimating"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentXP: number
  nextLevelXP: number
  xpPercentage: number
  isAnimating?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.xp-display {
  @apply flex-1 flex justify-center;
  @apply px-8; /* Отступы от краев */
}

.stat-title {
  @apply text-sm font-semibold text-primary;
}

.stat-value {
  @apply text-xs text-text-secondary;
}

/* Стили для строки опыта */
.xp-row {
  @apply flex items-center gap-4;
}

.xp-info {
  @apply flex items-center gap-2 flex-shrink-0;
}

/* Стили для прогресс-бара опыта */
.progress-bar {
  @apply w-32 h-2 bg-background-secondary rounded-full overflow-hidden;
  @apply relative;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-primary to-secondary rounded-full;
  @apply transition-all duration-500 ease-out;
  @apply relative overflow-hidden;
}

.progress-shine {
  @apply absolute inset-0 animate-shine;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
}
</style> 