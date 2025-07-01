<template>
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
      @update:currentYear="emit('update:currentYear', $event)"
      class="timeline"
    />
    
    <!-- Загрузочный экран -->
    <LoadingSpinner v-if="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, watchEffect, nextTick } from 'vue'
import { useCanvasSimulation } from './composables/useCanvasSimulation'
import { useBubbleStore } from '@/app/stores/bubble.store'
import { useSessionStore } from '@/app/stores/session.store'
import TimelineSlider from '@/ui/timeline/TimelineSlider.vue'
import LoadingSpinner from '@/ui/shared/LoadingSpinner.vue'

interface Props {
  currentYear: number
  startYear: number
  endYear: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update:currentYear'])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const bubbleStore = useBubbleStore()
const sessionStore = useSessionStore()
const isLoading = ref<boolean>(true)

// Реактивные размеры канваса
const canvasWidth = ref(0)
const canvasHeight = ref(0)

const getBubblesToRender = () => {
  const regularBubbles = bubbleStore.getBubblesUpToYear(props.currentYear, sessionStore.visitedBubbles)
  const hiddenBubbles = bubbleStore.activeHiddenBubbles
  return [...regularBubbles, ...hiddenBubbles]
}

// Функция для проверки и обновления года
const checkBubblesAndAdvance = () => {
  // Получаем все доступные пузыри до текущего года, исключая скрытые
  const visibleBubbles = getBubblesToRender()
    .filter(bubble => !bubble.bubbleType || bubble.bubbleType !== 'hidden')
  const hasUnpoppedBubbles = visibleBubbles.some(bubble => !bubble.isPopped)

  if (!hasUnpoppedBubbles && props.currentYear < props.endYear) {
    // Ищем следующий год с новыми пузырями
    const nextYearWithBubbles = bubbleStore.findNextYearWithNewBubbles(props.currentYear, sessionStore.visitedBubbles)
    
    if (nextYearWithBubbles !== null) {
      setTimeout(() => {
        emit('update:currentYear', nextYearWithBubbles)
      }, 500)
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
watch(() => props.currentYear, (newYear, oldYear) => {
  if (isLoading.value || !isInitialized.value) return;

  // Если движемся вперед во времени, добавляем новый скрытый пузырь
  if (newYear > oldYear) {
    bubbleStore.addHiddenBubble();
  }

  const filteredBubbles = getBubblesToRender()
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
    emit('update:currentYear', props.startYear)
    
    // Ждем следующего тика, чтобы Vue успел обновить пропсы
    await nextTick()

    // После сброса немедленно проверяем, нужно ли переключить год,
    // так как на стартовом году может не быть пузырей.
    checkBubblesAndAdvance()
  }

  window.addEventListener('game-reset', handleGameReset)

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