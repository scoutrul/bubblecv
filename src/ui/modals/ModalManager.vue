<template>
  <div>
    <!-- Welcome Modal -->
    <WelcomeModal
      :is-open="welcome"
      @close="closeWelcome"
    />

    <!-- Philosophy Modal -->
    <PhilosophyModal
      :is-open="philosophy"
      :question="currentQuestion"
      @close="closePhilosophyModal"
      @answer="handlePhilosophyAnswer"
    />

    <!-- Bubble Modal -->
    <BubbleModal
      :is-open="bubble"
      :bubble="currentBubble"
      @close="continueBubbleModal"
    />

    <!-- Game Over Modal -->
    <GameOverModal
      :is-visible="gameOver"
      :stats="gameOverStats"
      @close="closeGameOverModal"
      @restart="restartGame"
    />

    <!-- Level Up Modal -->
    <LevelUpModal
      :is-open="levelUp"
      :level="levelUpData.level"
      :title="levelUpData.title"
      :description="levelUpData.description"
      :icon="levelUpData.icon"
      :current-x-p="levelUpData.currentXP"
      :xp-gained="levelUpData.xpGained"
      :unlocked-features="levelUpData.unlockedFeatures"
      @close="closeLevelUpModal"
    />

    <!-- Achievement Modal -->
    <AchievementModal 
      :is-open="achievement" 
      @close="closeAchievementModal"
    />
  </div>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal.store'
import WelcomeModal from './WelcomeModal.vue'
import PhilosophyModal from './PhilosophyModal.vue'
import BubbleModal from './BubbleModal.vue'
import GameOverModal from './GameOverModal.vue'
import LevelUpModal from './LevelUpModal.vue'
import AchievementModal from './AchievementModal.vue'

const modalStore = useModalStore()

const { 
  modals: {
    welcome,
    bubble,
    levelUp,
    philosophy,
    gameOver,
    achievement
},
data: {
  currentBubble,
  gameOverStats,
  currentQuestion,
  levelUpData
},
  closeAchievementModal,
  closeLevelUpModal,
  restartGame,
  closeWelcome,
  closePhilosophyModal,
  handlePhilosophyAnswer,
  continueBubbleModal,
  closeGameOverModal

 } = modalStore
</script>

<style scoped>

</style> 