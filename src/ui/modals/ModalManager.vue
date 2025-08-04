<template>
  <div>
    <!-- Welcome Modal -->
    <WelcomeModal
      v-if="showWelcome || modalStore.isModalClosing('welcome')"
      v-bind="welcomeProps"
      @close="() => { startClosingModal('welcome'); closeWelcome(); }"
    />

    <!-- Philosophy Modal -->
    <PhilosophyModal
      v-if="showPhilosophy || modalStore.isModalClosing('philosophy')"
      v-bind="philosophyProps"
      @answer="handlePhilosophyAnswer"
      @customAnswer="handlePhilosophyCustomAnswer"
      @close="() => { startClosingModal('philosophy'); }"
    />

    <!-- Bubble Modal -->
    <BubbleModal
      v-if="showBubble || modalStore.isModalClosing('bubble')"
      v-bind="bubbleProps"
      @close="() => { startClosingModal('bubble'); continueBubbleModal(); }"
    />

    <!-- Game Over Modal -->
    <GameOverModal
      v-if="showGameOver || modalStore.isModalClosing('gameOver')"
      v-bind="gameOverProps"
      @close="() => { startClosingModal('gameOver'); closeGameOverModal(); }"
      @restart="restartGame"
    />

    <!-- Level Up Modal -->
    <LevelUpModal
      v-if="showLevelUp || modalStore.isModalClosing('levelUp')"
      v-bind="levelUpProps"
      @close="() => { startClosingModal('levelUp'); closeLevelUpModal(); }"
    />

    <!-- Achievement Modal -->
    <AchievementModal
      v-if="showAchievement || modalStore.isModalClosing('achievement')"
      v-bind="achievementProps"
      @close="() => { startClosingModal('achievement'); closeAchievementModal(); }"
    />

    <!-- Bonus Modal -->
    <BonusModal
      v-if="showBonus || modalStore.isModalClosing('bonus')"
      v-bind="bonusProps"
      @close="handleBonusModalClose"
    />

    <!-- Memoir Modal -->
    <MemoirModal
      v-if="showMemoir || modalStore.isModalClosing('memoir')"
      v-bind="memoirProps"
      @close="handleMemoirModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores'
import { useModals } from '@/composables/useModals'
import WelcomeModal from './WelcomeModal.vue'
import PhilosophyModal from './PhilosophyModal.vue'
import BubbleModal from './BubbleModal.vue'
import GameOverModal from './GameOverModal.vue'
import LevelUpModal from './LevelUpModal.vue'
import AchievementModal from './AchievementModal.vue'
import BonusModal from './BonusModal.vue'
import MemoirModal from './MemoirModal.vue'
import { computed } from 'vue'

const modalStore = useModalStore()
const {
  modals,
  data,
  closeWelcome,
  handlePhilosophyAnswer,
  handlePhilosophyCustomAnswer,
  continueBubbleModal,
  closeGameOverModal,
  restartGame,
  closeLevelUpModal,
  closeAchievementModal,
  closeBonusModal,
  closeMemoirModal
} = useModals()

// Функции для анимации закрытия модалок
const startClosingModal = (modalType: keyof typeof modalStore.modals) => {
  modalStore.startClosingModal(modalType)
  // Удаляем модалку из DOM через 300мс (время анимации)
  setTimeout(() => {
    modalStore.finishClosingModal(modalType)
  }, 200)
}

// Обработчики для асинхронного закрытия модалок
const handleBonusModalClose = async () => {
  startClosingModal('bonus')
  await closeBonusModal()
}

const handleMemoirModalClose = async () => {
  startClosingModal('memoir')
  await closeMemoirModal()
}

const currentModal = computed(() => modalStore.currentModal)

// Type-safe accessors
const safeModals = computed(() => (modals as any).value || {} as any)
const safeData = computed(() => (data as any).value || {} as any)

// Welcome Modal
const showWelcome = computed(() => {
  return currentModal.value?.type === 'welcome' || safeModals.value.welcome || false
})
const welcomeProps = computed(() => ({
  isOpen: showWelcome.value && !modalStore.isModalClosing('welcome'),
  allowEscapeClose: true,
  isClosing: modalStore.isModalClosing('welcome')
}))

// Philosophy Modal
const showPhilosophy = computed(() => {
  return currentModal.value?.type === 'philosophy' || safeModals.value.philosophy || false
})
const philosophyProps = computed(() => ({
  isOpen: showPhilosophy.value && !modalStore.isModalClosing('philosophy'),
  question: safeData.value.currentQuestion || null,
  allowEscapeClose: false,
  isClosing: modalStore.isModalClosing('philosophy')
}))

// Bubble Modal
const showBubble = computed(() => {
  return currentModal.value?.type === 'bubble' || safeModals.value.bubble || false
})
const bubbleProps = computed(() => ({
  isOpen: showBubble.value && !modalStore.isModalClosing('bubble'),
  bubble: safeData.value.currentBubble || null,
  allowEscapeClose: true,
  isClosing: modalStore.isModalClosing('bubble')
}))

// Game Over Modal
const showGameOver = computed(() => {
  return currentModal.value?.type === 'gameOver' || safeModals.value.gameOver || false
})
const gameOverProps = computed(() => ({
  isVisible: showGameOver.value && !modalStore.isModalClosing('gameOver'),
  stats: safeData.value.gameOverStats || null,
  allowEscapeClose: false,
  isClosing: modalStore.isModalClosing('gameOver')
}))

// Level Up Modal
const showLevelUp = computed(() => {
  return (currentModal.value?.type === 'levelUp' && safeData.value.levelUpData) ||
    safeModals.value.levelUp || false
})
const levelUpProps = computed(() => ({
  isOpen: showLevelUp.value && !modalStore.isModalClosing('levelUp'),
  level: safeData.value.levelUpData?.level || 1,
  title: safeData.value.levelUpData?.title || 'Новый уровень',
  description: safeData.value.levelUpData?.description || '',
  icon: safeData.value.levelUpData?.icon || '⭐',
  currentXP: safeData.value.levelUpData?.currentXP || 0,
  xpGained: safeData.value.levelUpData?.xpGained || 0,
  allowEscapeClose: false,
  isClosing: modalStore.isModalClosing('levelUp')
}))

// Achievement Modal
const showAchievement = computed(() => {
  return currentModal.value?.type === 'achievement' || safeModals.value.achievement || false
})
const achievementProps = computed(() => ({
  isOpen: showAchievement.value && !modalStore.isModalClosing('achievement'),
  achievement: safeData.value.achievement || null,
  allowEscapeClose: false,
  isClosing: modalStore.isModalClosing('achievement')
}))

// Bonus Modal
const showBonus = computed(() => {
  return currentModal.value?.type === 'bonus' || safeModals.value.bonus || false
})
const bonusProps = computed(() => ({
  isOpen: showBonus.value && !modalStore.isModalClosing('bonus'),
  allowEscapeClose: true,
  isClosing: modalStore.isModalClosing('bonus')
}))

// Memoir Modal
const showMemoir = computed(() => {
  return currentModal.value?.type === 'memoir' || safeModals.value.memoir || false
})
const memoirProps = computed(() => ({
  isOpen: showMemoir.value && !modalStore.isModalClosing('memoir'),
  memoir: safeData.value.currentMemoir || null,
  allowEscapeClose: true,
  isClosing: modalStore.isModalClosing('memoir')
}))
</script>

<style scoped>

</style>
