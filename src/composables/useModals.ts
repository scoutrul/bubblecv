import { ref, computed, nextTick } from 'vue'
import { useSessionStore, useModalStore, useLevelStore } from '@/stores'
import { useAchievement } from '@/composables/useAchievement'
import { useSession } from '@/composables/useSession'
import { getEventBridge } from '@/composables/useUi'
import { GAME_CONFIG, XP_CALCULATOR } from '@/config'
import type { NormalizedLevel, NormalizedAchievement } from '@/types/normalized'
import type { NormalizedBubble } from '@/types/normalized'
import type { BubbleNode } from '@/types/canvas'
import type { Question } from '@/types/data'
import type { ModalStates, PendingBubbleRemoval, CanvasBridge, PendingAchievement, EventChain } from '@/types/modals'
import { MODAL_PRIORITIES } from '@/types/modals'
import { useBonuses } from '@/composables/useBonuses'

let canvasBridge: CanvasBridge | null = null
let eventChainCompletedHandler: (() => void) | null = null

// Глобальное состояние для отложенного удаления пузырей
const pendingBubbleRemovals = ref<Array<PendingBubbleRemoval>>([])

export const setCanvasBridge = (bridge: CanvasBridge) => {
  canvasBridge = bridge
}

export const getCanvasBridge = (): CanvasBridge | null => {
  return canvasBridge
}

export const setEventChainCompletedHandler = (handler: () => void) => {
  eventChainCompletedHandler = handler
}

export const getEventChainCompletedHandler = (): (() => void) | null => {
  return eventChainCompletedHandler
}

export const useModals = () => {
  const sessionStore = useSessionStore()
  const modalStore = useModalStore()
  const levelStore = useLevelStore()
  const { unlockAchievement } = useAchievement()
  const { gainXP, losePhilosophyLife, visitBubble, startSession } = useSession()
  
  const isProcessingBubbleModal = ref(false)

  // Функция для обработки завершения Event Chain (вызывается из modal store)
  const handleEventChainCompleted = () => {
    processPendingBubbleRemovals()
  }

  // Устанавливаем обработчик для modal store
  setEventChainCompletedHandler(handleEventChainCompleted)

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
    modalStore.modals.gameOver ||
    modalStore.modals.achievement ||
    modalStore.modals.bonus
  )

  const addPendingBubbleRemoval = (removal: PendingBubbleRemoval) => {
    pendingBubbleRemovals.value.push(removal)
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

  // Обновленная логика закрытия модалок для Event Chains
  const closeModalWithLogic = (key: keyof ModalStates) => {
    // Если используется система event chains - используем closeCurrentModal
    if (modalStore.currentEventChain || modalStore.currentModal) {
      modalStore.closeCurrentModal()
    } else {
      // Иначе используем старый способ
      modalStore.closeModal(key)
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

  // Новый метод для запуска цепочки событий пузыря
  const startBubbleEventChain = async (bubble: BubbleNode) => {
    if (isProcessingBubbleModal.value) {
      return
    }
    
    isProcessingBubbleModal.value = true

    try {
      // Посещаем пузырь и получаем XP
      visitBubble(bubble.id)
      const xpGained = XP_CALCULATOR.getBubbleXP(bubble.skillLevel || 'novice')
      let xpResult = await gainXP(xpGained)

      // Добавляем пузырь в очередь на удаление
      addPendingBubbleRemoval({
        bubbleId: bubble.id,
        xpAmount: xpGained,
        isPhilosophyNegative: false
      })

      // Собираем ТОЛЬКО обычные ачивки (bubble-explorer)
      const achievements: PendingAchievement[] = []
      const bubblesCount = sessionStore.visitedBubbles.length
      
      // Проверяем ачивки за количество пузырей
      if (bubblesCount === 10) {
        const achievement = await unlockAchievement('bubble-explorer-10')
        if (achievement) {
          achievements.push({
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward
          })
        }
      } else if (bubblesCount === 30) {
        const achievement = await unlockAchievement('bubble-explorer-30')
        if (achievement) {
          achievements.push({
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward
          })
        }
      } else if (bubblesCount === 50) {
        const achievement = await unlockAchievement('bubble-explorer-50')
        if (achievement) {
          achievements.push({
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward
          })
        }
      }

      // Собираем ОТДЕЛЬНО level ачивки
      const levelAchievements: PendingAchievement[] = []
      
      // Подготавливаем level up данные
      let pendingLevelUp = null

      if (xpResult.leveledUp) {
        pendingLevelUp = {
          level: xpResult.newLevel!,
          data: xpResult.levelData
        }

        // Добавляем ачивку за первый уровень В ОТДЕЛЬНЫЙ МАССИВ
        if (xpResult.newLevel === 2) {
          const levelAchievement = await unlockAchievement('first-level-master')
          if (levelAchievement) {
            // Получаем XP от level achievement тоже
            const levelXpResult = await gainXP(levelAchievement.xpReward)
            levelAchievements.push({
              title: levelAchievement.name,
              description: levelAchievement.description,
              icon: levelAchievement.icon,
              xpReward: levelAchievement.xpReward
            })
            // Обновляем xpResult если level achievement дал еще level up
            if (levelXpResult.leveledUp) {
              xpResult = levelXpResult
              pendingLevelUp = {
                level: xpResult.newLevel!,
                data: xpResult.levelData
              }
            }
          }
        }
      }

      // Запускаем Event Chain с разделенными ачивками
      modalStore.startEventChain({
        type: 'bubble',
        pendingAchievements: achievements,           // Только bubble ачивки
        pendingLevelAchievements: levelAchievements, // Отдельно level ачивки
        pendingLevelUp,
        currentStep: 'bubble',
        context: {
          bubble,
          xpResult
        }
      })

    } finally {
      isProcessingBubbleModal.value = false
    }
  }

  // Welcome Modal
  const openWelcome = () => {
    modalStore.enqueueModal({
      type: 'welcome',
      data: null,
      priority: MODAL_PRIORITIES.welcome
    })
  }
  
  const closeWelcome = () => closeModalWithLogic('welcome')

  // Bubble Modal  
  const openBubbleModal = (bubble: BubbleNode) => {
    // Используем новую систему Event Chains
    startBubbleEventChain(bubble)
  }

  const continueBubbleModal = async () => {
    // Просто закрываем модалку, Event Chain система сама продолжит цепочку
    closeModalWithLogic('bubble')
  }

  // Level Up Modal
  const openLevelUpModal = (level: number, payload?: any) => {
    // Level Up Modal теперь работает только через Event Chain
    const levelData = levelStore.getLevelByNumber(level)
    const icon = ['👋', '🤔', '📚', '🤝', '🤜🤛'][level - 1] || '⭐'
    
    modalStore.startEventChain({
      type: 'manual',
      pendingAchievements: [],
      pendingLevelAchievements: [],
      pendingLevelUp: {
        level: level,
        data: payload || {
          level: level,
          title: levelData?.title || `Уровень ${level}`,
          description: levelData?.description || `Поздравляем! Вы достигли ${level} уровня!`,
          icon: icon,
          currentXP: sessionStore.session?.currentXP || 0,
          xpGained: 0,
          unlockedFeatures: levelData?.unlockedFeatures || []
        }
      },
      currentStep: 'levelUp',
      context: {}
    })
  }

  const closeLevelUpModal = () => closeModalWithLogic('levelUp')

  // Philosophy Modal
  const openPhilosophyModal = (question: Question, bubbleId?: BubbleNode['id']) => {
    modalStore.enqueueModal({
      type: 'philosophy',
      data: { question, bubbleId },
      priority: MODAL_PRIORITIES.philosophy
    })
  }

  const handlePhilosophyAnswer = async (optionId: string) => {
    const question = modalStore.data.currentQuestion
    const bubbleId = modalStore.data.philosophyBubbleId
    
    if (!question) return

    const selectedOption = question.options.find(o => String(o.id) === optionId)
    if (!selectedOption) return

    const isNegative = selectedOption.livesLost > 0
    
    // Помечаем пузырь как посещенный СРАЗУ
    if (bubbleId) {
      await visitBubble(bubbleId)
    }
    
    // Определяем количество XP в зависимости от agreementLevel
    const xpAmount = XP_CALCULATOR.getPhilosophyXP(selectedOption.agreementLevel)

    // Обрабатываем ответ
    let xpResult = null
    if (isNegative) {
      const isGameOver = await losePhilosophyLife()
      if (isGameOver) {
        closeModalWithLogic('philosophy')
        openGameOverModal()
        return
      }
    } else {
      // Начисляем XP только за положительные ответы
      xpResult = await gainXP(xpAmount)
    }

    // Закрываем модалку ПЕРЕД показом ачивки
    closeModalWithLogic('philosophy')

    // Выдаем ачивку за первый философский пузырь (любой ответ)
    const achievement = await unlockAchievement('philosophy-master')
    if (achievement) {
      const achievementResult = await gainXP(achievement.xpReward)
      
      // Собираем ТОЛЬКО обычные ачивки (philosophy)
      const achievements: PendingAchievement[] = [{
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      }]

      // Собираем ОТДЕЛЬНО level ачивки
      const levelAchievements: PendingAchievement[] = []

      // Определяем финальный xpResult (от философии + от ачивки)
      let finalXpResult = achievementResult.leveledUp ? achievementResult : xpResult

      // Добавляем level achievement если достигли уровня 2
      if (finalXpResult && finalXpResult.leveledUp && finalXpResult.newLevel === 2) {
        const levelAchievement = await unlockAchievement('first-level-master')
        if (levelAchievement) {
          // Получаем XP от level achievement тоже
          const levelXpResult = await gainXP(levelAchievement.xpReward)
          levelAchievements.push({
            title: levelAchievement.name,
            description: levelAchievement.description,
            icon: levelAchievement.icon,
            xpReward: levelAchievement.xpReward
          })
          // Обновляем finalXpResult если level achievement дал еще level up
          if (levelXpResult.leveledUp) {
            finalXpResult = levelXpResult
          }
        }
      }

      // Запускаем Event Chain для философского пузыря с разделенными ачивками
      modalStore.startEventChain({
        type: 'philosophy',
        pendingAchievements: achievements,           // Только philosophy ачивка
        pendingLevelAchievements: levelAchievements, // Отдельно level ачивки
        pendingLevelUp: finalXpResult && finalXpResult.leveledUp ? { 
          level: finalXpResult.newLevel!, 
          data: finalXpResult.levelData 
        } : null,
        currentStep: 'achievement', // Начинаем с ачивки
        context: { xpResult: finalXpResult, bubbleId: bubbleId || undefined }
      })
    } else if (xpResult && xpResult.leveledUp) {
      // Если нет ачивки, но есть level up - показываем только level up
      openLevelUpModal(xpResult.newLevel!, xpResult.levelData)
    }

    // Ставим пузырь в очередь на удаление
    if (bubbleId) {
      const canvas = getCanvasBridge()
      if (canvas) {
        canvas.removeBubble(bubbleId, xpAmount, isNegative)
      }
    }
  }

  const closePhilosophyModal = () => closeModalWithLogic('philosophy')

  // Game Over Modal
  const openGameOverModal = () => {
    modalStore.enqueueModal({
      type: 'gameOver',
      data: {
        currentXP: sessionStore.session?.currentXP || 0,
        currentLevel: sessionStore.session?.currentLevel || 1
      },
      priority: MODAL_PRIORITIES.gameOver
    })
  }
  
  const closeGameOverModal = () => closeModalWithLogic('gameOver')

  const restartGame = async () => {
    modalStore.clearQueue() // Очищаем очередь модалок и event chains
    
    // Сбрасываем состояние бонусов
    const { resetBonuses } = useBonuses()
    resetBonuses()
    
    startSession()
    openWelcome()
    closeModalWithLogic('gameOver')
  }

  // Achievement Modal
  const openAchievementModal = (achievement: PendingAchievement) => {
    modalStore.enqueueModal({
      type: 'achievement',
      data: achievement,
      priority: MODAL_PRIORITIES.achievement
    })
  }

  const closeAchievementModal = () => {
    // Проверяем есть ли еще достижения в очереди
    if (modalStore.pendingAchievements.length > 0) {
      const next = modalStore.getNextPendingAchievement()
      if (next) {
        modalStore.setAchievement(next)
        return // Не закрываем модалку, показываем следующую
      }
    }
    
    closeModalWithLogic('achievement')
    modalStore.setAchievement(null)
  }

  const closeBonusModal = () => {
    // Закрываем BonusModal
    modalStore.closeModal('bonus')
    modalStore.setCurrentBonus(null)
    
    // Восстанавливаем приостановленный Event Chain если он был
    const pausedChain = sessionStorage.getItem('pausedEventChain')
    if (pausedChain) {
      sessionStorage.removeItem('pausedEventChain')
      const chain = JSON.parse(pausedChain)
      
      // Пропускаем LevelUp так как он уже был показан
      if (chain.currentStep === 'levelUp') {
        chain.currentStep = 'levelAchievement'
      }
      
      // Продолжаем с того места где остановились
      modalStore.startEventChain(chain)
      modalStore.processEventChain()
    }
  }

  const handleToughBubbleDestroyed = async () => {
    // Пытаемся получить ачивку для tough пузыря
    let achievement = await unlockAchievement('tough-bubble-popper')
    
    // Если не получилось, пытаемся для скрытого пузыря
    if (!achievement) {
      achievement = await unlockAchievement('secret-bubble-discoverer')
    }
    
    if (achievement) {
      // Сначала получаем XP от ачивки
      let xpResult = await gainXP(achievement.xpReward)
      
      // Собираем ТОЛЬКО обычные ачивки (tough-bubble-popper или secret-bubble-discoverer)
      const achievements: PendingAchievement[] = [{
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      }]

      // Собираем ОТДЕЛЬНО level ачивки
      const levelAchievements: PendingAchievement[] = []

      // Если достигли уровня 2 от ачивки, добавляем level achievement
      if (xpResult.leveledUp && xpResult.newLevel === 2) {
        const levelAchievement = await unlockAchievement('first-level-master')
        if (levelAchievement) {
          // Получаем XP от level achievement тоже
          const levelXpResult = await gainXP(levelAchievement.xpReward)
          levelAchievements.push({
            title: levelAchievement.name,
            description: levelAchievement.description,
            icon: levelAchievement.icon,
            xpReward: levelAchievement.xpReward
          })
          // Обновляем xpResult если level achievement дал еще level up
          if (levelXpResult.leveledUp) {
            xpResult = levelXpResult
          }
        }
      }

      // Запускаем Event Chain для скрытого/tough пузыря с разделенными ачивками
      modalStore.startEventChain({
        type: 'manual',
        pendingAchievements: achievements,           // tough или secret ачивка
        pendingLevelAchievements: levelAchievements, // Отдельно level ачивки
        pendingLevelUp: xpResult.leveledUp ? { 
          level: xpResult.newLevel!, 
          data: xpResult.levelData 
        } : null,
        currentStep: 'achievement', // Начинаем с ачивки
        context: { xpResult }
      })
    }
  }

  return {
    // State
    modals,
    data,
    isAnyModalOpen,
    hasActiveModals,
    isProcessingBubbleModal,

    // Bridge
    addPendingBubbleRemoval,
    processPendingBubbleRemovals,

    // Event Chains
    startBubbleEventChain,

    // Welcome
    openWelcome,
    closeWelcome,

    // Bubble
    openBubbleModal,
    continueBubbleModal,

    // Level Up
    openLevelUpModal,
    closeLevelUpModal,

    // Philosophy
    openPhilosophyModal,
    handlePhilosophyAnswer,
    closePhilosophyModal,

    // Game Over
    openGameOverModal,
    closeGameOverModal,
    restartGame,

    // Achievement
    openAchievementModal,
    closeAchievementModal,

    // Bonus
    closeBonusModal,

    // Handlers
    handleToughBubbleDestroyed
  }



  return {
    // Event Chains
    startBubbleEventChain,

    // Welcome
    openWelcome,
    closeWelcome,

    // Bubble
    openBubbleModal,
    continueBubbleModal,

    // Level Up
    openLevelUpModal,
    closeLevelUpModal,

    // Philosophy
    openPhilosophyModal,
    handlePhilosophyAnswer,
    closePhilosophyModal,

    // Game Over
    openGameOverModal,
    closeGameOverModal,
    restartGame,

    // Achievement
    openAchievementModal,
    closeAchievementModal,

    // Bonus
    closeBonusModal,

    // Handlers
    handleToughBubbleDestroyed
  }
}