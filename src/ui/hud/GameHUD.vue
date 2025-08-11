<template>
  <div class="game-hud">
    <!-- Верхняя панель с адаптивной структурой -->
    <div class="top-panel">
      <!-- Жизни: слева на мобильных и десктопе -->
      <div class="lives-container" v-if="!gameCompleted">
        <LivesDisplay
          :current-lives="currentLives"
          :max-lives="maxLives"
        />
        <!-- Уровень на мобильных справа -->
        <div class="mobile-level">
          <LevelDisplay
            :current-level="currentLevel"
            :level-title="currentLevelTitle"
            :level-icon="currentLevelIcon"
          />
        </div>
      </div>

      <!-- Опыт: внизу на мобильных, по центру на десктопе -->
      <div v-if="!isRetroMode && !gameCompleted" class="xp-container">
        <XPDisplay
          :current-x-p="currentXP"
          :next-level-x-p="nextLevelXP"
          :xp-percentage="xpProgress"
          :is-animating="isXPAnimating"
        />
      </div>

      <!-- Уровень: только на десктопе справа -->
      <div class="desktop-level" v-if="!gameCompleted">
        <LevelDisplay
          :current-level="currentLevel"
          :level-title="currentLevelTitle"
          :level-icon="currentLevelIcon"
        />
      </div>
    </div>

    <!-- Widgets Container -->
    <div class="widgets-container">
      <!-- Achievements Widget -->
      <AchievementsWidget
        :unlocked-count="unlockedAchievementsCount"
        :show-achievements="showAchievementPanel"
        :unlocked-achievements="unlockedAchievements"
        @toggle="toggleAchievementPanel"
        @close="closeAchievementPanel"
      />

      <!-- Bonus Widget -->
      <BonusWidget
        :unlocked-count="unlockedBonusesCount"
        :unlocked-bonuses="unlockedBonuses"
        :show-bonuses="showBonusPanel"
        @toggle="toggleBonusPanel"
        @close="closeBonusPanel"
      />

      <!-- Memoir Widget -->
      <MemoirWidget
        :unlocked-count="unlockedMemoirsCount"
        :show-memoirs="showMemoirsPanel"
        @toggle="toggleMemoirsPanel"
        @close="closeMemoirsPanel"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { useApp, useUi } from '@/composables/'
import LivesDisplay from '@/ui/hud/LivesDisplay.vue'
import XPDisplay from '@/ui/hud/XPDisplay.vue'
import LevelDisplay from '@/ui/hud/LevelDisplay.vue'
import BonusWidget from '@/ui/widgets/bonuses/BonusWidget.vue'
import AchievementsWidget from '@/ui/widgets/achievements/AchievementsWidget.vue'
import MemoirWidget from '@/ui/widgets/memoirs/MemoirWidget.vue'
import { useGameMode } from '@/composables/useGameMode'
import { useSessionStore } from '@/stores/session.store'
import { computed } from 'vue'

const {
  game: {
    currentLevel,
    currentXP,
    currentLives,
    maxLives,
    xpProgress,
    nextLevelXP,
    currentLevelTitle,
    currentLevelIcon,
  },
  achievements: {
    unlockedCount: unlockedAchievementsCount,
    unlockedAchievements,
    showAchievements: showAchievementPanel,
    toggleAchievements: toggleAchievementPanel,
    closeAchievements: closeAchievementPanel
  },
  bonuses: {
    unlockedCount: unlockedBonusesCount,
    unlockedBonuses,
    showBonuses: showBonusPanel,
    toggleBonuses: toggleBonusPanel,
    closeBonuses: closeBonusPanel
  },
  memoirs: {
    unlockedCount: unlockedMemoirsCount,
    showMemoirs: showMemoirsPanel,
    toggleMemoirs: toggleMemoirsPanel,
    closeMemoirs: closeMemoirsPanel
  }
} = useApp()

const { isXPAnimating } = useUi()

const { isRetroMode } = useGameMode()
const session = useSessionStore()
const gameCompleted = computed(() => session.gameCompleted)
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
  @apply p-2 sm:p-4 sm:w-full sm:gap-4;
  z-index: 1000;
  pointer-events: auto;
  justify-content: space-between;
}

.lives-container {
  @apply flex justify-between items-center sm:justify-start sm:order-1;
}

.mobile-level {
  @apply sm:hidden;
}

.xp-container {
  @apply mt-2 sm:mt-0 sm:order-2 sm:flex-1 sm:flex sm:justify-center sm:min-w-0;
}

.desktop-level {
  @apply hidden sm:block sm:order-3;
}

/* Контейнер виджетов */
.widgets-container {
  @apply fixed bottom-4 right-2 sm:right-4;
  @apply flex flex-col gap-4;
  z-index: 9999;
  pointer-events: auto;
}

</style>
