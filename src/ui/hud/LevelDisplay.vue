<template>
  <div class="level-display">
    <div
      class="level-info"
      :class="[
        { 'util-shake-hud': isShaking, 'clickable': currentLevel >= 2 },
        levelClass
      ]"
      @click="handleLevelClick"
    >
      <span class="level-title-group">
        <span class="level-icon">{{ levelIcon }}</span>
        <span class="mobile-text-xs whitespace-nowrap">Уровень {{ currentLevel }}</span>
      </span>
      <span class="mobile-text-xs whitespace-nowrap text-primary">{{ levelTitle }}</span>
      <div v-if="currentLevel >= 1" class="level-shine"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createLevelShineAnimation, stopLevelShineAnimation } from '@/utils/animations'
import { useModals } from '@/composables/useModals'
import { computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  currentLevel: number
  levelTitle: string
  isShaking: boolean
  levelIcon: string
}

const props = defineProps<Props>()

const { openLevelUpModal } = useModals()

const handleLevelClick = () => {
  openLevelUpModal(props.currentLevel)
}

// CSS класс для уровня
const levelClass = computed(() => {
  return `level-${props.currentLevel}`
})

// GSAP анимация shine эффекта
watch(() => props.currentLevel, (newLevel) => {
  createLevelShineAnimation(newLevel)
}, { immediate: true })

onMounted(() => {
  createLevelShineAnimation(props.currentLevel)
})

onUnmounted(() => {
  stopLevelShineAnimation()
})

</script>

<style scoped>
.level-display {
  @apply flex-shrink-0 cursor-pointer;
}

.level-info {
  @apply flex items-baseline gap-x-1 sm:gap-x-3 text-right p-1 sm:p-2 rounded-lg transition-all duration-300 relative overflow-hidden;
}

/* Уровень 1 - базовый */
.level-1 {
  @apply bg-transparent;
}

/* Уровень 2 - появляется shine эффект */
.level-2 {
  @apply bg-transparent;
}

/* Уровень 3 - легкий градиент + border */
.level-3 {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

/* Уровень 4 - более яркий градиент + border */
.level-4 {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(196, 181, 253, 0.08) 100%);
  border: 1px solid rgba(168, 85, 247, 0.3);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
}

/* Уровень 5 - золотой градиент + border */
.level-5 {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%);
  border: 1px solid rgba(245, 158, 11, 0.4);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.2);
}

.level-title-group {
  @apply flex items-center gap-1 sm:gap-1.5 font-semibold;
}

.level-icon {
  @apply text-sm sm:text-base;
}

.level-shine {
  @apply absolute inset-0 pointer-events-none;
  background: linear-gradient(
    110deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.2) 40%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0.2) 60%,
    rgba(255, 255, 255, 0.05) 75%,
    transparent 100%
  );
  transform: translateX(-100%);
  width: 100%;
  height: 100%;
}

/* Улучшенный shine эффект для высоких уровней */
.level-4 .level-shine,
.level-5 .level-shine {
  background: linear-gradient(
    110deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.3) 40%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0.3) 60%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 100%
  );
}

/* Дополнительные эффекты для уровня 5 */
.level-5 {
  position: relative;
}

.level-5::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.1) 50%, transparent 70%);
  border-radius: inherit;
  pointer-events: none;
  animation: golden-shimmer 3s ease-in-out infinite;
}

@keyframes golden-shimmer {
  0%, 100% {
    opacity: 0;
    transform: translateX(-100%);
  }
  50% {
    opacity: 1;
    transform: translateX(100%);
  }
}

</style>
