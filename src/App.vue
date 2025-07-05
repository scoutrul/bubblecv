<template>
  <div class="app">
    <!-- HUD интерфейс -->
    <GameHUD class="game-hud" />

    <!-- Основная сцена с пузырями -->
    <BubbleCanvas class="bubble-scene" />
    
    <!-- Кнопка сброса -->
    <ResetButton />
    
    <!-- Модальные окна -->
    <ModalManager />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import BubbleCanvas from '@/ui/global/BubbleCanvas.vue'
import ModalManager from '@/ui/modals/ModalManager.vue'
import GameHUD from '@/ui/hud/GameHUD.vue'
import ResetButton from '@/ui/global/ResetButton.vue'
import { useSessionStore } from '@/stores/session.store'
import { useBubbleStore } from '@/stores/bubble.store'

const sessionStore = useSessionStore()

const bubbleStore = useBubbleStore()

onMounted(async () => {
  await bubbleStore.loadBubbles() 
  
  await sessionStore.resetSession()
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