<template>
  <div>
    <!-- Welcome Modal -->
    <WelcomeModal
      v-if="showWelcome"
      v-bind="welcomeProps"
      @close="closeWelcome"
    />

    <!-- Philosophy Modal -->
    <PhilosophyModal
      v-if="showPhilosophy"
      v-bind="philosophyProps"
      @close="closePhilosophyModal"
      @answer="handlePhilosophyAnswer"
    />

    <!-- Bubble Modal -->
    <BubbleModal
      v-if="showBubble"
      v-bind="bubbleProps"
      @close="continueBubbleModal"
    />

    <!-- Game Over Modal -->
    <GameOverModal
      v-if="showGameOver"
      v-bind="gameOverProps"
      @close="closeGameOverModal"
      @restart="restartGame"
    />

    <!-- Level Up Modal -->
    <LevelUpModal
      v-if="showLevelUp"
      v-bind="levelUpProps"
      @close="closeLevelUpModal"
    />

    <!-- Achievement Modal -->
    <AchievementModal 
      v-if="showAchievement"
      v-bind="achievementProps"
      @close="closeAchievementModal"
    />

    <!-- Bonus Modal -->
    <BonusModal 
      v-if="showBonus"
      v-bind="bonusProps"
      @close="closeBonusModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useModalStore } from '@/stores'
import { useModals } from '@/composables/useModals'
import WelcomeModal from './WelcomeModal.vue'
import PhilosophyModal from './PhilosophyModal.vue'
import BubbleModal from './BubbleModal.vue'
import GameOverModal from './GameOverModal.vue'
import LevelUpModal from './LevelUpModal.vue'
import AchievementModal from './AchievementModal.vue'
import BonusModal from './BonusModal.vue'

const modalStore = useModalStore()
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

const currentModal = computed(() => modalStore.currentModal)

// Type-safe accessors
const safeModals = computed(() => (modals as any).value || {} as any)
const safeData = computed(() => (data as any).value || {} as any)

// Welcome Modal
const showWelcome = computed(() => {
  return currentModal.value?.type === 'welcome' || safeModals.value.welcome || false
})
const welcomeProps = computed(() => ({
  isOpen: true,
  allowEscapeClose: true
}))

// Philosophy Modal
const showPhilosophy = computed(() => {
  return currentModal.value?.type === 'philosophy' || safeModals.value.philosophy || false
})
const philosophyProps = computed(() => ({
  isOpen: true,
  question: safeData.value.currentQuestion || null,
  allowEscapeClose: false
}))

// Bubble Modal
const showBubble = computed(() => {
  return currentModal.value?.type === 'bubble' || safeModals.value.bubble || false
})
const bubbleProps = computed(() => ({
  isOpen: true,
  bubble: safeData.value.currentBubble || null,
  allowEscapeClose: true
}))

// Game Over Modal
const showGameOver = computed(() => {
  return currentModal.value?.type === 'gameOver' || safeModals.value.gameOver || false
})
const gameOverProps = computed(() => ({
  isVisible: true,
  stats: safeData.value.gameOverStats || null,
  allowEscapeClose: false
}))

// Level Up Modal
const showLevelUp = computed(() => {
  return (currentModal.value?.type === 'levelUp' && safeData.value.levelUpData) || 
    safeModals.value.levelUp || false
})
const levelUpProps = computed(() => ({
  isOpen: true,
  level: safeData.value.levelUpData?.level || 1,
  title: safeData.value.levelUpData?.title || 'Новый уровень',
  description: safeData.value.levelUpData?.description || 'Поздравляем с достижением!',
  icon: safeData.value.levelUpData?.icon || '⭐',
  currentXP: safeData.value.levelUpData?.currentXP || 0,
  xpGained: safeData.value.levelUpData?.xpGained || 0,
  unlockedFeatures: safeData.value.levelUpData?.unlockedFeatures || [],
  allowEscapeClose: false
}))

// Achievement Modal
const showAchievement = computed(() => {
  return currentModal.value?.type === 'achievement' || safeModals.value.achievement || false
})
const achievementProps = computed(() => ({
  isOpen: true,
  achievement: safeData.value.achievement || null,
  allowEscapeClose: false
}))

// Bonus Modal
const showBonus = computed(() => {
  return currentModal.value?.type === 'bonus' || safeModals.value.bonus || false
})
const bonusProps = computed(() => ({
  isOpen: true,
  allowEscapeClose: true
}))
</script>

<style scoped>

</style> 