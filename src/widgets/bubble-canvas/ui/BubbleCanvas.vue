<template>
  <div class="bubble-canvas-container">
    <!-- SVG холст для D3.js -->
    <svg
      ref="svgRef"
      class="bubble-svg"
      :width="canvasWidth"
      :height="canvasHeight"
    ></svg>
    
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
import { useD3Simulation } from '../composables/useD3Simulation'
import { useBubbleStore } from '@entities/bubble/model/bubble-store'
import { GAME_CONFIG } from '@shared/config/game-config'
import TimelineSlider from '@features/timeline/ui/TimelineSlider.vue'
import LoadingSpinner from '@shared/ui/components/LoadingSpinner.vue'

// Refs
const svgRef = ref<SVGElement | null>(null)
const canvasWidth = ref(window.innerWidth)
const canvasHeight = ref(window.innerHeight)
const currentYear = ref(GAME_CONFIG.CURRENT_YEAR)
const isLoading = ref(true)

// Данные
const startYear = GAME_CONFIG.START_YEAR
const endYear = GAME_CONFIG.CURRENT_YEAR

// Stores
const bubbleStore = useBubbleStore()

// D3 Simulation
const { initSimulation, updateBubbles, destroySimulation } = useD3Simulation(svgRef)

// Handlers
const handleResize = () => {
  canvasWidth.value = window.innerWidth
  canvasHeight.value = window.innerHeight
}

// Watchers
watch(currentYear, (newYear) => {
  const filteredBubbles = bubbleStore.getBubblesByYear(newYear)
  updateBubbles(filteredBubbles)
})

// Lifecycle
onMounted(async () => {
  // Загружаем данные пузырей
  await bubbleStore.loadBubbles()
  
  // Инициализируем D3 симуляцию
  if (svgRef.value) {
    initSimulation(canvasWidth.value, canvasHeight.value)
    const initialBubbles = bubbleStore.getBubblesByYear(currentYear.value)
    updateBubbles(initialBubbles)
  }
  
  // Подписываемся на resize
  window.addEventListener('resize', handleResize)
  
  isLoading.value = false
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

.bubble-svg {
  @apply absolute inset-0;
  background: transparent;
}

.timeline {
  @apply absolute bottom-8 left-1/2 transform -translate-x-1/2;
  @apply bg-background-glass backdrop-blur-md rounded-lg p-4;
  @apply border border-border;
  min-width: 400px;
}
</style>