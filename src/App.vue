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
import { useSessionStore } from './entities/user-session/model/session-store'
import { useBubbleStore } from './entities/bubble/model/bubble-store'

const sessionStore = useSessionStore()
const bubbleStore = useBubbleStore()

// Функция для проверки и инициализации базы данных
const initializeDatabase = async () => {
  try {
    // Проверяем наличие пузырей
    const response = await fetch('http://localhost:3003/api/bubbles')
    const data = await response.json()
    
    if (!data.success || !data.data || data.data.length === 0) {
      console.log('🔄 Инициализируем базу данных...')
      // Если пузырей нет, запускаем seed
      const seedResponse = await fetch('http://localhost:3003/api/seed', {
        method: 'POST'
      })
      const seedData = await seedResponse.json()
      
      if (!seedData.success) {
        throw new Error('Failed to seed database')
      }
      console.log('✅ База данных инициализирована:', seedData.data)
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error)
  }
}

onMounted(async () => {
  // Инициализируем сессию и базу данных
  console.log('🚀 Initializing app...')
  await initializeDatabase()
  await sessionStore.loadSession()
  await bubbleStore.loadBubbles()
  console.log('✅ App initialized')
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