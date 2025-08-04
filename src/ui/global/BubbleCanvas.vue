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
import { useCanvas } from '@/composables/useCanvas'
import { useUi, setEventBridge } from '@/composables/useUi'
import { setCanvasBridge } from '@/composables/useModals'
import { onMounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const {
  canvasWidth,
  canvasHeight,
  resetCanvas,
  removeBubble,
  removeBubbleWithEffects,
  findBubbleById,
  createFloatingText
} = useCanvas(canvasRef, containerRef)

const { processShakeQueue } = useUi()

onMounted(() => {
  setEventBridge({
    processShakeQueue,
    resetCanvas
  })
  
  setCanvasBridge({
    removeBubble,
    removeBubbleWithEffects,
    findBubbleById,
    createFloatingText
  })
})
</script>

<style scoped>
.bubble-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bubble-canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: transparent;
}
</style>
