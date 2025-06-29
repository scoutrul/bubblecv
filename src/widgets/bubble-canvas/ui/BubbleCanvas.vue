<template>
  <div class="bubble-canvas-container">
    <!-- Canvas холст для отрисовки пузырей -->
    <canvas
      ref="canvasRef"
      class="bubble-canvas"
      @mousemove="handleMouseMove"
      @click="handleClick"
      @mouseleave="handleMouseLeave"
    ></canvas>
    
    <!-- Временная линия -->
    <TimelineSlider 
      v-model:currentYear="currentYear"
      :start-year="startYear"
      :end-year="endYear"
      class="timeline"
    />
    
    <!-- Загрузочный экран -->
    <LoadingSpinner v-if="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useCanvasSimulation } from '../composables/useCanvasSimulation'
import { useBubbleStore } from '../../../entities/bubble/model/bubble-store'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import TimelineSlider from '../../../features/timeline/ui/TimelineSlider.vue'
import LoadingSpinner from '../../../shared/ui/components/LoadingSpinner.vue'

// Refs
const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWidth = ref<number>(window.innerWidth)
const canvasHeight = ref<number>(window.innerHeight)
const currentYear = ref<number>(GAME_CONFIG.RESTART_YEAR)
const isLoading = ref<boolean>(true)

// Данные
const startYear = GAME_CONFIG.START_YEAR
const endYear = GAME_CONFIG.CURRENT_YEAR

// Stores
const bubbleStore = useBubbleStore()

// Canvas Simulation
const { 
  initSimulation, 
  updateBubbles, 
  destroySimulation,
  updateSimulationSize,
  handleMouseMove: simMouseMove,
  handleClick: simClick,
  handleMouseLeave: simMouseLeave
} = useCanvasSimulation(canvasRef)

// Handlers
const handleResize = () => {
  const newWidth = window.innerWidth
  const newHeight = window.innerHeight
  
  console.log('🔄 Ресайз окна:', { 
    от: { width: canvasWidth.value, height: canvasHeight.value },
    к: { width: newWidth, height: newHeight }
  })
  
  canvasWidth.value = newWidth
  canvasHeight.value = newHeight
  
  if (canvasRef.value) {
    const dpr = window.devicePixelRatio || 1
    
    // ВАЖНО: Сначала устанавливаем CSS размеры (визуальные)
    canvasRef.value.style.width = `${newWidth}px`
    canvasRef.value.style.height = `${newHeight}px`
    
    // Затем устанавливаем внутренние размеры Canvas (разрешение буфера)
    // Они должны соответствовать CSS размерам умноженным на DPI
    canvasRef.value.width = newWidth * dpr
    canvasRef.value.height = newHeight * dpr
    
    // Получаем контекст и настраиваем масштабирование
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      // Сбрасываем все трансформации
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      // Масштабируем контекст для компенсации DPI
      // Теперь координаты 1:1 соответствуют CSS пикселям
      ctx.scale(dpr, dpr)
    }
    
    // Обновляем симуляцию с новыми размерами
    updateSimulationSize(newWidth, newHeight)
    console.log('✅ Canvas обновлен:', {
      cssSize: `${newWidth}x${newHeight}`,
      bufferSize: `${newWidth * dpr}x${newHeight * dpr}`,
      dpr
    })
  }
}

const handleMouseMove = (event: MouseEvent) => {
  simMouseMove(event)
}

const handleClick = (event: MouseEvent) => {
  simClick(event)
}

const handleMouseLeave = () => {
  simMouseLeave()
}

const handleGameRestart = () => {
  currentYear.value = GAME_CONFIG.RESTART_YEAR
}

// Watchers
watch(currentYear, (newYear: number) => {
  const filteredBubbles = bubbleStore.getBubblesByYear(newYear)
  updateBubbles(filteredBubbles)
})

// Lifecycle
onMounted(async () => {
  console.log('BubbleCanvas mounted')
  
  // Загружаем данные пузырей
  try {
    await bubbleStore.loadBubbles()
    console.log('Bubbles loaded:', bubbleStore.bubbles.length)
  } catch (error) {
    console.error('Error loading bubbles:', error)
  }
  
  // Настраиваем Canvas
  if (canvasRef.value) {
    // Сначала правильно инициализируем Canvas размеры
    handleResize()
    
    console.log('Initializing Canvas simulation')
    initSimulation(canvasWidth.value, canvasHeight.value)
    const initialBubbles = bubbleStore.getBubblesByYear(currentYear.value)
    console.log('Initial bubbles for year', currentYear.value, ':', initialBubbles.length)
    updateBubbles(initialBubbles)
  } else {
    console.error('Canvas ref is null')
  }
  
  // Подписываемся на resize и restart
  window.addEventListener('resize', handleResize)
  window.addEventListener('game-restart', handleGameRestart)
  
  isLoading.value = false
  console.log('BubbleCanvas initialization complete')
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('game-restart', handleGameRestart)
  destroySimulation()
})
</script>

<style scoped>
.bubble-canvas-container {
  @apply relative w-full h-full;
}

.bubble-canvas {
  @apply absolute inset-0;
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