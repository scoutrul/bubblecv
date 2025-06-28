import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Bubble, PhilosophyQuestion } from '@shared/types'

export const useModalStore = defineStore('modal', () => {
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
    
    // TODO: Implement philosophy answer logic
    console.log('Philosophy answer:', answer, currentQuestion.value)
    
    closePhilosophyModal()
  }

  // Game Over Modal Actions
  const openGameOverModal = () => {
    isGameOverModalOpen.value = true
  }

  const closeGameOverModal = () => {
    isGameOverModalOpen.value = false
  }

  const restartGame = () => {
    // TODO: Implement game restart logic
    console.log('Restarting game...')
    closeGameOverModal()
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