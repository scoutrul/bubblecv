<template>
  <div class="xp-display">
    <div class="xp-row" :class="{ 'util-shake-hud': isShaking }">
      <div class="xp-inline">
        <span class="stat-title mobile-text-xs">Опыт</span>
        <span class="stat-value mobile-text-xs">{{ currentXP }} / {{ nextLevelXP }}</span>
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
  @apply w-full;
}

.xp-row {
  @apply w-full;
}

.xp-inline {
  @apply flex items-center gap-2 sm:gap-3;
}

.stat-title {
  @apply font-semibold text-primary flex-shrink-0;
}

.stat-value {
  @apply text-text-secondary flex-shrink-0;
}

.progress-bar {
  @apply flex-1 bg-background-card rounded-full h-1 sm:h-1.5 min-w-0;
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