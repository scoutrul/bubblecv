<template>
  <div class="game-hud">
    <!-- Информация об уровне -->
    <div class="level-info content-card">
      <h3 class="text-lg font-semibold text-gradient-primary">
        Уровень {{ currentLevel }}
      </h3>
      <p class="text-sm text-text-secondary">
        {{ currentLevelTitle }}
      </p>
    </div>
    
    <!-- XP прогресс -->
    <div class="xp-container content-card">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium">Опыт</span>
        <span class="text-sm text-text-secondary">
          {{ currentXP }} / {{ nextLevelXP }}
        </span>
      </div>
      
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: xpPercentage + '%' }"
        >
          <div class="progress-shine" v-if="isXPAnimating"></div>
        </div>
      </div>
    </div>
    
    <!-- Жизни -->
    <div class="lives-container content-card">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">Жизни:</span>
        <div class="flex gap-1">
          <div 
            v-for="life in maxLives"
            :key="life"
            class="life-heart"
            :class="{ 'life-lost': life > currentLives }"
          >
            ❤️
          </div>
        </div>
      </div>
    </div>
    
    <!-- Достижения -->
    <div class="achievements-container content-card">
      <button 
        @click="showAchievements = !showAchievements"
        class="flex items-center gap-2 text-sm font-medium"
      >
        🏆 Достижения
        <span class="text-xs bg-primary rounded-full px-2 py-1">
          {{ unlockedAchievements }}
        </span>
      </button>
    </div>
    
    <!-- Панель достижений -->
    <AchievementsPanel 
      v-if="showAchievements"
      @close="showAchievements = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionStore } from '../../../entities/user-session/model/session-store'
import { useGameStore } from '../../../features/gamification/model/game-store'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import AchievementsPanel from '../../../features/achievements/ui/AchievementsPanel.vue'

// State
const showAchievements = ref(false)
const isXPAnimating = ref(false)

// Stores
const sessionStore = useSessionStore()
const gameStore = useGameStore()

// Computed
const currentLevel = computed(() => sessionStore.currentLevel)
const currentXP = computed(() => sessionStore.currentXP)
const currentLives = computed(() => sessionStore.lives)
const maxLives = computed(() => GAME_CONFIG.MAX_LIVES)

const currentLevelTitle = computed(() => {
  const level = gameStore.getLevelByNumber(currentLevel.value)
  return level?.title || 'Новичок'
})

const nextLevelXP = computed(() => {
  const levels = Object.values(GAME_CONFIG.XP_LEVELS)
  const current = levels[currentLevel.value - 1]
  return current || 100
})

const xpPercentage = computed(() => {
  if (currentLevel.value === 1) {
    return (currentXP.value / nextLevelXP.value) * 100
  }
  
  const prevLevelXP = Object.values(GAME_CONFIG.XP_LEVELS)[currentLevel.value - 2] || 0
  const currentRange = nextLevelXP.value - prevLevelXP
  const currentProgress = currentXP.value - prevLevelXP
  
  return Math.min((currentProgress / currentRange) * 100, 100)
})

const unlockedAchievements = computed(() => {
  return gameStore.achievements.filter(a => a.isUnlocked).length
})

// Methods
const animateXPGain = () => {
  isXPAnimating.value = true
  setTimeout(() => {
    isXPAnimating.value = false
  }, GAME_CONFIG.ANIMATION.XP_GAIN)
}

// Event listeners
sessionStore.$subscribe((mutation, state) => {
  if (mutation.events && Array.isArray(mutation.events) && mutation.events.some(e => e.key === 'currentXP')) {
    animateXPGain()
  }
})
</script>

<style scoped>
.game-hud {
  @apply flex flex-col gap-4 p-6 w-80;
  @apply max-h-screen overflow-y-auto;
}

.level-info {
  @apply text-center;
}

.xp-container {
  @apply w-full;
}

.progress-shine {
  @apply absolute inset-0 animate-shine;
}

.lives-container {
  @apply text-center;
}

.life-heart {
  @apply text-lg transition-all duration-300;
}

.life-lost {
  @apply opacity-30 grayscale;
}

.achievements-container {
  @apply cursor-pointer hover:border-border-light;
  transition: border-color 0.3s ease;
}
</style> 