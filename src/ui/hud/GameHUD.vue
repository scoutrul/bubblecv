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

    <!-- Achievements Widget -->
    <AchievementsWidget
      :unlocked-count="unlockedAchievementsCount"
      :is-shaking="isAchievementShaking"
      :show-achievements="showAchievementPanel"
      @toggle="toggleAchievementPanel"
      @close="closeAchievementPanel"
    />

    <!-- Bonus Widget -->
    <BonusWidget
      :unlocked-count="unlockedBonusesCount"
      :is-shaking="isBonusShaking"
      :show-bonuses="showBonusPanel"
      @toggle="toggleBonusPanel"
      @close="closeBonusPanel"
    />


  </div>
</template>

<script setup lang="ts">
import { useApp, useUi } from '@/composables/'

import LivesDisplay from '@/ui/hud/LivesDisplay.vue'
import XPDisplay from '@/ui/hud/XPDisplay.vue'
import LevelDisplay from '@/ui/hud/LevelDisplay.vue'
import BonusWidget from '@/ui/bonuses/BonusWidget.vue'
import AchievementsWidget from '@/ui/achievements/AchievementsWidget.vue'
import { useBonuses } from '@/composables/useBonuses'
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
  },
  achievements: {
    unlockedCount: unlockedAchievementsCount,
    toggleAchievements: toggleAchievementPanel,
    closeAchievements: closeAchievementPanel,
    showAchievements: showAchievementPanel,
  }
} = useApp()

const {
    isXPAnimating,
    shakingComponents
  } = useUi()

const {
  unlockedBonusesCount,
  showBonusPanel,
  toggleBonusPanel,
  closeBonusPanel
} = useBonuses()

const isAchievementShaking = computed(() => shakingComponents.value.has('achievements'))
const isBonusShaking = computed(() => shakingComponents.value.has('bonuses'))

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
  pointer-events: auto;
}


</style>
