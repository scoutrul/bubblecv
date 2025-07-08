import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import type { ModalStates, ModalData, PendingAchievement, LevelUpData } from '@/types/modals'

export const useModalStore = defineStore('modalStore', () => {
  // State - только данные
  const modals = reactive<ModalStates>({
    welcome: false,
    bubble: false,
    levelUp: false,
    philosophy: false,
    gameOver: false,
    achievement: false
  })

  const data = reactive<ModalData>({
    currentBubble: null,
    currentQuestion: null,
    philosophyBubbleId: null,
    achievement: null,
    gameOverStats: null,
    levelUpData: {
      level: 1,
      title: '',
      description: '',
      icon: '👋',
      currentXP: 0,
      xpGained: 0,
      unlockedFeatures: [],
      xpRequired: 0
    }
  })

  const pendingAchievements = ref<PendingAchievement[]>([])

  // Простые computed
  const isAnyModalOpen = computed(() =>
    Object.values(modals).some(v => v)
  )

  const hasActiveModals = computed(() =>
    modals.welcome || modals.bubble || modals.levelUp || modals.philosophy || modals.gameOver
  )

  // Простые методы для управления состоянием (без бизнес-логики)
  const openModal = (key: keyof ModalStates) => {
    modals[key] = true
  }

  const closeModal = (key: keyof ModalStates) => {
    modals[key] = false
  }

  // Setters для данных (без бизнес-логики)
  const setCurrentBubble = (bubble: ModalData['currentBubble']) => {
    data.currentBubble = bubble
  }

  const setCurrentQuestion = (question: ModalData['currentQuestion']) => {
    data.currentQuestion = question
  }

  const setPhilosophyBubbleId = (id: ModalData['philosophyBubbleId']) => {
    data.philosophyBubbleId = id
  }

  const setAchievement = (achievement: ModalData['achievement']) => {
    data.achievement = achievement
  }

  const setGameOverStats = (stats: ModalData['gameOverStats']) => {
    data.gameOverStats = stats
  }

  const setLevelUpData = (levelData: LevelUpData) => {
    data.levelUpData = levelData
  }

  // Простые методы для очереди achievements (без логики)
  const addPendingAchievement = (achievement: PendingAchievement) => {
    pendingAchievements.value.push(achievement)
  }

  const getNextPendingAchievement = (): PendingAchievement | undefined => {
    return pendingAchievements.value.shift()
  }

  return {
    // State
    modals,
    data,
    pendingAchievements,

    // Computed
    isAnyModalOpen,
    hasActiveModals,

    // Modal control
    openModal,
    closeModal,

    // Data setters
    setCurrentBubble,
    setCurrentQuestion,
    setPhilosophyBubbleId,
    setAchievement,
    setGameOverStats,
    setLevelUpData,

    // Achievement queue
    addPendingAchievement,
    getNextPendingAchievement
  }
})
