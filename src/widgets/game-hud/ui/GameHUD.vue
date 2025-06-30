<template>
  <div class="game-hud">
    <!-- Верхняя панель: жизни, опыт, уровень -->
    <div class="top-panel">
      <!-- Левая секция: жизни -->
      <div class="panel-section">
        <LivesDisplay 
          :current-lives="currentLives"
          :max-lives="maxLives"
        />
      </div>
      
      <!-- Центральная секция: опыт -->
      <div class="panel-section center">
        <XPDisplay 
          :current-x-p="currentXP"
          :next-level-x-p="nextLevelXP"
          :xp-percentage="xpProgress"
          :is-animating="isXPAnimating"
        />
      </div>
      
      <!-- Правая секция: уровень -->
      <div class="panel-section">
        <LevelDisplay 
          :current-level="currentLevel"
          :level-title="currentLevelTitle"
        />
      </div>
    </div>
    
    <!-- Достижения в нижнем правом углу -->
    <div class="achievements-corner">
      <AchievementsToggle 
        :unlocked-count="unlockedAchievements"
        @toggle="showAchievements = !showAchievements"
      />
    </div>
    
    <!-- Панель достижений -->
    <AchievementsPanel 
      v-if="showAchievements"
      @close="showAchievements = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSessionStore } from '@entities/user-session/model/session-store'
import { useGameStore } from '@features/gamification/model/game-store'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import AchievementsPanel from '../../../features/achievements/ui/AchievementsPanel.vue'
import LivesDisplay from './components/LivesDisplay.vue'
import XPDisplay from './components/XPDisplay.vue'
import LevelDisplay from './components/LevelDisplay.vue'
import AchievementsToggle from './components/AchievementsToggle.vue'

// State
const showAchievements = ref(false)
const isXPAnimating = ref(false)

// Stores
const sessionStore = useSessionStore()
const gameStore = useGameStore()

// Computed
const currentLevel = computed(() => {
  const level = sessionStore.currentLevel
  return level
})

const currentXP = computed(() => {
  const xp = sessionStore.currentXP
  return xp
})

const currentLives = computed(() => sessionStore.lives)
const maxLives = computed(() => GAME_CONFIG.maxLives)

const xpProgress = computed(() => sessionStore.xpProgress)

const nextLevelXP = computed(() => {
  const nextXP = sessionStore.nextLevelXP
  return nextXP
})

const currentLevelTitle = computed(() => {
  const level = gameStore.getLevelByNumber(currentLevel.value)
  return level?.title || 'Посетитель'
})

const unlockedAchievements = computed(() => {
  return gameStore.achievements.filter(a => a.isUnlocked).length
})

const xpToDisplay = ref(currentXP.value)

// Methods
const animateXPGain = () => {
  isXPAnimating.value = true
  setTimeout(() => {
    isXPAnimating.value = false
  }, GAME_CONFIG.animation.xpGain)
}

// Watch for XP changes to trigger animation
watch(() => sessionStore.currentXP, (newXP, oldXP) => {
  if (newXP > oldXP) {
    animateXPGain()
  }
}, { immediate: false })
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
  @apply pointer-events-auto;
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