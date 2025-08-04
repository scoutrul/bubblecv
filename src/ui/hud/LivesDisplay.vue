<template>
  <div class="lives-display">
    <div class="stat-header">
      <span class="stat-title mobile-text-xs">{{ t('hud.lives') }}</span>
      <div class="hearts-container">
        <div 
          v-for="(life, index) in maxLives"
          :key="life"
          class="life-heart"
          :class="{ 
            'life-lost': life > currentLives
          }"
          :ref="el => heartRefs[index] = el as HTMLElement"
        >
          ❤️
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { createHeartbeatAnimation, resetHeartAnimation } from '@/utils'
import { useI18n } from '@/composables'

interface Props {
  currentLives: number
  maxLives: number
}

const props = defineProps<Props>()
const { t } = useI18n()

const heartRefs = ref<HTMLElement[]>([])
let heartbeatAnimation: gsap.core.Timeline | null = null

const startHeartbeatOnLastAlive = () => {
  const lastAliveIndex = props.currentLives - 1
  const el = heartRefs.value[lastAliveIndex]

  if (!el) return

  // Убиваем старую анимацию
  if (heartbeatAnimation) {
    heartbeatAnimation.kill()
  }

  // Сбрасываем все сердца
  heartRefs.value.forEach((ref, i) => {
    if (ref && i !== lastAliveIndex) {
      resetHeartAnimation(ref)
    }
  })

  // Стартуем новую на нужном
  heartbeatAnimation = createHeartbeatAnimation(el)
}

watch(() => props.currentLives, () => {
  startHeartbeatOnLastAlive()
}, { immediate: true })

onMounted(() => {
  startHeartbeatOnLastAlive()
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
  @apply flex items-center gap-2;
}

.stat-title {
  @apply font-semibold text-primary;
}

.hearts-container {
  @apply flex gap-1;
}

.life-heart {
  @apply transition-all duration-300 origin-center;
  @apply text-sm lg:text-base;
}

.life-lost {
  @apply opacity-30 !grayscale;
}

.last-life {
  @apply text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] will-change-transform;
  filter: drop-shadow(0 0 5px rgba(255, 0, 0, 0.7));
}
</style>