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
import { setEventBridge } from '@/composables/useUi'
import { setCanvasBridge } from '@/composables/useModals'
import { onMounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const {
  canvasWidth,
  canvasHeight,
  resetCanvas,
  removeBubble,
  updateCanvasBubbles,
  removeBubbleWithEffects,
  findBubbleById,
  createFloatingText
} = useCanvas(canvasRef, containerRef)

onMounted(() => {
  setEventBridge({
    resetCanvas
  })
  
  setCanvasBridge({
    removeBubble,
    removeBubbleWithEffects,
    findBubbleById,
    createFloatingText,
    updateCanvasBubbles
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
