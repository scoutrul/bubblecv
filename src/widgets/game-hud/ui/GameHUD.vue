<template>
  <div class="game-hud">
    <!-- Левая секция: жизни -->
    <div class="left-section">
      <div class="stat-item">
        <div class="stat-header">
          <span class="stat-title">Жизни</span>
          <div class="hearts-container">
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
    </div>
    
    <!-- Центральная секция: опыт -->
    <div class="center-section">
      <div class="stat-item">
        <div class="stat-header">
          <span class="stat-title">Опыт</span>
          <span class="stat-value">{{ currentXP }} / {{ nextLevelXP }}</span>
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
    </div>
    
    <!-- Правая секция: уровень и достижения -->
    <div class="right-section">
      <!-- Информация об уровне -->
      <div class="level-info">
        <h3 class="level-title">Уровень {{ currentLevel }}</h3>
        <p class="level-subtitle">{{ currentLevelTitle }}</p>
      </div>
      
      <!-- Достижения -->
      <div class="achievements-section">
        <button 
          @click="showAchievements = !showAchievements"
          class="achievements-toggle"
        >
          🏆 Достижения
          <span class="achievement-badge">{{ unlockedAchievements }}</span>
        </button>
      </div>
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
const xpPercentage = computed(() => sessionStore.xpProgress)
const nextLevelXP = computed(() => sessionStore.nextLevelXP)

const currentLevelTitle = computed(() => {
  const level = gameStore.getLevelByNumber(currentLevel.value)
  return level?.title || 'Посетитель'
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
  @apply fixed top-0 left-0 right-0 z-10;
  @apply flex justify-between items-start;
  @apply p-4 bg-gradient-to-b from-background-primary/90 to-transparent;
}

/* Левая секция: жизни */
.left-section {
  @apply flex-shrink-0;
}

/* Центральная секция: опыт */
.center-section {
  @apply flex-1 flex justify-center;
  @apply px-8; /* Отступы от краев */
}

/* Правая секция: уровень и достижения */
.right-section {
  @apply flex-shrink-0 flex flex-col items-end gap-2;
}

.stat-item {
  @apply min-w-0; /* Prevent flex overflow */
}

.stat-header {
  @apply flex items-center gap-2;
}

.stat-title {
  @apply text-sm font-semibold text-primary;
}

.stat-value {
  @apply text-xs text-text-secondary;
}

/* Стили для прогресс-бара опыта */
.progress-bar {
  @apply w-48 h-2 bg-background-secondary rounded-full overflow-hidden mt-1;
  @apply relative;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-primary to-secondary rounded-full;
  @apply transition-all duration-500 ease-out;
  @apply relative overflow-hidden;
}

.progress-shine {
  @apply absolute inset-0 animate-shine;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
}

/* Стили для жизней */
.hearts-container {
  @apply flex gap-1;
}

.life-heart {
  @apply text-sm transition-all duration-300;
}

.life-lost {
  @apply opacity-30 grayscale;
}

/* Стили для информации об уровне */
.level-info {
  @apply text-right mb-2;
}

.level-title {
  @apply text-sm font-semibold text-primary;
}

.level-subtitle {
  @apply text-xs text-text-secondary mt-1;
}

/* Стили для достижений */
.achievements-section {
  @apply flex-shrink-0;
}

.achievements-toggle {
  @apply flex items-center gap-2 px-3 py-2;
  @apply bg-background-card hover:bg-background-secondary;
  @apply border border-border hover:border-border-light;
  @apply rounded-lg transition-all duration-200;
  @apply text-sm font-medium;
}

.achievement-badge {
  @apply text-xs bg-primary text-white rounded-full;
  @apply px-2 py-0.5 min-w-[1.25rem] text-center;
}
</style> 