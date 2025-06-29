<template>
  <div class="app">
    <!-- Основная сцена с пузырями -->
    <BubbleCanvas class="bubble-scene" />
    
    <!-- HUD интерфейс -->
    <GameHUD class="game-hud" />
    
    <!-- Кнопка сброса -->
    <ResetButton />
    
    <!-- Модальные окна -->
    <ModalManager />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import BubbleCanvas from './widgets/bubble-canvas/ui/BubbleCanvas.vue'
import GameHUD from './widgets/game-hud/ui/GameHUD.vue'
import ModalManager from './shared/ui/components/ModalManager.vue'
import ResetButton from './shared/ui/components/ResetButton.vue'
import { useBubbleStore } from './entities/bubble/model/bubble-store'
import { useSessionStore } from './entities/user-session/model/session-store'

const bubbleStore = useBubbleStore()
const sessionStore = useSessionStore()

onMounted(async () => {
  // Инициализируем сессию ПЕРВЫМ делом
  console.log('🚀 Initializing app...')
  await sessionStore.loadSession()
  console.log('✅ Session loaded:', sessionStore.session)
  
  // Затем загружаем пузыри
  await bubbleStore.loadBubbles()
  console.log('✅ Bubbles loaded:', bubbleStore.bubbles.length)
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