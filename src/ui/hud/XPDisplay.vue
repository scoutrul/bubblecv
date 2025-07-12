<template>
  <div class="xp-display">
    <div class="xp-row" :class="{ 'util-shake-hud': isShaking }">
      <span class="stat-title">Опыт</span>
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: xpPercentage + '%' }"
        >
          <div class="progress-shine" v-if="isAnimating"></div>
        </div>
      </div>
      <span class="stat-value">{{ currentXP }} / {{ nextLevelXP }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentXP: number
  nextLevelXP: number
  xpPercentage: number
  isAnimating?: boolean
  isShaking: boolean
}

defineProps<Props>()
</script>

<style scoped>
.xp-display {
  @apply w-full min-w-0;
}

.xp-row {
  @apply w-full flex items-center gap-2 sm:gap-3 sm:justify-center min-w-0;
}

.stat-title {
  @apply font-semibold text-primary flex-shrink-0;
  @apply text-xs sm:text-sm;
}

.stat-value {
  @apply text-text-secondary flex-shrink-0;
  @apply text-xs sm:text-xs sm:order-2;
}

.progress-bar {
  @apply bg-background-card rounded-full;
  @apply h-2;
  @apply flex-1 sm:order-1;
  min-width: 60px;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-primary to-secondary rounded-full relative;
  transition: width 0.5s ease;
}

.progress-shine {
  @apply absolute inset-0 bg-white opacity-0;
  animation: shine 0.7s ease-out;
}

@keyframes shine {
  0% { opacity: 0.3; width: 0; }
  50% { opacity: 0.3; }
  100% { opacity: 0; width: 100%; }
}
</style> 