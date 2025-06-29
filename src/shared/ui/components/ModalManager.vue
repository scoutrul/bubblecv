<template>
  <div>
    <!-- Welcome Modal -->
    <WelcomeModal
      :is-open="modalStore.isWelcomeOpen"
      @close="modalStore.closeWelcome"
    />

    <!-- Philosophy Modal -->
    <PhilosophyModal
      :is-open="modalStore.isPhilosophyModalOpen"
      :question="modalStore.currentQuestion"
      @close="modalStore.closePhilosophyModal"
      @answer="modalStore.handlePhilosophyAnswer"
    />

    <!-- Bubble Modal -->
    <BubbleModal
      :is-open="modalStore.isBubbleModalOpen"
      :bubble="modalStore.currentBubble"
      @close="modalStore.closeBubbleModal"
      @continue="modalStore.continueBubbleModal"
    />

    <!-- Game Over Modal -->
    <GameOverModal
      :is-visible="modalStore.isGameOverModalOpen"
      :stats="modalStore.gameOverStats"
      @close="modalStore.closeGameOverModal"
      @restart="modalStore.restartGame"
    />

    <!-- Level Up Modal -->
    <LevelUpModal
      :is-open="modalStore.isLevelUpModalOpen"
      :level="modalStore.levelUpData.level"
      :title="modalStore.levelUpData.title"
      :description="modalStore.levelUpData.description"
      :icon="modalStore.levelUpData.icon"
      :current-x-p="modalStore.levelUpData.currentXP"
      :xp-gained="modalStore.levelUpData.xpGained"
      :unlocked-features="modalStore.levelUpData.unlockedFeatures"
      @close="modalStore.closeLevelUpModal"
    />
  </div>
</template>

<script setup lang="ts">
import { useModalStore } from '../../stores/modal-store'
import WelcomeModal from './WelcomeModal.vue'
import PhilosophyModal from './PhilosophyModal.vue'
import BubbleModal from './BubbleModal.vue'
import GameOverModal from './GameOverModal.vue'
import LevelUpModal from './LevelUpModal.vue'

const modalStore = useModalStore()
</script> 