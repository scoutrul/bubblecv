import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Bubble, PhilosophyQuestion } from '@shared/types'
import { useSessionStore } from '@/entities/user-session/model/session-store'

export const useModalStore = defineStore('modal', () => {
  const sessionStore = useSessionStore()
  
  // Bubble Modal
  const isBubbleModalOpen = ref(false)
  const currentBubble = ref<Bubble | null>(null)
  
  // Level Up Modal
  const isLevelUpModalOpen = ref(false)
  const currentLevel = ref(1)
  
  // Philosophy Question Modal
  const isPhilosophyModalOpen = ref(false)
  const currentQuestion = ref<PhilosophyQuestion | null>(null)
  
  // Game Over Modal
  const isGameOverModalOpen = ref(false)
  const gameOverStats = ref<{ currentXP: number; currentLevel: number } | null>(null)

  // Bubble Modal Actions
  const openBubbleModal = (bubble: Bubble) => {
    currentBubble.value = bubble
    isBubbleModalOpen.value = true
  }

  const closeBubbleModal = () => {
    isBubbleModalOpen.value = false
    currentBubble.value = null
  }

  const continueBubbleModal = () => {
    const bubbleId = currentBubble.value?.id
    closeBubbleModal()
    
    // Эмитим событие для удаления пузыря
    if (bubbleId) {
      // Используем кастомное событие для уведомления о необходимости удаления пузыря
      window.dispatchEvent(new CustomEvent('bubble-continue', { detail: { bubbleId } }))
    }
  }

  // Level Up Modal Actions  
  const openLevelUpModal = (level: number) => {
    currentLevel.value = level
    isLevelUpModalOpen.value = true
  }

  const closeLevelUpModal = () => {
    isLevelUpModalOpen.value = false
  }

  // Philosophy Question Modal Actions
  const openPhilosophyModal = (question: PhilosophyQuestion) => {
    currentQuestion.value = question
    isPhilosophyModalOpen.value = true
  }

  const closePhilosophyModal = () => {
    isPhilosophyModalOpen.value = false
    currentQuestion.value = null
  }

  const handlePhilosophyAnswer = async (answer: 'agree' | 'disagree') => {
    if (!currentQuestion.value) return
    
    if (answer === 'agree') {
      // Правильный ответ - дать XP
      const leveledUp = await sessionStore.gainPhilosophyXP()
      if (leveledUp) {
        openLevelUpModal(sessionStore.currentLevel)
      }
    } else {
      // Неправильный ответ - забрать жизнь
      const gameOver = await sessionStore.losePhilosophyLife()
      if (gameOver) {
        openGameOverModal({
          currentXP: sessionStore.currentXP,
          currentLevel: sessionStore.currentLevel
        })
      }
    }
    
    closePhilosophyModal()
  }

  // Game Over Modal Actions
  const openGameOverModal = (stats: { currentXP: number; currentLevel: number }) => {
    gameOverStats.value = stats
    isGameOverModalOpen.value = true
  }

  const closeGameOverModal = () => {
    isGameOverModalOpen.value = false
    gameOverStats.value = null
  }

  const restartGame = async () => {
    await sessionStore.resetSession()
    closeGameOverModal()
    
    // Эмитим событие для перезагрузки с 2015 года
    window.dispatchEvent(new CustomEvent('game-restart'))
  }

  return {
    // State
    isBubbleModalOpen,
    currentBubble,
    isLevelUpModalOpen,
    currentLevel,
    isPhilosophyModalOpen,
    currentQuestion,
    isGameOverModalOpen,
    gameOverStats,
    
    // Actions
    openBubbleModal,
    closeBubbleModal,
    continueBubbleModal,
    openLevelUpModal,
    closeLevelUpModal,
    openPhilosophyModal,
    closePhilosophyModal,
    handlePhilosophyAnswer,
    openGameOverModal,
    closeGameOverModal,
    restartGame
  }
}) 