import {defineStore} from 'pinia'
import {computed, nextTick, reactive, ref} from 'vue'
import type {EventChain, LevelUpData, ModalData, ModalStates, PendingAchievement, QueuedModal} from '@/types/modals'
import {getEventChainCompletedHandler} from '@/composables/useModals'

export const useModalStore = defineStore('modalStore', () => {
  // State - только данные
  const modals = reactive<ModalStates>({
    welcome: false,
    bubble: false,
    levelUp: false,
    philosophy: false,
    gameOver: false,
    achievement: false,
    bonus: false
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
      xpRequired: 0
    },
    currentBonus: null
  })

  const pendingAchievements = ref<PendingAchievement[]>([])

  // Система очередей (оставляем для совместимости)
  const modalQueue = ref<QueuedModal[]>([])
  const currentModal = ref<QueuedModal | null>(null)

  // Новая система Event Chains
  const currentEventChain = ref<EventChain | null>(null)

  // Простые computed
  const isAnyModalOpen = computed(() =>
    Object.values(modals).some(v => v)
  )

  const hasActiveModals = computed(() =>
    modals.welcome || modals.bubble || modals.levelUp || modals.philosophy || modals.gameOver
  )

  // Event Chain методы
  const startEventChain = (chain: Omit<EventChain, 'id'>) => {
    currentEventChain.value = {
      ...chain,
      id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    processEventChain()
  }

  const processEventChain = () => {
    if (!currentEventChain.value) return

    const chain = currentEventChain.value

    switch (chain.currentStep) {
      case 'bubble':
        if (chain.context.bubble) {
          showModal({
            id: `bubble_${chain.id}`,
            type: 'bubble',
            data: chain.context.bubble,
            priority: 50
          })
        } else {
          // Нет bubble, переходим к следующему шагу
          continueEventChain()
        }
        break

      case 'levelUp':
        if (chain.pendingLevelUp) {
          showModal({
            id: `levelUp_${chain.id}`,
            type: 'levelUp',
            data: chain.pendingLevelUp.data,
            priority: 80
          })
        } else {
          // Нет level up, переходим к следующему шагу
          continueEventChain()
        }
        break

      case 'achievement':
        if (chain.pendingAchievements.length > 0) {
          const achievement = chain.pendingAchievements.shift()!
          showModal({
            id: `achievement_${chain.id}`,
            type: 'achievement',
            data: achievement,
            priority: 70
          })
        } else {
          // Нет обычных ачивок, переходим к следующему шагу
          continueEventChain()
        }
        break

      case 'levelAchievement':
        if (chain.pendingLevelAchievements.length > 0) {
          const achievement = chain.pendingLevelAchievements.shift()!
          showModal({
            id: `levelAchievement_${chain.id}`,
            type: 'achievement',
            data: achievement,
            priority: 70
          })
        } else {
          // Нет level ачивок, завершаем цепочку
          continueEventChain()
        }
        break

      case 'complete':
        completeEventChain()
        break
    }
  }

  const continueEventChain = () => {
    if (!currentEventChain.value) return

    const chain = currentEventChain.value

    // Определяем следующий шаг согласно правильному порядку
    switch (chain.currentStep) {
      case 'bubble':
        // Для обычных пузырей: bubble → achievement (если есть)
        chain.currentStep = 'achievement'
        break
      case 'achievement':
        // Проверяем есть ли еще обычные ачивки
        if (chain.pendingAchievements.length > 0) {
          // Остаемся в achievement для следующей ачивки
          processEventChain()
          return
        }
        // После всех обычных ачивок → levelUp
        chain.currentStep = 'levelUp'
        break
      case 'levelUp':
        // После level up → level achievements
        chain.currentStep = 'levelAchievement'
        break
      case 'levelAchievement':
        // Проверяем есть ли еще level ачивки
        if (chain.pendingLevelAchievements.length > 0) {
          // Остаемся в levelAchievement для следующей ачивки
          processEventChain()
          return
        }
        // Завершаем
        chain.currentStep = 'complete'
        break
      default:
        chain.currentStep = 'complete'
    }

    processEventChain()
  }

  const completeEventChain = () => {
    currentEventChain.value = null

    // Обрабатываем отложенные удаления пузырей после завершения Event Chain
    nextTick(() => {
      const handler = getEventChainCompletedHandler()
      if (handler) {
        handler()
      }
    })
  }

  // Методы для работы с очередью (оставляем для совместимости)
  const enqueueModal = (modal: Omit<QueuedModal, 'id'>) => {
    const modalWithId: QueuedModal = {
      ...modal,
      id: `${modal.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Проверяем, нет ли уже модалки того же типа в очереди
    const existingIndex = modalQueue.value.findIndex(m => m.type === modal.type)
    if (existingIndex !== -1) {
      // Заменяем существующую модалку новой (обновляем данные)
      modalQueue.value[existingIndex] = modalWithId
    } else {
      modalQueue.value.push(modalWithId)
    }

    processQueue()
  }

  const processQueue = () => {
    // Если есть активная модалка или event chain, не обрабатываем очередь
    if (currentModal.value || currentEventChain.value) return

    // Сортируем очередь по приоритету (высший приоритет первым)
    modalQueue.value.sort((a, b) => b.priority - a.priority)

    // Берем первую модалку из очереди
    const nextModal = modalQueue.value.shift()
    if (nextModal) {
      showModal(nextModal)
    }
  }

  const showModal = (modal: QueuedModal) => {
    currentModal.value = modal

    // Устанавливаем данные для модалки
    switch (modal.type) {
      case 'bubble':
        data.currentBubble = modal.data
        break
      case 'achievement':
        data.achievement = modal.data
        break
      case 'levelUp':
        data.levelUpData = modal.data
        break
      case 'philosophy':
        data.currentQuestion = modal.data.question
        data.philosophyBubbleId = modal.data.bubbleId
        break
      case 'gameOver':
        data.gameOverStats = modal.data
        break
      case 'bonus':
        data.currentBonus = modal.data
        break
    }

    // Открываем модалку
    modals[modal.type] = true
  }

  const closeCurrentModal = () => {
    if (!currentModal.value) return

    const modalType = currentModal.value.type
    modals[modalType] = false
    currentModal.value = null

    // Если есть активная event chain, продолжаем её
    if (currentEventChain.value) {
      nextTick(() => {
        continueEventChain()
      })
    } else {
      // Иначе показываем следующую модалку из очереди
      nextTick(() => {
        processQueue()
      })
    }
  }

  const clearQueue = () => {
    modalQueue.value = []
    if (currentModal.value) {
      modals[currentModal.value.type] = false
      currentModal.value = null
    }
    currentEventChain.value = null
  }

  // Простые методы для управления состоянием (без бизнес-логики)
  const openModal = (key: keyof ModalStates) => {
    modals[key] = true
  }

  const closeModal = (key: keyof ModalStates) => {
    modals[key] = false
  }

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

  const setCurrentBonus = (bonus: ModalData['currentBonus']) => {
    data.currentBonus = bonus
  }

  // Achievement queue (оставляем для совместимости)
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

    // Queue system (старая система)
    modalQueue,
    currentModal,
    enqueueModal,
    processQueue,
    closeCurrentModal,
    clearQueue,

    // Event Chain system (новая система)
    currentEventChain,
    startEventChain,
    processEventChain,
    continueEventChain,
    completeEventChain,

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
    setCurrentBonus,

    // Achievement queue
    addPendingAchievement,
    getNextPendingAchievement
  }
})
