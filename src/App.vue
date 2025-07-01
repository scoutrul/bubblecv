<template>
  <div class="app">
    <!-- Основная сцена с пузырями -->
    <BubbleCanvasContainer class="bubble-scene" />
    
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
import BubbleCanvasContainer from './widgets/bubble-canvas/ui/BubbleCanvasContainer.vue'
import GameHUD from './widgets/game-hud/ui/GameHUD.vue'
import ModalManager from './shared/ui/components/ModalManager.vue'
import ResetButton from './shared/ui/components/ResetButton.vue'
import { useSessionStore } from '@/app/stores/session.store'
import { useGameStore } from '@/app/stores/game.store'
import { useModalStore } from '@/app/stores/modal.store'
import { useBubbleStore } from '@/app/stores/bubble.store'

const sessionStore = useSessionStore()
const bubbleStore = useBubbleStore()
const modalStore = useModalStore()

// Функция для проверки и инициализации базы данных
const initializeDatabase = async () => {
  try {
    await bubbleStore.loadBubbles() 
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error)
  }
}

onMounted(async () => {
  // Инициализируем базу данных и сессию
  await initializeDatabase()
  
  // Создаем новую сессию для каждой вкладки
  await sessionStore.loadSession()
  
  // Всегда показываем приветственную модалку в новой вкладке
  setTimeout(() => {
    modalStore.openWelcome()
  }, 500)
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