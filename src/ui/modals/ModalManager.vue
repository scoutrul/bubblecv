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

    <!-- Clicker Rules Modal -->
    <ClickerRulesModal
      v-if="showClickerRules || modalStore.isModalClosing('clickerRules')"
      :isOpen="showClickerRules && !modalStore.isModalClosing('clickerRules')"
      :isClosing="modalStore.isModalClosing('clickerRules')"
      @close="() => { startClosingModal('clickerRules'); modalStore.closeCurrentModal(); }"
    />

    <!-- Clicker Results Modal -->
    <ClickerResultsModal
      v-if="showClickerResults || modalStore.isModalClosing('clickerResults')"
      :isOpen="showClickerResults && !modalStore.isModalClosing('clickerResults')"
      :data="clickerResultsData"
      :isClosing="modalStore.isModalClosing('clickerResults')"
      @close="() => { startClosingModal('clickerResults'); modalStore.closeCurrentModal(); }"
    />

    <!-- Final Congrats Modal -->
    <FinalCongratsModal
      v-if="showFinalCongrats || modalStore.isModalClosing('finalCongrats')"
      :isOpen="showFinalCongrats && !modalStore.isModalClosing('finalCongrats')"
      :data="finalCongratsData"
      :isClosing="modalStore.isModalClosing('finalCongrats')"
      @close="() => { startClosingModal('finalCongrats'); modalStore.closeCurrentModal(); }"
    />

    <!-- Chat Bot Modal -->
    <ChatBotModal
      v-if="showChat || modalStore.isModalClosing('chat')"
      :isOpen="showChat && !modalStore.isModalClosing('chat')"
      :isClosing="modalStore.isModalClosing('chat')"
      @close="() => { startClosingModal('chat'); modalStore.closeCurrentModal(); }"
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
import ClickerRulesModal from './ClickerRulesModal.vue'
import ClickerResultsModal from './ClickerResultsModal.vue'
import FinalCongratsModal from './FinalCongratsModal.vue'
import ChatBotModal from './ChatBotModal.vue'
import { computed } from 'vue'
import { useI18n } from '@/composables'
import { MODAL_PRIORITIES } from '@/types/modals'
import { useBonusStore } from '@/stores/bonus.store'
import { useMemoirStore } from '@/stores/memoir.store'
import { useAchievement } from '@/composables/useAchievement'

const modalStore = useModalStore()
const bonusStore = useBonusStore()
const memoirStore = useMemoirStore()
const { unlockedCount } = useAchievement()
const isDev = import.meta.env.DEV
const { t } = useI18n()
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

  setTimeout(() => {
    modalStore.finishClosingModal(modalType)
  }, 0)
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
const safeModals = computed(() => (modals?.value ?? {}) as typeof modals.value)
const safeData = computed(() => (data?.value ?? {}) as typeof data.value)

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
  const active = currentModal.value?.type === 'bubble' || safeModals.value.bubble || false
  return active && Boolean(safeData.value.currentBubble)
})
const bubbleProps = computed(() => ({
  isOpen: showBubble.value && !modalStore.isModalClosing('bubble'),
  bubble: safeData.value.currentBubble!,
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
const levelUpProps = computed(() => {
  const props = {
    isOpen: showLevelUp.value && !modalStore.isModalClosing('levelUp'),
    level: safeData.value.levelUpData?.level || 1,
    title: safeData.value.levelUpData?.title || t.value('modals.levelUp.titleShort'),
    description: safeData.value.levelUpData?.description || '',
    icon: safeData.value.levelUpData?.icon || '⭐',
    currentXP: safeData.value.levelUpData?.currentXP || 0,
    xpGained: safeData.value.levelUpData?.xpGained || 0,
    allowEscapeClose: false,
    isClosing: modalStore.isModalClosing('levelUp'),
    isProjectTransition: safeData.value.levelUpData?.isProjectTransition || false
  }
  
  return props
})

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

// Clicker Rules
const showClickerRules = computed(() => currentModal.value?.type === 'clickerRules' || safeModals.value.clickerRules || false)
// Clicker Results
const showClickerResults = computed(() => currentModal.value?.type === 'clickerResults' || safeModals.value.clickerResults || false)
const clickerResultsData = computed(() => safeData.value.clickerResults || null)

// Final Congrats
const showFinalCongrats = computed(() => currentModal.value?.type === 'finalCongrats' || safeModals.value.finalCongrats || false)
const finalCongratsData = computed(() => safeData.value.finalCongrats || null)

// Chat Bot
const showChat = computed(() => currentModal.value?.type === 'chat' || safeModals.value.chat || false)

// DEV helper
const openFinalCongratsDebug = () => {
  // Unlock all bonuses and memoirs for debug testing
  bonusStore.bonuses.forEach(b => { b.isUnlocked = true })
  memoirStore.memoirs.forEach(m => { m.isUnlocked = true })

  const payload = {
    totalBubbles: 123,
    byType: { normal: 80, tough: 10, hidden: 20, philosophy: 13 },
    totalXP: 4567,
    bonusesUnlocked: bonusStore.unlockedBonuses.length,
    achievementsUnlocked: unlockedCount.value,
    memoirsUnlocked: memoirStore.unlockedMemoirs.length
  }
  modalStore.enqueueModal({ type: 'finalCongrats', data: payload, priority: MODAL_PRIORITIES.finalCongrats })
}

</script>

<style scoped>

</style>
