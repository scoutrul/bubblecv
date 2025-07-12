import { computed, ref } from 'vue'
import { useModalStore } from '@/stores/modal.store'
import { useSessionStore } from '@/stores/session.store'
import { useLevelStore } from '@/stores/levels.store'
import { useSession } from './useSession'
import { useAchievement } from './useAchievement'
import { getEventBridge } from './useUi'
import type { BubbleNode } from '@/types/canvas'
import type { Question } from '@/types/data'
import type { PendingAchievement, ModalStates } from '@/types/modals'
import { XP_CALCULATOR } from '@/config'

export interface CanvasBridge {
  removeBubble: (bubbleId: number, xpAmount?: number, isPhilosophyNegative?: boolean) => void
}

let canvasBridge: CanvasBridge | null = null

export const setCanvasBridge = (bridge: CanvasBridge) => {
  canvasBridge = bridge
}

export const getCanvasBridge = (): CanvasBridge | null => {
  return canvasBridge
}

export const useModals = () => {
  const modalStore = useModalStore()
  const sessionStore = useSessionStore()
  const levelStore = useLevelStore()
  const { gainPhilosophyXP, losePhilosophyLife, startSession, gainXP, visitBubble } = useSession()
  const { unlockAchievement } = useAchievement()
  
  const isProcessingBubbleModal = ref(false)
  
  // Система отложенного удаления пузырей
  const pendingBubbleRemovals = ref<Array<{
    bubbleId: number
    xpAmount: number
    isPhilosophyNegative: boolean
  }>>([])

  const modals = computed(() => modalStore.modals)
  const data = computed(() => modalStore.data)
  
  const isAnyModalOpen = computed(() => 
    Object.values(modalStore.modals).some(v => v)
  )

  const hasActiveModals = computed(() =>
    modalStore.modals.welcome || 
    modalStore.modals.bubble || 
    modalStore.modals.levelUp || 
    modalStore.modals.philosophy || 
    modalStore.modals.gameOver
  )

  const processPendingAchievements = () => {
    if (!hasActiveModals.value && modalStore.pendingAchievements.length > 0) {
      const next = modalStore.getNextPendingAchievement()
      if (next) {
        // Задержка в 0.6 секунды чтобы увидеть эффект исчезновения пузыря
        setTimeout(() => {
          modalStore.setAchievement(next)
          modalStore.openModal('achievement')
        }, 600)
      }
    }
  }

  const processPendingBubbleRemovals = () => {
    if (!hasActiveModals.value && pendingBubbleRemovals.value.length > 0) {
      const canvas = getCanvasBridge()
      if (canvas) {
        pendingBubbleRemovals.value.forEach(removal => {
          canvas.removeBubble(removal.bubbleId, removal.xpAmount, removal.isPhilosophyNegative)
        })
        pendingBubbleRemovals.value = []
      }
    }
  }

  const closeModalWithLogic = (key: keyof ModalStates) => {
    modalStore.closeModal(key)
    if (key !== 'achievement') {
      processPendingAchievements()
    }
    const bridge = getEventBridge()
    if (bridge) {
      bridge.processShakeQueue()
    }
    
    // Обрабатываем отложенные удаления пузырей после закрытия всех модалок
    setTimeout(() => {
      processPendingBubbleRemovals()
    }, 50)
  }

  const openWelcome = () => modalStore.openModal('welcome')
  const closeWelcome = () => closeModalWithLogic('welcome')

  const openBubbleModal = (bubble: BubbleNode) => {
    modalStore.setCurrentBubble(bubble)
    modalStore.openModal('bubble')
  }

  const processedBubbles = ref(new Set<number>())

  const continueBubbleModal = async () => {
    if (isProcessingBubbleModal.value) return
    const bubble = modalStore.data.currentBubble
    if (!bubble) return
    if (processedBubbles.value.has(bubble.id)) {
      closeModalWithLogic('bubble')
      modalStore.setCurrentBubble(null)
      return
    }
    processedBubbles.value.add(bubble.id)
    isProcessingBubbleModal.value = true
    try {
      const bubbleId = bubble.id
      const canvas = getCanvasBridge()
      if (bubble && !bubble.isQuestion && !bubble.isTough) {
        const xpGained = bubble.skillLevel ? 
          ({ novice: 1, intermediate: 2, confident: 3, expert: 4, master: 5 }[bubble.skillLevel] || 1) : 1
        const result = await gainXP(xpGained)
        const bubblesCount = sessionStore.visitedBubbles.length
        let achievement = null
        if (bubblesCount === 10) {
          achievement = await unlockAchievement('bubble-explorer-10')
        } else if (bubblesCount === 30) {
          achievement = await unlockAchievement('bubble-explorer-30')
        } else if (bubblesCount === 50) {
          achievement = await unlockAchievement('bubble-explorer-50')
        }
        if (achievement) {
          const achievementResult = await gainXP(achievement.xpReward)
          if (achievementResult.leveledUp && achievementResult.levelData) {
            openLevelUpModal(achievementResult.newLevel!, achievementResult.levelData)
          }
          openAchievementModal({
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward
          })
        }
        if (result.leveledUp && result.levelData) {
          openLevelUpModal(result.newLevel!, result.levelData)
          modalStore.setCurrentBubble(null)
          // Отложенное удаление пузыря
          pendingBubbleRemovals.value.push({
            bubbleId: bubble.id,
            xpAmount: xpGained,
            isPhilosophyNegative: false
          })
          return
        } else {
          closeModalWithLogic('bubble')
          modalStore.setCurrentBubble(null)
          // Отложенное удаление пузыря
          pendingBubbleRemovals.value.push({
            bubbleId: bubble.id,
            xpAmount: xpGained,
            isPhilosophyNegative: false
          })
          return
        }
      }
      closeModalWithLogic('bubble')
      modalStore.setCurrentBubble(null)
      // Отложенное удаление пузыря
      pendingBubbleRemovals.value.push({
        bubbleId: bubble.id,
        xpAmount: 0,
        isPhilosophyNegative: false
      })
    } finally {
      isProcessingBubbleModal.value = false
    }
  }

  const openLevelUpModal = (level: number, payload?: any) => {
    if (modalStore.modals.achievement && modalStore.data.achievement) {
      modalStore.addPendingAchievement(modalStore.data.achievement)
      modalStore.closeModal('achievement')
      modalStore.setAchievement(null)
    }
    if (modalStore.modals.bubble) {
      modalStore.closeModal('bubble')
      modalStore.setCurrentBubble(null)
    }
    const levelData = {
      level,
      title: payload?.title ?? '',
      description: payload?.description ?? '',
      icon: payload?.icon ?? '👋',
      currentXP: payload?.currentXP ?? 0,
      xpGained: payload?.xpGained ?? 0,
      unlockedFeatures: payload?.unlockedFeatures ?? [],
      xpRequired: payload?.xpRequired ?? 0
    }
    modalStore.setLevelUpData(levelData)
    modalStore.openModal('levelUp')
  }

  const closeLevelUpModal = () => {
    closeModalWithLogic('levelUp')
  }

  const openPhilosophyModal = (question: Question, bubbleId?: BubbleNode['id']) => {
    modalStore.setCurrentQuestion(question)
    modalStore.setPhilosophyBubbleId(bubbleId ?? null)
    modalStore.openModal('philosophy')
  }

  const handlePhilosophyAnswer = async (optionId: string) => {
    const question = modalStore.data.currentQuestion
    const selectedOption = question?.options.find(opt => String(opt.id) === optionId)
    if (!selectedOption) return
    
    const bubbleId = modalStore.data.philosophyBubbleId
    console.log('🔍 Philosophy bubble ID:', bubbleId)
    
    const isNegative = selectedOption.livesLost > 0
    
    // Помечаем пузырь как посещенный СРАЗУ
    if (bubbleId) {
      await visitBubble(bubbleId)
      console.log('✅ Philosophy bubble marked as visited:', bubbleId)
    }
    
    // Определяем количество XP в зависимости от agreementLevel
    const xpAmount = XP_CALCULATOR.getPhilosophyXP(selectedOption.agreementLevel)
    
    // Даем XP за любой ответ
    const result = await gainXP(xpAmount)
    
    if (isNegative) {
      // Отрицательный ответ - отнимаем жизни
      for (let i = 0; i < selectedOption.livesLost; i++) {
        const gameOver = await losePhilosophyLife()
        if (gameOver) {
          modalStore.setGameOverStats({
            currentXP: sessionStore.currentXP,
            currentLevel: sessionStore.currentLevel
          })
          modalStore.openModal('gameOver')
          break
        }
      }
    } else {
      // Проверяем достижение за первый философский вопрос
      const achievement = await unlockAchievement('philosophy-master')
      if (achievement) {
        const achievementResult = await gainXP(achievement.xpReward)
        if (achievementResult.leveledUp && achievementResult.levelData) {
          openLevelUpModal(achievementResult.newLevel!, achievementResult.levelData)
        }
        openAchievementModal({
          title: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward
        })
      }
    }
    
    // Проверяем на повышение уровня
    if (result.leveledUp && result.levelData) {
      openLevelUpModal(result.newLevel!, result.levelData)
    }
    
    closeModalWithLogic('philosophy')
    
    // Отложенное удаление пузыря
    if (bubbleId) {
      pendingBubbleRemovals.value.push({
        bubbleId: bubbleId,
        xpAmount: xpAmount,
        isPhilosophyNegative: isNegative
      })
      console.log('📋 Philosophy bubble queued for removal:', bubbleId)
    }
  }

  const closePhilosophyModal = () => closeModalWithLogic('philosophy')
  const openGameOverModal = () => modalStore.openModal('gameOver')
  const closeGameOverModal = () => closeModalWithLogic('gameOver')
  const restartGame = async () => {
    processedBubbles.value.clear()
    startSession()
    openWelcome()
    closeModalWithLogic('gameOver')
  }
  const openAchievementModal = (achievement: PendingAchievement) => {
    if (modalStore.modals.levelUp || hasActiveModals.value) {
      modalStore.addPendingAchievement(achievement)
    } else {
      // Задержка в 0.6 секунды чтобы увидеть эффект исчезновения пузыря
      setTimeout(() => {
        modalStore.setAchievement(achievement)
        modalStore.openModal('achievement')
      }, 600)
    }
  }
  const closeAchievementModal = () => {
    modalStore.closeModal('achievement')
    modalStore.setAchievement(null)
    setTimeout(() => processPendingAchievements(), 0)
  }
  return {
    modals,
    data,
    isAnyModalOpen,
    hasActiveModals,
    openWelcome,
    closeWelcome,
    openBubbleModal,
    continueBubbleModal,
    openLevelUpModal,
    closeLevelUpModal,
    openPhilosophyModal,
    closePhilosophyModal,
    handlePhilosophyAnswer,
    openGameOverModal,
    closeGameOverModal,
    restartGame,
    openAchievementModal,
    closeAchievementModal
  }
}