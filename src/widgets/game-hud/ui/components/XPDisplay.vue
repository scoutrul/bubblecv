<template>
  <div class="xp-display">
    <div class="xp-row" :class="{ 'util-shake-hud': isShaking }">
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
  isShaking: boolean
}

defineProps<Props>()
</script>

<style scoped>
.xp-display {
  @apply flex-1 flex justify-center px-4;
}

.xp-row {
  @apply w-full max-w-sm;
}

.xp-info {
  @apply flex justify-between items-baseline mb-1;
}

.stat-title {
  @apply text-sm font-semibold text-primary;
}

.stat-value {
  @apply text-xs text-text-secondary;
}

.progress-bar {
  @apply w-full bg-background-card rounded-full h-1.5;
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