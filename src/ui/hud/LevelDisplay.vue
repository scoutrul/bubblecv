<template>
  <div class="level-display">
    <div
      class="level-info"
      :class="[{ 'util-shake-hud': isShaking, 'clickable': currentLevel >= 2 }]"
      @click="handleLevelClick"
    >
      <span class="level-title-group">
        <span class="level-icon">{{ levelIcon }}</span>
        <span class="mobile-text-xs whitespace-nowrap">Уровень {{ currentLevel }}</span>
      </span>
      <span class="mobile-text-xs whitespace-nowrap">{{ levelTitle }}</span>
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

// GSAP анимация shine эффекта
watch(() => props.currentLevel, (newLevel) => {
  stopLevelShineAnimation()
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

</style>
