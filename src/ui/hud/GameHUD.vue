<template>
  <div class="game-hud">
    <!-- Верхняя панель: жизни, опыт, уровень -->
    <div class="top-panel">
      <!-- Левая секция: жизни -->
      <div class="panel-section justify-start">
        <LivesDisplay 
          :current-lives="currentLives"
          :max-lives="maxLives"
          :is-shaking="shakingComponents.has('lives')"
        />
      </div>
      
      <!-- Центральная секция: опыт -->
      <div class="panel-section center">
        <XPDisplay 
          :current-x-p="currentXP"
          :next-level-x-p="nextLevelXP"
          :xp-percentage="xpProgress"
          :is-animating="isXPAnimating"
          :is-shaking="shakingComponents.has('xp')"
        />
      </div>
      
      <!-- Правая секция: уровень -->
      <div class="panel-section justify-end">
        <LevelDisplay 
          :current-level="currentLevel"
          :level-title="currentLevelTitle"
          :is-shaking="shakingComponents.has('level')"
        />
      </div>
    </div>
    
    <!-- Достижения в нижнем правом углу -->
    <div class="achievements-corner">
      <AchievementsToggle 
        :unlocked-count="unlockedAchievements"
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
import { useGameHUD } from '@/composables/'

import AchievementsPanel from '@/ui/achievements/AchievementsPanel.vue'
import LivesDisplay from './LivesDisplay.vue'
import XPDisplay from './XPDisplay.vue'
import LevelDisplay from './LevelDisplay.vue'
import AchievementsToggle from './AchievementsToggle.vue'

const {
  showAchievements,
  isXPAnimating,
  shakingComponents,
  currentLevel,
  currentXP,
  currentLives,
  maxLives,
  xpProgress,
  nextLevelXP,
  currentLevelTitle,
  unlockedAchievements,
  toggleAchievements,
  closeAchievements
} = useGameHUD()
</script>

<style scoped>
.game-hud {
  @apply relative w-full h-full pointer-events-none;
}

/* Верхняя панель */
.top-panel {
  @apply fixed top-0 left-0 right-0;
  @apply flex justify-between items-center;
  @apply p-4 bg-gradient-to-b from-background-primary/90 to-transparent;
  z-index: 1000;
}

/* Секции панели */
.panel-section {
  @apply flex items-center justify-center;
  @apply min-w-0; /* Предотвращает переполнение */
}

.panel-section.center {
  @apply flex-1 px-8; /* Центральная секция занимает доступное пространство */
}

/* Достижения в углу */
.achievements-corner {
  @apply fixed bottom-4 right-4;
  @apply pointer-events-auto;
  z-index: 1000;
}
</style> 