<template>
  <div class="bubble-canvas-container" ref="containerRef">
    <!-- Canvas холст для отрисовки пузырей -->
    <canvas
      ref="canvasRef"
      class="bubble-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useCanvasSimulation } from '@/composables'
import type { BubbleNode } from '@/types/canvas'
import { useBubbleStore } from '@/stores/bubble.store'
import { useSessionStore } from '@/stores/session.store'

import { getBubblesToRender, findNextYearWithNewBubbles, createHiddenBubble } from '@/utils/nodes'
import { getYearRange } from '@/utils/ui'

// Инициализация канваса с передачей callback

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)


// Функция для проверки и обновления года
const checkBubblesAndAdvance = (currentNodes: BubbleNode[]) => {
  // Проверяем, остались ли на экране "основные" пузыри (обычные или крепкие)
  const hasCoreBubbles = currentNodes.some(
    n => !n.isQuestion && !n.isHidden
  )

  if (!hasCoreBubbles && currentYear.value < yearsRange.value.endYear) {
    // Ищем следующий год с новыми пузырями
    const nextYearWithBubbles = findNextYearWithNewBubbles(bubbleStore.bubbles, currentYear.value, sessionStore.visitedBubbles)
    
    if (nextYearWithBubbles !== null) {
      setTimeout(() => {
        sessionStore.updateCurrentYear(nextYearWithBubbles)
      }, 300)
    }
  }
}

const { 
  initSimulation, 
  updateBubbles, 
  destroySimulation,
  updateSimulationSize,
  isInitialized
} = useCanvasSimulation(canvasRef, checkBubblesAndAdvance)


const bubbleStore = useBubbleStore()
const sessionStore = useSessionStore()

const currentYear = computed(() => sessionStore.currentYear)
const yearsRange = computed(() => getYearRange(bubbleStore.bubbles))

// Реактивные размеры канваса
const canvasWidth = ref(0)
const canvasHeight = ref(0)

// Следим за изменением года
watch(() => currentYear.value, (newYear, oldYear) => {
  if (bubbleStore.isLoading || !isInitialized.value) return

  // Если движемся вперед во времени, добавляем новый скрытый пузырь
  if (newYear > oldYear) {
    createHiddenBubble()
  }

  const filteredBubbles = getBubblesToRender(bubbleStore.bubbles, currentYear.value, sessionStore.visitedBubbles, bubbleStore.activeHiddenBubbles)

  // Проверяем, есть ли в этом году "основные" пузыри (обычные или крепкие)
  const hasCoreBubbles = filteredBubbles.some(b => !b.isQuestion && !b.isHidden)

  // Если основных пузырей нет, ищем следующий год, где они есть
  if (!hasCoreBubbles && newYear < yearsRange.value.endYear) {
    const nextYearWithBubbles = findNextYearWithNewBubbles(bubbleStore.bubbles, newYear, sessionStore.visitedBubbles)
    if (nextYearWithBubbles !== null) {
      // Плавно переключаемся на следующий доступный год
      setTimeout(() => sessionStore.updateCurrentYear(nextYearWithBubbles), 300)
    } else {
      // Если следующих годов с пузырями нет, просто обновляем канвас (он будет пуст)
      updateBubbles(filteredBubbles)
    }
    return
  }
  
  updateBubbles(filteredBubbles)
})


// Реактивная инициализация и обновление
onMounted(() => {

  
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        canvasWidth.value = width
        canvasHeight.value = height
        
        if (!isInitialized.value) {
          initSimulation(width, height)
          const initialBubbles = getBubblesToRender(bubbleStore.bubbles, currentYear.value, sessionStore.visitedBubbles, bubbleStore.activeHiddenBubbles)
          updateBubbles(initialBubbles)
          bubbleStore.isLoading = false
        } else {
          updateSimulationSize(width, height)
        }
      }
    }
  })

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }

  // Обработчик сброса игры
  const handleGameReset = async () => {
    sessionStore.updateCurrentYear(yearsRange.value.startYear)
    
    // Ждем следующего тика, чтобы Vue успел обновить пропсы
    await nextTick()

    checkBubblesAndAdvance([])
  }

  onUnmounted(() => {
    resizeObserver.disconnect()
    destroySimulation()
    window.removeEventListener('game-reset', handleGameReset)
  })
  
})
</script>

<style scoped>
.bubble-canvas-container {
  @apply w-full h-full relative;
}

.bubble-canvas {
  @apply absolute inset-0 w-full h-full;
  background: transparent;
  cursor: default;
  display: block;
  /* Убираем любые возможные искажения */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

</style>