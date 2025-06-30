<template>
  <div class="bubble-canvas-container" ref="containerRef">
    <!-- Canvas холст для отрисовки пузырей -->
    <canvas
      ref="canvasRef"
      class="bubble-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousemove="handleMouseMove"
      @click="handleClick"
      @mouseleave="handleMouseLeave"
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
import { ref, onMounted, onUnmounted, watch, watchEffect } from 'vue'
import { useCanvasSimulation } from '../composables/useCanvasSimulation'
import { useBubbleStore } from '../../../entities/bubble/model/bubble-store'
import { useSessionStore } from '../../../entities/user-session/model/session-store'
import TimelineSlider from '../../../features/timeline/ui/TimelineSlider.vue'
import LoadingSpinner from '../../../shared/ui/components/LoadingSpinner.vue'

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

// Функция для проверки и обновления года
const checkBubblesAndAdvance = () => {
  // Используем накопительный метод для получения всех доступных пузырей
  const visibleBubbles = bubbleStore.getBubblesUpToYear(props.currentYear, sessionStore.visitedBubbles)
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
  handleMouseMove: simMouseMove,
  handleClick: simClick,
  handleMouseLeave: simMouseLeave,
  isInitialized
} = useCanvasSimulation(canvasRef, checkBubblesAndAdvance)

// Обработчики событий мыши
const handleMouseMove = (event: MouseEvent) => {
  if (!isLoading.value) {
    simMouseMove(event)
  }
}

const handleClick = (event: MouseEvent) => {
  if (!isLoading.value) {
    simClick(event)
  }
}

const handleMouseLeave = () => {
  if (!isLoading.value) {
    simMouseLeave()
  }
}

// Следим за изменением года
watch(() => props.currentYear, (newYear: number) => {
  if (!isLoading.value) {
    // Используем накопительный метод - показываем все пузыри до текущего года
    const filteredBubbles = bubbleStore.getBubblesUpToYear(newYear, sessionStore.visitedBubbles)
    updateBubbles(filteredBubbles)
  }
})

// Реактивная инициализация при загрузке пузырей
watchEffect(() => {
  // Ждём когда пузыри загрузятся в App.vue
  if (bubbleStore.bubbles.length > 0 && isLoading.value) {
    initializeCanvas()
  }
})

// Функция инициализации canvas
const initializeCanvas = () => {
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        // Обновляем размеры канваса
        canvasWidth.value = width
        canvasHeight.value = height
        
        if (!isInitialized.value) {
          // Первичная инициализация
          initSimulation(width, height)
          // Используем накопительный метод для начальной загрузки
          const initialBubbles = bubbleStore.getBubblesUpToYear(props.currentYear, sessionStore.visitedBubbles)
          updateBubbles(initialBubbles)
          isLoading.value = false
        } else {
          // Просто обновляем размеры без пересоздания симуляции
          updateSimulationSize(width, height)
        }
      }
    }
  })

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }

  onUnmounted(() => {
    resizeObserver.disconnect()
    destroySimulation()
  })
}

// Инициализация и очистка
onMounted(() => {
  isLoading.value = true
  
  // Если пузыри уже загружены, инициализируем сразу
  if (bubbleStore.bubbles.length > 0) {
    initializeCanvas()
  }
  // Иначе ждём через watchEffect
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