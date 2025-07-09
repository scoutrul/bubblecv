<template>
  <div class="bubble-canvas-wrapper" ref="containerRef">
    <canvas
      ref="canvasRef"
      class="bubble-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBubbleCanvas } from '@/composables/useBubbleCanvas'
import { useUi, setEventBridge } from '@/composables/useUi'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const {
  canvasWidth,
  canvasHeight,
  resetCanvas
} = useBubbleCanvas(canvasRef, containerRef)

const { processShakeQueue } = useUi()

onMounted(() => {
  // Устанавливаем глобальный eventBridge для связи между композициями
  setEventBridge({
    processShakeQueue,
    resetCanvas
  })
})
</script>

<style scoped>
.bubble-canvas-wrapper {
  @apply w-full h-full relative;
}

.bubble-canvas {
  @apply absolute inset-0 w-full h-full;
  background: transparent;
  cursor: default;
  display: block;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>