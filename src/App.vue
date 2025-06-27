<template>
  <div class="app">
    <!-- Основная сцена с пузырями -->
    <BubbleCanvas class="bubble-scene" />
    
    <!-- HUD интерфейс -->
    <GameHUD class="game-hud" />
    
    <!-- Модальные окна -->
    <ModalManager />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import BubbleCanvas from './widgets/bubble-canvas/ui/BubbleCanvas.vue'
import GameHUD from './widgets/game-hud/ui/GameHUD.vue'
import ModalManager from './shared/ui/components/ModalManager.vue'
import { useBubbleStore } from './entities/bubble/model/bubble-store'

const bubbleStore = useBubbleStore()

onMounted(async () => {
  await bubbleStore.loadBubbles()
})
</script>

<style scoped>
.app {
  @apply h-full w-full relative overflow-hidden;
  background: radial-gradient(ellipse at center, #1a1b23 0%, #0a0b0f 100%);
}

.bubble-scene {
  @apply absolute inset-0;
}

.game-hud {
  @apply absolute top-0 right-0 z-10;
}
</style> 