<!-- eslint-disable vue/no-setup-props-destructure -->
<template>
  <div class="bubble-canvas-container">
    <canvas v-if="renderer === 'canvas'" ref="canvasRef" class="bubble-canvas"></canvas>
    <svg v-else ref="svgRef" class="bubble-canvas"></svg>
    <LoadingSpinner v-if="!getCurrentRenderer().initialized" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { CanvasRenderer } from '../composables/useCanvasRenderer'
import { SVGRenderer } from '../composables/useSVGRenderer'
import type { Bubble } from '../../../shared/types'
import LoadingSpinner from '../../../shared/ui/components/LoadingSpinner.vue'
import type { BubbleSimulationBase } from '../composables/useBubbleSimulation'
import type { BubbleContinueEvent } from '../composables/types/bubble.types'

const props = defineProps<{
  bubbles: Bubble[]
  renderer?: 'canvas' | 'svg'
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const svgRef = ref<SVGElement | null>(null)
const canvasRenderer = new CanvasRenderer(canvasRef)
const svgRenderer = new SVGRenderer(svgRef)
const currentRenderer = ref<BubbleSimulationBase>(props.renderer === 'canvas' ? canvasRenderer : svgRenderer)
const isInitialized = computed(() => {
  const renderer = props.renderer === 'canvas' ? canvasRenderer : svgRenderer
  return renderer.initialized
})

const getCurrentRenderer = () => props.renderer === 'canvas' ? canvasRenderer : svgRenderer

// Обработка изменения размера окна
const handleResize = () => {
  if (!canvasRef.value && !svgRef.value) return

  const container = (canvasRef.value || svgRef.value)!.parentElement
  if (!container) return

  const { width, height } = container.getBoundingClientRect()
  
  if (canvasRef.value) {
    canvasRef.value.width = width
    canvasRef.value.height = height
  }
  
  if (svgRef.value) {
    svgRef.value.setAttribute('width', width.toString())
    svgRef.value.setAttribute('height', height.toString())
  }

  getCurrentRenderer().initSimulation(width, height)
}

// Обработчик события bubble-continue
const handleBubbleContinue = (event: CustomEvent) => {
  getCurrentRenderer().handleBubbleContinue(event as BubbleContinueEvent)
}

// Инициализация
onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('bubble-continue', handleBubbleContinue)

  // Инициализируем размеры
  handleResize()

  // Инициализируем симуляцию
  if (canvasRef.value || svgRef.value) {
    const container = (canvasRef.value || svgRef.value)!.parentElement
    if (container) {
      const { width, height } = container.getBoundingClientRect()
      getCurrentRenderer().initSimulation(width, height)
      getCurrentRenderer().updateBubbles(props.bubbles)
    }
  }
})

// Очистка
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('bubble-continue', handleBubbleContinue)
  getCurrentRenderer().destroySimulation()
})

// Следим за изменениями пузырей
watch(() => props.bubbles, (newBubbles) => {
  getCurrentRenderer().updateBubbles(newBubbles)
})

// Следим за изменением рендерера
watch(() => props.renderer, () => {
  getCurrentRenderer().destroySimulation()
  
  if (canvasRef.value || svgRef.value) {
    const container = (canvasRef.value || svgRef.value)!.parentElement
    if (container) {
      const { width, height } = container.getBoundingClientRect()
      getCurrentRenderer().initSimulation(width, height)
      getCurrentRenderer().updateBubbles(props.bubbles)
    }
  }
})
</script>

<style scoped>
.bubble-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bubble-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>