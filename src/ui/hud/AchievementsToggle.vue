<template>
  <div class="achievements-corner">
    <div class="button-container">
      <button 
        ref="achievementsButton"
        @click="$emit('toggle')"
        class="achievements-toggle"
        :class="{ 'util-shake-hud': isShaking }"
      >
        🏆
      </button>
      <div class="shine-overlay" v-if="unlockedCount > 0"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { createShineAnimation, stopShineAnimation } from '@/utils/animations'

interface Props {
  unlockedCount: number
  isShaking: boolean
}

interface Emits {
  (e: 'toggle'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const achievementsButton = ref<HTMLElement | null>(null)
let shineAnimationActive = false

// Создаем анимацию с рандомной задержкой для каждого блока
const startShineAnimation = () => {
  if (props.unlockedCount > 0 && !shineAnimationActive) {
    // Рандомная задержка от 0 до 3 секунд для каждого блока
    const randomDelay = Math.random() * 3000
    
    setTimeout(() => {
      if (props.unlockedCount > 0) {
        createShineAnimation('.achievements-toggle .shine-overlay', {
          duration: 1.5,
          repeatDelay: 4 + Math.random() * 2, // Случайная задержка между повторами
          ease: 'power2.out'
        })
        shineAnimationActive = true
      }
    }, randomDelay)
  }
}

const stopShineAnimationIfNeeded = () => {
  if (shineAnimationActive) {
    stopShineAnimation('.achievements-toggle .shine-overlay')
    shineAnimationActive = false
  }
}

watch(() => props.unlockedCount, (newCount) => {
  if (newCount > 0) {
    startShineAnimation()
  } else {
    stopShineAnimationIfNeeded()
  }
})

onMounted(() => {
  if (props.unlockedCount > 0) {
    startShineAnimation()
  }
})

onUnmounted(() => {
  stopShineAnimationIfNeeded()
})
</script>

<style scoped>
.achievements-corner {
  @apply relative;
}

.button-container {
  @apply relative overflow-hidden rounded-full;
}

.achievements-toggle {
  @apply bg-background-secondary rounded-full;
  @apply flex items-center justify-center;
  @apply text-lg sm:text-2xl border-[0.5px] border-border;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-all duration-300;
  @apply hover:scale-110;
  @apply active:scale-95;
  @apply relative;
  @apply w-8 h-8 sm:w-12 sm:h-12 rounded-full;
}

.achievements-toggle:hover {
  @apply shadow-xl shadow-primary/30;
}

.shine-overlay {
  @apply absolute inset-0 rounded-full;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  transform: translateX(-150%) skewX(-15deg);
  width: 200%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}
</style> 