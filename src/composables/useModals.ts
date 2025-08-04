import { ref, computed } from 'vue'
import { useSessionStore, useModalStore, useLevelStore } from '@/stores'
import { useAchievement } from '@/composables/useAchievement'
import { useSession } from '@/composables/useSession'
import { getEventBridge } from '@/composables/useUi'
import { XP_CALCULATOR } from '@/config'
import { ModalUseCaseFactory } from '@/usecases/modal'
import type { NormalizedAchievement, NormalizedBonus, NormalizedMemoir } from '@/types/normalized'
import type { BubbleNode } from '@/types/canvas'
import type { Question } from '@/types/data'
import type { ModalStates, PendingBubbleRemoval, CanvasBridge, PendingAchievement, EventChain, XPResult, ModalDataUnion } from '@/types/modals'
import type { 
  ModalSessionStore, 
  ModalLevelStore, 
  ModalAchievementStore, 
  ModalModalStore 
} from '@/usecases/modal'
import { MODAL_PRIORITIES } from '@/types/modals'

let canvasBridge: CanvasBridge | null = null
let eventChainCompletedHandler: (() => Promise<void>) | null = null

const pendingBubbleRemovals = ref<Array<PendingBubbleRemoval>>([])

export const setCanvasBridge = (bridge: CanvasBridge) => {
  canvasBridge = bridge
}

export const getCanvasBridge = (): CanvasBridge | null => {
  return canvasBridge
}

export const setEventChainCompletedHandler = (handler: () => Promise<void>) => {
  eventChainCompletedHandler = handler
}

export const getEventChainCompletedHandler = (): (() => Promise<void>) | null => {
  return eventChainCompletedHandler
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

/**
 * Создает PendingAchievement из Achievement объекта
 */
export const createPendingAchievement = (achievement: NormalizedAchievement): PendingAchievement => ({
  title: achievement.name,
  description: achievement.description,
  icon: achievement.icon,
  xpReward: achievement.xpReward
})

export const addPendingBubbleRemoval = (removal: PendingBubbleRemoval, requiresModal: boolean = true) => {
  if (!requiresModal) {
    // Если модалка не требуется - удаляем сразу
    const canvasBridge = getCanvasBridge()
    if (canvasBridge) {
      // Находим пузырь по ID и удаляем его
      canvasBridge.removeBubble(removal.bubbleId, removal.xpAmount, removal.isPhilosophyNegative)
    }
    return
  }
  
  pendingBubbleRemovals.value.push(removal)
}

export const useModals = () => {
  const sessionStore = useSessionStore()
  const modalStore = useModalStore()
  const levelStore = useLevelStore()
  const { unlockAchievement } = useAchievement()
  const { gainXP, losePhilosophyLife, visitBubble } = useSession()

  const isProcessingBubbleModal = ref(false)

  // Создаем адаптеры для stores
  const createAdapters = () => {
    return {
      sessionAdapter: {
        session: {
          currentXP: sessionStore.currentXP,
          currentLevel: sessionStore.currentLevel,
          visitedBubbles: sessionStore.visitedBubbles
        }
      } as ModalSessionStore,
      levelAdapter: {
        getLevelByNumber: (level: number) => levelStore.getLevelByNumber(level)
      } as ModalLevelStore,
      achievementAdapter: {
        unlockAchievement: (id: string, showModal?: boolean) => unlockAchievement(id, showModal)
      } as ModalAchievementStore,
      modalAdapter: {
        modals: modalStore.modals,
        data: modalStore.data,
        currentEventChain: modalStore.currentEventChain,
        currentModal: modalStore.currentModal,
        pendingAchievements: modalStore.pendingAchievements,
        pendingLevelAchievements: modalStore.pendingAchievements,
        enqueueModal: (modal: { type: keyof ModalStates; data: ModalDataUnion['data']; priority: number }) => modalStore.enqueueModal(modal),
        closeModal: (key: keyof ModalStates) => modalStore.closeModal(key),
        closeCurrentModal: () => modalStore.closeCurrentModal(),
        startEventChain: (chain: EventChain) => modalStore.startEventChain(chain),
        processEventChain: () => modalStore.processEventChain(),
        clearQueue: () => modalStore.clearQueue(),
        setAchievement: (achievement: PendingAchievement | null) => modalStore.setAchievement(achievement),
        getNextPendingAchievement: () => modalStore.getNextPendingAchievement(),
        setCurrentBonus: (bonus: NormalizedBonus) => modalStore.setCurrentBonus(bonus)
      } as ModalModalStore
    }
  }

  // Создаем фабрику use cases
  const createFactory = () => {
    const adapters = createAdapters()
    return new ModalUseCaseFactory(
      adapters.sessionAdapter,
      adapters.levelAdapter,
      adapters.achievementAdapter,
      adapters.modalAdapter
    )
  }

  const checkAndAddLevelAchievement = async (
    xpResult: any,
    levelAchievements: PendingAchievement[]
  ): Promise<void> => {
    if (xpResult?.leveledUp && xpResult.newLevel === 2) {
      const levelAchievement = await unlockAchievement('first-level-master')
      if (levelAchievement) {
        levelAchievements.push(createPendingAchievement(levelAchievement))
      }
    }
  }

  /**
   * Создает базовый Event Chain конфиг
   */
  const createEventChainConfig = (
    type: EventChain['type'],
    achievements: PendingAchievement[],
    levelAchievements: PendingAchievement[],
    xpResult: any,
    context: any = {}
  ) => ({
    id: Date.now().toString(),
    type,
    pendingAchievements: achievements,
    pendingLevelAchievements: levelAchievements,
    pendingLevelUp: xpResult?.leveledUp ? {
      level: xpResult.newLevel!,
      data: xpResult.levelData
    } : null,
    currentStep: (type === 'manual') ? 'achievement' as const : 'achievement' as const,
    context
  })

  /**
   * Обрабатывает достижение и создает Event Chain
   */
  const processAchievementEventChain = async (
    achievementId: string,
    chainType: EventChain['type']
  ) => {
    try {
      const factory = createFactory()
      const useCase = factory.createProcessAchievementEventChainUseCase()
      
      const result = await useCase.execute({ achievementId, chainType })
      
      if (!result.success) {
        // Ачивка уже получена или недоступна
      }
    } catch (error) {
      // Игнорируем ошибки
    }
  }

  // Функция для обработки завершения Event Chain (вызывается из modal store)
  const handleEventChainCompleted = async () => {
    await processPendingBubbleRemovals()
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

  const processPendingBubbleRemovals = async () => {
    if (!hasActiveModals.value && pendingBubbleRemovals.value.length > 0) {
      const canvas = getCanvasBridge()
      if (canvas) {
        for (const removal of pendingBubbleRemovals.value) {
          await canvas.removeBubble(removal.bubbleId, removal.xpAmount, removal.isPhilosophyNegative)
        }
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
    setTimeout(async () => {
      await processPendingBubbleRemovals()
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
      await visitBubble(bubble.id)
      
      // Определяем количество XP в зависимости от типа пузыря
      let xpGained: number
      if (bubble.isTough) {
        // Крепкие пузыри дают XP в зависимости от skill level (как обычные пузыри)
        xpGained = XP_CALCULATOR.getBubbleXP(bubble.skillLevel || 'novice')
      } else if (bubble.isHidden) {
        // Скрытые пузыри дают XP в зависимости от skill level
        xpGained = XP_CALCULATOR.getBubbleXP(bubble.skillLevel || 'novice')
      } else {
        // Обычные пузыри дают XP в зависимости от skill level
        xpGained = XP_CALCULATOR.getBubbleXP(bubble.skillLevel || 'novice')
      }
      
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
      const bubbleAchievementMap: Record<number, string> = {
        10: 'bubble-explorer-10',
        30: 'bubble-explorer-30',
        50: 'bubble-explorer-50'
      }

      const achievementId = bubbleAchievementMap[bubblesCount]
      if (achievementId) {
        const achievement = await unlockAchievement(achievementId)
        if (achievement) {
          achievements.push(createPendingAchievement(achievement))
        }
      }

      // Проверяем ачивку за первый крепкий пузырь
      if (bubble.isTough && !sessionStore.hasUnlockedFirstToughBubbleAchievement) {
        const toughAchievement = await unlockAchievement('tough-bubble-popper')
        if (toughAchievement) {
          achievements.push(createPendingAchievement(toughAchievement))
        }
      }

      // Собираем ОТДЕЛЬНО level ачивки
      const levelAchievements: PendingAchievement[] = []

      // Проверяем level achievement (включая дополнительное начисление XP для bubble chains)
      if (xpResult.leveledUp && xpResult.newLevel === 2) {
        const levelAchievement = await unlockAchievement('first-level-master')
        if (levelAchievement) {
          // Получаем XP от level achievement тоже (особенность bubble chains)
          const levelXpResult = await gainXP(levelAchievement.xpReward)
          levelAchievements.push(createPendingAchievement(levelAchievement))
          // Обновляем xpResult если level achievement дал еще level up
          if (levelXpResult.leveledUp) {
            xpResult = levelXpResult
          }
        }
      }

      // Запускаем Event Chain с разделенными ачивками
      modalStore.startEventChain({
        type: 'bubble',
        pendingAchievements: achievements,           // Только bubble ачивки
        pendingLevelAchievements: levelAchievements, // Отдельно level ачивки
        pendingLevelUp: xpResult.leveledUp && xpResult.levelData ? {
          level: xpResult.newLevel!,
          data: {
            level: xpResult.levelData.level,
            title: xpResult.levelData.title || `Уровень ${xpResult.newLevel}`,
            description: xpResult.levelData.description || `Поздравляем! Вы достигли ${xpResult.newLevel} уровня!`,
            icon: xpResult.levelData.icon || '✨',
            currentXP: xpResult.levelData.currentXP,
            xpGained: xpResult.levelData.xpGained,
            xpRequired: 0
          }
        } : null,
        currentStep: 'bubble',
        context: {
          bubble,
          xpResult: {
            xpGained,
            livesLost: 0,
            agreementChange: 0,
            isPhilosophyNegative: false,
            ...xpResult
          }
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
    return startBubbleEventChain(bubble)
  }

  const continueBubbleModal = async () => {
    // Просто закрываем модалку, Event Chain система сама продолжит цепочку
    closeModalWithLogic('bubble')
  }

  // Level Up Modal
  const openLevelUpModal = (level: number, payload?: any) => {
    // Level Up Modal теперь работает только через Event Chain
    const levelData = levelStore.getLevelByNumber(level)

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
          icon: levelData?.icon || '✨',
          currentXP: sessionStore.session?.currentXP || 0,
          xpGained: 0,
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
      data: { question, bubbleId: bubbleId || 0 },
      priority: MODAL_PRIORITIES.philosophy
    })
  }

  const handlePhilosophyResponse = async (response: { type: 'selected', optionId: string } | { type: 'custom', answer: string }) => {
    const question = modalStore.data.currentQuestion
    const bubbleId = modalStore.data.philosophyBubbleId

    if (!question) return

    const { useSession } = await import('@/composables/useSession')
    const { saveSelectedPhilosophyAnswer, saveCustomPhilosophyAnswer } = useSession()

    let xpAmount: number
    let isNegative = false

    if (response.type === 'selected') {
      // Обработка выбранного ответа
      const selectedOption = question.options.find(o => String(o.id) === response.optionId)
      if (!selectedOption) return

      isNegative = selectedOption.livesLost > 0

      // Сохраняем выбранный ответ
      await saveSelectedPhilosophyAnswer(question.id, selectedOption.text, question.question)

      // Определяем количество XP в зависимости от agreementLevel
      xpAmount = XP_CALCULATOR.getPhilosophyXP(selectedOption.agreementLevel)
    } else {
      // Обработка кастомного ответа
      await saveCustomPhilosophyAnswer(question.id, response.answer, question.question)

      xpAmount = XP_CALCULATOR.getPhilosophyBubbleXP({isCustom: true})
    }

    // Помечаем пузырь как посещенный СРАЗУ
    if (bubbleId) {
      await visitBubble(bubbleId)
    }

    // Обрабатываем ответ
    let xpResult = null
    if (isNegative) {
      // Для негативных ответов: даем XP но отнимаем жизнь
      xpResult = await gainXP(xpAmount)
      const isGameOver = await losePhilosophyLife()
      if (isGameOver) {
        closeModalWithLogic('philosophy')
        openGameOverModal()
        return
      }
      // Если игра не окончена, но жизнь потеряна - продолжаем обработку
    } else {
      // Начисляем XP за положительные/кастомные ответы
      xpResult = await gainXP(xpAmount)
    }

    if (bubbleId) {
      addPendingBubbleRemoval({
        bubbleId,
        xpAmount,
        isPhilosophyNegative: isNegative
      })
    }

    // Закрываем модалку ПОСЛЕ лопания пузыря
    closeModalWithLogic('philosophy')

    // Выдаем ачивку за первый философский пузырь (любой ответ)
    const achievement = await unlockAchievement('philosophy-master')
    if (achievement) {
      const achievementResult = await gainXP(achievement.xpReward)

      // Определяем финальный xpResult (от философии + от ачивки)
      const finalXpResult = achievementResult.leveledUp ? achievementResult : xpResult

      // Создаем массив основных ачивок
      const achievements: PendingAchievement[] = [createPendingAchievement(achievement)]

      // Создаем массив level ачивок
      const levelAchievements: PendingAchievement[] = []

      // Проверяем level achievement
      await checkAndAddLevelAchievement(finalXpResult, levelAchievements)

      // Запускаем Event Chain для философского пузыря
      modalStore.startEventChain(createEventChainConfig(
        'bubble',
        achievements,
        levelAchievements,
        finalXpResult,
        { xpResult: finalXpResult, bubbleId: bubbleId || undefined }
      ))
    } else if (xpResult && xpResult.leveledUp) {
      // Если нет ачивки, но есть level up - показываем только level up
      openLevelUpModal(xpResult.newLevel!, xpResult.levelData)
    }
  }

  // Обертки для совместимости
  const handlePhilosophyAnswer = async (optionId: string) => {
    await handlePhilosophyResponse({ type: 'selected', optionId })
  }

  const handlePhilosophyCustomAnswer = async (answer: string) => {
    await handlePhilosophyResponse({ type: 'custom', answer })
  }

  const closePhilosophyModal = () => closeModalWithLogic('philosophy')

  // Game Over Modal
  const openGameOverModal = () => {
    modalStore.enqueueModal({
      type: 'gameOver',
      data: {
        currentXP: sessionStore.session?.currentXP || 0,
        currentLevel: sessionStore.session?.currentLevel || 1,
        finalScore: 0
      },
      priority: MODAL_PRIORITIES.gameOver
    })
  }

  const closeGameOverModal = () => closeModalWithLogic('gameOver')

  const restartGame = async () => {
    modalStore.clearQueue() // Очищаем очередь модалок и event chains

    const { useApp } = await import('@/composables/useApp')
    const { resetGame } = useApp()

    closeModalWithLogic('gameOver')
    resetGame()
  }

  // Achievement Modal
  const openAchievementModal = (achievement: PendingAchievement) => {
    modalStore.enqueueModal({
      type: 'achievement',
      data: { achievement },
      priority: MODAL_PRIORITIES.achievement
    })
  }

  const closeAchievementModal = async () => {
    // Начисляем XP за ачивку (кроме level achievements, которые начисляются отдельно)
    if (modalStore.data.achievement && 
        (!modalStore.currentEventChain || 
         modalStore.currentEventChain.currentStep !== 'levelAchievement')) {
      await gainXP(modalStore.data.achievement.xpReward)
    }

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

  const closeBonusModal = async () => {
    // Закрываем BonusModal
    modalStore.closeModal('bonus')
    modalStore.setCurrentBonus(null)

    // Закрываем панель бонусов
    const { useUiEventStore } = await import('@/stores/ui-event.store')
    const uiEventStore = useUiEventStore()
    uiEventStore.closeBonusPanel()

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

  // Memoir Modal
  const openMemoirModal = (memoir: NormalizedMemoir) => {
    modalStore.enqueueModal({
      type: 'memoir',
      data: { memoir },
      priority: MODAL_PRIORITIES.memoir
    })
  }

  const closeMemoirModal = async () => {
    closeModalWithLogic('memoir')
    
    // Закрываем панель мемуаров
    const { useUiEventStore } = await import('@/stores/ui-event.store')
    const uiEventStore = useUiEventStore()
    uiEventStore.closeMemoirsPanel()
  }

  const handleSecretBubbleDestroyed = async () => {
    try {
      await processAchievementEventChain('secret-bubble-discoverer', 'manual')
    } catch (error) {
      // Игнорируем ошибки ачивки - пузырь должен удалиться в любом случае
    }
  }

  // Убираем отдельную обработку, так как достижение теперь интегрировано в Event Chain
  // const handleToughBubbleDestroyed = async () => {
  //   await processAchievementEventChain('tough-bubble-popper', 'manual')
  // }

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
    handlePhilosophyCustomAnswer,
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

    // Memoir
    openMemoirModal,
    closeMemoirModal,

    // Handlers
    handleSecretBubbleDestroyed
  }
}
