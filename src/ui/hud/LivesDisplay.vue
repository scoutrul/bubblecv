<template>
  <div class="lives-display" :class="{ 'util-shake-hud': isShaking }">
    <div class="stat-header">
      <span class="stat-title mobile-text-xs">Жизни</span>
      <div class="hearts-container">
        <div 
          v-for="life in maxLives"
          :key="life"
          class="life-heart"
          :class="{ 
            'life-lost': life > currentLives,
            'last-life': currentLives === 1 && life === 1
          }"
          :ref="life === 1 ? 'lastHeart' : undefined"
        >
          ❤️
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { createHeartbeatAnimation, resetHeartAnimation } from '@/utils/animations'

interface Props {
  currentLives: number
  maxLives: number
  isShaking: boolean
}

const props = defineProps<Props>()
const lastHeart = ref<HTMLElement | null>(null)
let heartbeatAnimation: gsap.core.Timeline | null = null

const startHeartbeatAnimation = () => {
  if (!lastHeart.value) return
  
  // Останавливаем предыдущую анимацию, если она есть
  if (heartbeatAnimation) {
    heartbeatAnimation.kill()
  }

  // Создаем новую анимацию биения сердца
  heartbeatAnimation = createHeartbeatAnimation(lastHeart.value)
}

// Следим за изменением количества жизней
watch(() => props.currentLives, (newLives) => {
  if (newLives === 1) {
    startHeartbeatAnimation()
  } else if (heartbeatAnimation) {
    heartbeatAnimation.kill()
    if (lastHeart.value) {
      resetHeartAnimation(lastHeart.value)
    }
  }
}, { immediate: true })

onMounted(() => {
  if (props.currentLives === 1) {
    startHeartbeatAnimation()
  }
})

onUnmounted(() => {
  if (heartbeatAnimation) {
    heartbeatAnimation.kill()
  }
})
</script>

<style scoped>
.lives-display {
  @apply flex-shrink-0;
}

.stat-header {
  @apply flex items-center gap-2 sm:gap-2;
}

.stat-title {
  @apply font-semibold text-primary;
}

/* Стили для жизней */
.hearts-container {
  @apply flex;
}

.life-heart {
  @apply text-xs sm:text-sm transition-all duration-300 origin-center;
}

.life-lost {
  @apply opacity-30 grayscale;
}

.last-life {
  @apply text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] will-change-transform;
  filter: drop-shadow(0 0 5px rgba(255, 0, 0, 0.7));
}
</style> 