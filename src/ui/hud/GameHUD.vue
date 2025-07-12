<template>
  <div class="game-hud">
    <!-- Верхняя панель с адаптивной структурой -->
    <div class="top-panel p-2 sm:p-4">
      <!-- Жизни и уровень в одну строку на мобильных, по краям на десктопе -->
      <div class="flex justify-between items-center sm:w-full sm:justify-between sm:order-1">
        <!-- Жизни -->
        <div class="sm:order-1">
          <LivesDisplay 
            :current-lives="currentLives"
            :max-lives="maxLives"
            :is-shaking="shakingComponents.has('lives')"
          />
        </div>
        
        <!-- Уровень -->
        <div class="sm:order-3">
          <LevelDisplay 
            :current-level="currentLevel"
            :level-title="currentLevelTitle"
            :is-shaking="shakingComponents.has('level')"
          />
        </div>
      </div>
      
      <!-- Опыт внизу -->
      <div class="mt-2 sm:mt-0 sm:order-2 sm:flex-1 sm:px-8">
        <XPDisplay 
          :current-x-p="currentXP"
          :next-level-x-p="nextLevelXP"
          :xp-percentage="xpProgress"
          :is-animating="isXPAnimating"
          :is-shaking="shakingComponents.has('xp')"
        />
      </div>
    </div>
    
    <!-- Достижения в правом нижнем углу -->
    <div class="achievements-corner">
      <AchievementsToggle 
        :unlocked-count="unlockedCount"
        :is-shaking="shakingComponents.has('achievements')"
        @toggle="toggleAchievements()"
      />
    </div>
    
    <!-- Панель достижений -->
    <AchievementsPanel 
      v-if="showAchievements"
      @close="closeAchievements()"
    />
  </div>
</template>

<script setup lang="ts">
import { useApp, useUi } from '@/composables/'

import LivesDisplay from '@/ui/hud/LivesDisplay.vue'
import XPDisplay from '@/ui/hud/XPDisplay.vue'
import LevelDisplay from '@/ui/hud/LevelDisplay.vue'
import AchievementsToggle from '@/ui/hud/AchievementsToggle.vue'
import AchievementsPanel from '@/ui/achievements/AchievementsPanel.vue'

const {
  game: {
    currentLevel,
    currentXP,
    currentLives,
    maxLives,
    xpProgress,
    nextLevelXP,
    currentLevelTitle,
  },
  achievements: {
    unlockedCount,
    toggleAchievements,
    closeAchievements,
    showAchievements,
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

/* Достижения в правом нижнем углу */
.achievements-corner {
  @apply fixed bottom-4 right-2 sm:right-12;
  @apply pointer-events-auto;
  z-index: 1000;
}
</style> 