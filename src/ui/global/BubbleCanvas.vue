<template>
    <div class="bubble-canvas-wrapper">
      <div class="bubble-canvas-container" ref="containerRef">
        <!-- Canvas холст для отрисовки пузырей -->
        <canvas
          ref="canvasRef"
          class="bubble-canvas"
          :width="canvasWidth"
          :height="canvasHeight"
        ></canvas>
        
        <!-- Временная линия -->
        <TimelineSlider 
          :currentYear="currentYear"
          :start-year="startYear"
          :end-year="endYear"
          @update:currentYear="sessionStore.updateCurrentYear"
          class="timeline"
        />
        
        <!-- Загрузочный экран -->
        <LoadingSpinner v-if="isLoading" />
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useCanvasSimulation } from '@/composables'
import type { BubbleNode } from '@/types/canvas'
import { useBubbleStore } from '@/stores/bubble.store'
import { useSessionStore } from '@/stores/session.store'
import TimelineSlider from '@/ui/timeline/TimelineSlider.vue'
import LoadingSpinner from '@/ui/global/LoadingSpinner.vue'

import { getBubblesUpToYear, findNextYearWithNewBubbles, createHiddenBubble } from '@/utils/nodes'

const { bubbles } = useBubbleStore()
const { currentYear } = useSessionStore()

const years = bubbles.map(b => b.year)

const startYear = Math.min(...years)
const endYear = Math.max(...years)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const bubbleStore = useBubbleStore()
const sessionStore = useSessionStore()
const isLoading = ref<boolean>(true)

// Реактивные размеры канваса
const canvasWidth = ref(0)
const canvasHeight = ref(0)

const getBubblesToRender = () => {
  const regularBubbles = getBubblesUpToYear(bubbleStore.bubbles, currentYear, sessionStore.visitedBubbles)
  const hiddenBubbles = bubbleStore.activeHiddenBubbles
  return [...regularBubbles, ...hiddenBubbles]
}

// Функция для проверки и обновления года
const checkBubblesAndAdvance = (currentNodes: BubbleNode[]) => {
  // Проверяем, остались ли на экране "основные" пузыри (обычные или крепкие)
  const hasCoreBubbles = currentNodes.some(
    n => !n.isQuestion && !n.isHidden
  )

  if (!hasCoreBubbles && currentYear < endYear) {
    // Ищем следующий год с новыми пузырями
    const nextYearWithBubbles = findNextYearWithNewBubbles(bubbleStore.bubbles, currentYear, sessionStore.visitedBubbles)
    
    if (nextYearWithBubbles !== null) {
      setTimeout(() => {
        sessionStore.updateCurrentYear(nextYearWithBubbles)
      }, 300)
    }
  }
}

// Инициализация канваса с передачей callback
const { 
  initSimulation, 
  updateBubbles, 
  destroySimulation,
  updateSimulationSize,
  isInitialized
} = useCanvasSimulation(canvasRef, checkBubblesAndAdvance)

// Следим за изменением года
watch(() => currentYear, (newYear, oldYear) => {
  if (isLoading.value || !isInitialized.value) return

  // Если движемся вперед во времени, добавляем новый скрытый пузырь
  if (newYear > oldYear) {
    createHiddenBubble()
  }

  const filteredBubbles = getBubblesToRender()

  // Проверяем, есть ли в этом году "основные" пузыри (обычные или крепкие)
  const hasCoreBubbles = filteredBubbles.some(b => !b.isQuestion && !b.isHidden)

  // Если основных пузырей нет, ищем следующий год, где они есть
  if (!hasCoreBubbles && newYear < endYear) {
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

// Этот watch исправляет проблему с пустой инициализацией
watch(() => bubbleStore.isLoading, (loading) => {
  // Когда загрузка ЗАКОНЧИЛАСЬ и канвас уже инициализирован
  if (loading === false && isInitialized.value) {
    const bubblesToRender = getBubblesToRender();
    updateBubbles(bubblesToRender);
  }
})

// Реактивная инициализация и обновление
onMounted(() => {
  isLoading.value = true
  
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        canvasWidth.value = width
        canvasHeight.value = height
        
        if (!isInitialized.value) {
          initSimulation(width, height)
          const initialBubbles = getBubblesToRender()
          updateBubbles(initialBubbles)
          isLoading.value = false
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
    sessionStore.updateCurrentYear(startYear)
    
    // Ждем следующего тика, чтобы Vue успел обновить пропсы
    await nextTick()

    checkBubblesAndAdvance([])
  }

  onUnmounted(() => {
    resizeObserver.disconnect()
    destroySimulation()
    window.removeEventListener('game-reset', handleGameReset)
  })
  
  // Если пузыри уже загружены, инициализируем сразу
  if (bubbleStore.bubbles.length > 0) {
    // Canvas будет инициализирован через ResizeObserver
  }
})
</script>

<style scoped>
.bubble-canvas-wrapper {
  @apply w-full h-full relative;
}

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

.timeline {
  @apply absolute bottom-8 left-1/2 transform -translate-x-1/2;
  @apply bg-background-glass backdrop-blur-md rounded-lg p-4;
  @apply border border-border;
  width: min(400px, 90vw);
}
</style>