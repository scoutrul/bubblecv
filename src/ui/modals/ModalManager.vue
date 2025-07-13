<template>
  <div>
    <!-- Welcome Modal -->
    <WelcomeModal
      :is-open="modals.welcome"
      :allow-escape-close="true"
      @close="closeWelcome"
    />

    <!-- Philosophy Modal -->
    <PhilosophyModal
      :is-open="modals.philosophy"
      :question="data.currentQuestion"
      :allow-escape-close="false"
      @close="closePhilosophyModal"
      @answer="handlePhilosophyAnswer"
    />

    <!-- Bubble Modal -->
    <BubbleModal
      :is-open="modals.bubble"
      :bubble="data.currentBubble"
      :allow-escape-close="true"
      @close="continueBubbleModal"
    />

    <!-- Game Over Modal -->
    <GameOverModal
      :is-visible="modals.gameOver"
      :stats="data.gameOverStats"
      :allow-escape-close="false"
      @close="closeGameOverModal"
      @restart="restartGame"
    />

    <!-- Level Up Modal -->
    <LevelUpModal
      :is-open="modals.levelUp"
      :level="data.levelUpData.level"
      :title="data.levelUpData.title"
      :description="data.levelUpData.description"
      :icon="data.levelUpData.icon"
      :current-x-p="data.levelUpData.currentXP"
      :xp-gained="data.levelUpData.xpGained"
      :unlocked-features="data.levelUpData.unlockedFeatures"
      :allow-escape-close="false"
      @close="closeLevelUpModal"
    />

    <!-- Achievement Modal -->
    <AchievementModal 
      :is-open="modals.achievement" 
      :achievement="data.achievement"
      :allow-escape-close="false"
      @close="closeAchievementModal"
    />

    <!-- Bonus Modal -->
    <BonusModal 
      :is-open="modals.bonus" 
      :allow-escape-close="true"
      @close="closeBonusModal"
    />
  </div>
</template>

<script setup lang="ts">
import { useModals } from '@/composables/useModals'
import WelcomeModal from './WelcomeModal.vue'
import PhilosophyModal from './PhilosophyModal.vue'
import BubbleModal from './BubbleModal.vue'
import GameOverModal from './GameOverModal.vue'
import LevelUpModal from './LevelUpModal.vue'
import AchievementModal from './AchievementModal.vue'
import BonusModal from './BonusModal.vue'

const {
  modals,
  data,
  closeWelcome,
  closePhilosophyModal,
  handlePhilosophyAnswer,
  continueBubbleModal,
  closeGameOverModal,
  restartGame,
  closeLevelUpModal,
  closeAchievementModal,
  closeBonusModal
} = useModals()
</script>

<style scoped>

</style> 