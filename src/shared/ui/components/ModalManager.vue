<template>
  <div>
    <!-- Bubble Modal -->
    <BubbleModal 
      :is-open="modalStore.isBubbleModalOpen"
      :bubble="modalStore.currentBubble"
      @close="modalStore.closeBubbleModal"
      @continue="modalStore.continueBubbleModal"
    />
    
    <!-- Level Up Modal -->
    <LevelUpModal 
      v-if="modalStore.isLevelUpModalOpen"
      :level="modalStore.currentLevel"
      @close="modalStore.closeLevelUpModal"
    />
    
    <!-- Philosophy Question Modal -->
    <PhilosophyModal 
      :is-open="modalStore.isPhilosophyModalOpen"
      :question="modalStore.currentQuestion"
      @close="modalStore.closePhilosophyModal"
      @answer="modalStore.handlePhilosophyAnswer"
    />
    
    <!-- Game Over Modal -->
    <GameOverModal 
      :is-open="modalStore.isGameOverModalOpen"
      :current-x-p="modalStore.gameOverStats?.currentXP || 0"
      :current-level="modalStore.gameOverStats?.currentLevel || 1"
      @close="modalStore.closeGameOverModal"
      @restart="modalStore.restartGame"
    />
  </div>
</template>

<script setup lang="ts">
import { useModalStore } from '@shared/stores/modal-store'
import BubbleModal from './BubbleModal.vue'
import LevelUpModal from './LevelUpModal.vue'
import PhilosophyModal from './PhilosophyModal.vue'
import GameOverModal from './GameOverModal.vue'

const modalStore = useModalStore()
</script> 