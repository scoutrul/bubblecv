<template>
  <div class="bubble-canvas-container">
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
const currentYear = ref<number>(GAME_CONFIG.CURRENT_YEAR)
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
  handleMouseMove: simMouseMove,
  handleClick: simClick,
  handleMouseLeave: simMouseLeave
} = useCanvasSimulation(canvasRef)

// Handlers
const handleResize = () => {
  canvasWidth.value = window.innerWidth
  canvasHeight.value = window.innerHeight
  
  if (canvasRef.value) {
    // Обновляем Canvas размеры с учетом DPI
    const dpr = window.devicePixelRatio || 1
    canvasRef.value.width = canvasWidth.value * dpr
    canvasRef.value.height = canvasHeight.value * dpr
    canvasRef.value.style.width = `${canvasWidth.value}px`
    canvasRef.value.style.height = `${canvasHeight.value}px`
    
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }
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
    handleResize()
    
    console.log('Initializing Canvas simulation')
    initSimulation(canvasWidth.value, canvasHeight.value)
    const initialBubbles = bubbleStore.getBubblesByYear(currentYear.value)
    console.log('Initial bubbles for year', currentYear.value, ':', initialBubbles.length)
    updateBubbles(initialBubbles)
  } else {
    console.error('Canvas ref is null')
  }
  
  // Подписываемся на resize
  window.addEventListener('resize', handleResize)
  
  isLoading.value = false
  console.log('BubbleCanvas initialization complete')
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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
}

.timeline {
  @apply absolute bottom-8 left-1/2 transform -translate-x-1/2;
  @apply bg-background-glass backdrop-blur-md rounded-lg p-4;
  @apply border border-border;
  width: min(400px, 90vw);
}
</style>