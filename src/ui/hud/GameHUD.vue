<template>
  <div class="game-hud">
    <!-- Верхняя панель с адаптивной структурой -->
    <div class="top-panel p-2 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:w-full sm:gap-4">
      <!-- Жизни: слева на мобильных и десктопе -->
      <div class="flex justify-between items-center sm:justify-start sm:order-1">
        <LivesDisplay 
          :current-lives="currentLives"
          :max-lives="maxLives"
          :is-shaking="shakingComponents.has('lives')"
        />
        <!-- Уровень на мобильных справа -->
        <div class="sm:hidden">
          <LevelDisplay 
            :current-level="currentLevel"
            :level-title="currentLevelTitle"
            :is-shaking="shakingComponents.has('level')"
          />
        </div>
      </div>
      
      <!-- Опыт: внизу на мобильных, по центру на десктопе -->
      <div class="mt-2 sm:mt-0 sm:order-2 sm:flex-1 sm:flex sm:justify-center sm:min-w-0">
        <XPDisplay 
          :current-x-p="currentXP"
          :next-level-x-p="nextLevelXP"
          :xp-percentage="xpProgress"
          :is-animating="isXPAnimating"
          :is-shaking="shakingComponents.has('xp')"
        />
      </div>
      
      <!-- Уровень: только на десктопе справа -->
      <div class="hidden sm:block sm:order-3">
        <LevelDisplay 
          :current-level="currentLevel"
          :level-title="currentLevelTitle"
          :is-shaking="shakingComponents.has('level')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApp, useUi } from '@/composables/'

import LivesDisplay from '@/ui/hud/LivesDisplay.vue'
import XPDisplay from '@/ui/hud/XPDisplay.vue'
import LevelDisplay from '@/ui/hud/LevelDisplay.vue'

const {
  game: {
    currentLevel,
    currentXP,
    currentLives,
    maxLives,
    xpProgress,
    nextLevelXP,
    currentLevelTitle,
  }
} = useApp()

const {   
    isXPAnimating,
    shakingComponents
  } = useUi()
  
</script>

<style scoped>
.game-hud {
  @apply relative w-full h-full pointer-events-none;
}

/* Верхняя панель */
.top-panel {
  @apply fixed top-0 left-0 right-0;
  @apply bg-gradient-to-b from-background-primary/90 to-transparent;
  @apply flex flex-col sm:flex-row sm:items-center;
  z-index: 1000;
}
</style> 