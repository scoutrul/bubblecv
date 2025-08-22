import { ref, computed } from 'vue'
import { useSessionStore, useModalStore, useLevelsStore } from '@/stores'
import { useAchievement } from '@/composables/useAchievement'
import { useSession } from '@/composables/useSession'
import { XP_CALCULATOR } from '@/utils/'
import { ModalUseCaseFactory } from '@/usecases/modal'
import type { NormalizedAchievement, NormalizedBonus, NormalizedMemoir } from '@/types/normalized'
import type { BubbleNode } from '@/types/canvas'
import type { Question } from '@/types/data'
import type { ModalStates, PendingBubbleRemoval, CanvasBridge, PendingAchievement, EventChain, XPResult, ModalDataUnion, LevelUpData } from '@/types/modals'
import type { 
  ModalSessionStore, 
  ModalLevelStore, 
  ModalAchievementStore, 
  ModalModalStore 
} from '@/usecases/modal'
import { MODAL_PRIORITIES } from '@/types/modals'
import { useGameMode } from '@/composables/useGameMode'

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

// Utils

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
      const bubble = canvasBridge.findBubbleById(removal.bubbleId)
      if (bubble) {
        // Полный набор эффектов
        canvasBridge.removeBubbleWithEffects({
          bubble,
          xpAmount: removal.xpAmount,
          isPhilosophyNegative: removal.isPhilosophyNegative,
          skipFloatingText: true
        })
      } else {
        canvasBridge.removeBubble(removal.bubbleId, removal.xpAmount, removal.isPhilosophyNegative)
      }
    }
    return
  }
  
  pendingBubbleRemovals.value.push(removal)
}



export const useModals = () => {
  const sessionStore = useSessionStore()
  const modalStore = useModalStore()
  const levelStore = useLevelsStore()
  const { unlockAchievement, unlockedCount } = useAchievement()
const { isRetroMode } = useGameMode()
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
      adapters.achievementAdapter,
      adapters.modalAdapter
    )
  }

  /**
   * Создает базовый Event Chain конфиг
   */
  const createEventChainConfig = (
    type: EventChain['type'],
    achievements: PendingAchievement[],
    levelAchievements: PendingAchievement[],
    xpResult: { leveledUp: boolean; newLevel?: number; levelData?: { level: number; title?: string; description?: string; currentXP: number; xpGained: number; icon: string; isProjectTransition?: boolean } },
    context: Record<string, unknown> = {}
  ) => {
    // Создаем pendingLevelUp если произошел level up
    const pendingLevelUp = xpResult?.leveledUp && xpResult.levelData ? {
      level: xpResult.newLevel || xpResult.levelData.level,
      data: {
        level: xpResult.newLevel || xpResult.levelData.level,
        title: xpResult.levelData.title || `Уровень ${xpResult.newLevel || xpResult.levelData.level}`,
        description: xpResult.levelData.description || `Поздравляем! Вы достигли ${xpResult.newLevel || xpResult.levelData.level} уровня!`,
        icon: xpResult.levelData.icon,
        currentXP: xpResult.levelData.currentXP,
        xpGained: xpResult.levelData.xpGained,
        xpRequired: 0, // Добавляем недостающее поле
        isProjectTransition: xpResult.levelData.isProjectTransition
      } as LevelUpData
    } : null

    // Определяем начальный шаг
    let initialStep: EventChain['currentStep'] = 'bubble'
    
    if (achievements.length > 0) {
      initialStep = 'achievement'
    } else if (pendingLevelUp) {
      initialStep = 'levelUp'
    } else if (levelAchievements.length > 0) {
      initialStep = 'levelAchievement'
    }

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      currentStep: initialStep,
      pendingAchievements: achievements,
      pendingLevelUp,
      pendingLevelAchievements: levelAchievements,
      context
    }
  }

  /**
   * Обрабатывает достижение и создает Event Chain
   */
  const processAchievementEventChain = async (
    achievementId: string,
    chainType: EventChain['type']
  ) => {
    const factory = createFactory()
    const useCaseModal = factory.createProcessAchievementEventChainUseCase()
    await useCaseModal.execute({ achievementId, chainType })
  }

  // Функция для обработки завершения Event Chain (вызывается из modal store)
  const handleEventChainCompleted = async () => {
    // Принудительно очищаем все модалки перед обработкой пузырей
    Object.keys(modalStore.modals).forEach(key => {
      modalStore.modals[key as keyof typeof modalStore.modals] = false
    })
    
    // Сбрасываем текущий event chain
    modalStore.currentEventChain = null
    modalStore.currentModal = null
    
    await processPendingBubbleRemovals()
  }

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
    // Fallback: если есть пузыри в очереди, но модалки "застряли", принудительно очищаем их
    if (pendingBubbleRemovals.value.length > 0 && hasActiveModals.value) {
      Object.keys(modalStore.modals).forEach(key => {
        modalStore.modals[key as keyof typeof modalStore.modals] = false
      })
      modalStore.currentEventChain = null
      modalStore.currentModal = null
    }
    
    if (!hasActiveModals.value && pendingBubbleRemovals.value.length > 0) {
      const canvas = getCanvasBridge()
      if (canvas) {
        for (const removal of pendingBubbleRemovals.value) {
          // Находим пузырь до любых действий (или используем снапшот)
          const bubble = canvas.findBubbleById(removal.bubbleId) || removal.bubble

          // Отмечаем визит пузыря
          await visitBubble(removal.bubbleId)

          // Теперь начисляем XP за пузырь (после закрытия модалки)
          const xpResult = await gainXP(removal.xpAmount)

          // Если произошел level up, создаем новый Event Chain для level-up
          if (xpResult?.leveledUp && xpResult.levelData) {
            
            // Создаем пустой массив level achievements (как в других местах)
            const levelAchievements: PendingAchievement[] = []
            
            // Создаем новый Event Chain для level-up
            const levelUpEventChainConfig = createEventChainConfig(
              'manual', // используем тип 'manual' как в openLevelUpModal
              [], // нет новых achievements
              levelAchievements,
              { 
                leveledUp: true, 
                newLevel: xpResult.newLevel,
                levelData: xpResult.levelData 
              },
              {} // пустой context
            )
            
            // Запускаем новый Event Chain
            modalStore.startEventChain(levelUpEventChainConfig)
          }

          // Удаляем пузырь с полным набором эффектов, избегая дублирования floating text
          if (bubble) {
            await canvas.removeBubbleWithEffects({
              bubble,
              xpAmount: removal.xpAmount,
              isPhilosophyNegative: removal.isPhilosophyNegative,
              skipFloatingText: true
            })
          } else {
            // Fallback на старый метод
            await canvas.removeBubble(removal.bubbleId, removal.xpAmount, removal.isPhilosophyNegative)
          }

          // Создаем floating text после удаления (централизовано)
          if (bubble) {
            if (removal.xpAmount > 0) {
              canvas.createFloatingText({
                x: bubble.x,
                y: bubble.y,
                text: (isRetroMode?.value ? '+ ❤️' : `+${removal.xpAmount} XP`),
                type: 'xp',
                color: (isRetroMode?.value ? '#ef4444' : '#22c55e')
              })
            }
            if (removal.isPhilosophyNegative) {
              canvas.createFloatingText({
                x: bubble.x,
                y: bubble.y,
                text: '💔',
                type: 'life',
                color: '#ef4444'
              })
            }
          }

          // Если это был крепкий пузырь и получена ачивка tough-bubble-popper, добавляем скрытые пузыри
          const wasToughBubble = Boolean(bubble && bubble.isTough)
          if (wasToughBubble && sessionStore.hasUnlockedFirstToughBubbleAchievement) {
            await addHiddenBubblesAfterToughAchievement()
          }
        }
        pendingBubbleRemovals.value = []
        
        // Обновляем канвас для добавления новых философских пузырей (особенно в project-режиме)
        if (canvas.updateCanvasBubbles) {
          canvas.updateCanvasBubbles()
        }

        // After removals: check Retro completion and show final congrats once
        await maybeShowFinalCongrats()
      }
    }
  }

  const closeModalWithLogic = (key: keyof ModalStates) => {
    if (modalStore.currentEventChain || modalStore.currentModal) {
      modalStore.closeCurrentModal()
    } else {
      modalStore.closeModal(key)
    }
  }

  // Функция для добавления скрытых пузырей после получения ачивки tough-bubble-popper
  const addHiddenBubblesAfterToughAchievement = async () => {
    const { useBubbleStore } = await import('@/stores/bubble.store')
    const { getYearRange } = await import('@/utils')
    const bubbleStore = useBubbleStore()
    
    // Получаем минимальный год от доступных пузырей (как в таймлайне)
    const yearRange = getYearRange(bubbleStore.bubbles)
    const startYear = yearRange.startYear
    const currentYear = sessionStore.currentYear
    
    // Добавляем скрытые пузыри для всех лет от минимального до текущего
    const yearsToAdd: number[] = []
    for (let year = startYear; year <= currentYear; year++) {
      // Проверяем, есть ли уже скрытый пузырь для этого года
      const existingHiddenBubble = bubbleStore.bubbles.find(b => 
        b.isHidden && b.year === year
      )
      
      // Проверяем, не был ли этот пузырь уже лопнут
      // ID скрытого пузыря: -(year * 10000 + 9999)
      const hiddenBubbleId = -(year * 10000 + 9999)
      const isPopped = sessionStore.visitedBubbles.includes(hiddenBubbleId)
      
      if (!existingHiddenBubble && !isPopped) {
        yearsToAdd.push(year)
      }
    }
    
    if (yearsToAdd.length > 0) {
      bubbleStore.addHiddenBubbles(yearsToAdd)
      
      // Принудительно обновляем канвас с новыми скрытыми пузырями
      await import('vue').then(({ nextTick }) => {
        nextTick(async () => {
          // Получаем bridge для обновления канваса
          const canvasBridge = getCanvasBridge()
          if (canvasBridge && canvasBridge.updateCanvasBubbles) {
            canvasBridge.updateCanvasBubbles()
            console.log(`🎯 Добавлено ${yearsToAdd.length} скрытых пузырей после пробития первого крепкого пузыря (годы: ${startYear}-${currentYear})`)
          } else {
            console.warn('Canvas bridge not available for updating bubbles')
          }
        })
      })
    }
  }

  // Check retro completion and show final congrats
  const maybeShowFinalCongrats = async () => {
    try {
      // Show only when no active modals and not already completed
      if (hasActiveModals.value) return
      if (sessionStore.gameCompleted) return

      // Ensure RETRO mode by checking negative old bubble IDs presence
      const { api } = await import('@/api')
      const { data: oldBubbles } = await api.getOldBubbles()
      if (!oldBubbles.length) return

      const retroIds = oldBubbles.map(b => b.id)
      const visited = sessionStore.visitedBubbles
      const allRetroPopped = retroIds.every(id => visited.includes(id))
      if (!allRetroPopped) return

      // Aggregate stats
      const { useBonusStore } = await import('@/stores/bonus.store')
      const { useMemoirStore } = await import('@/stores/memoir.store')
      const { useAchievmentStore } = await import('@/stores/achievement.store')
      const bonusStore = useBonusStore()
      const memoirStore = useMemoirStore()
      const achievementStore = useAchievmentStore()

      // Unlock ALL bonuses and memoirs upon game completion
      bonusStore.bonuses.forEach(b => { b.isUnlocked = true })
      memoirStore.memoirs.forEach(m => { m.isUnlocked = true })

      // Build type index from all datasets
      const { api: apiLocal } = await import('@/api')
      const [skills, projects, olds] = await Promise.all([
        apiLocal.getBubbles(),
        apiLocal.getProjectBubbles(),
        apiLocal.getOldBubbles()
      ])

      const projectOffset = 10000
      const index = new Map<number, 'normal'|'tough'|'hidden'|'philosophy'>()
      const register = (b: any) => {
        if (b.isQuestion) { index.set(b.id, 'philosophy'); return }
        if (b.isHidden) { index.set(b.id, 'hidden'); return }
        if (b.isTough) { index.set(b.id, 'tough'); return }
        index.set(b.id, 'normal')
      }
      skills.data.forEach(register)
      projects.data.forEach(register)
      olds.data.forEach(register)

      const totals = { normal: 0, tough: 0, hidden: 0, philosophy: 0 }
      for (const id of visited) {
        const t = index.get(id)
        if (t) totals[t]++
      }

      const payload = {
        totalBubbles: visited.length,
        byType: totals,
        totalXP: sessionStore.currentXP,
        bonusesUnlocked: bonusStore.unlockedBonuses.length,
        achievementsUnlocked: unlockedCount.value,
        memoirsUnlocked: memoirStore.unlockedMemoirs.length
      }

      // Mark completed and show modal
      sessionStore.setGameCompleted(true)
      modalStore.enqueueModal({ type: 'finalCongrats', data: payload, priority: MODAL_PRIORITIES.finalCongrats })
    } catch (e) {
      // silent
    }
  }

  // Force-complete the game: mark all final (retro) bubbles as visited and remove them from canvas, ignoring any tough mechanics
  const forceCompleteGame = async () => {
    const { api } = await import('@/api')
    const { data: oldBubbles } = await api.getOldBubbles()
    if (!oldBubbles.length) return

    const canvas = getCanvasBridge()
    for (const b of oldBubbles) {
      if (!sessionStore.visitedBubbles.includes(b.id)) {
                 await visitBubble(b.id)
         // Remove visually without XP/life effects
         if (canvas) {
           const bubble = canvas.findBubbleById?.(b.id)
           if (bubble) {
             await canvas.removeBubbleWithEffects({ bubble, xpAmount: 0, isPhilosophyNegative: false, skipFloatingText: true })
           }
         }
      }
    }

    // Show final modal
    await maybeShowFinalCongrats()
  }

  // Новый метод для запуска цепочки событий пузыря
  const startBubbleEventChain = async (bubble: BubbleNode) => {
    if (isProcessingBubbleModal.value) {
      return
    }

    isProcessingBubbleModal.value = true

    try {
      // Не посещаем пузырь и не начисляем XP сразу. Всё произойдет при завершении цепочки.
      
      // Определяем количество XP в зависимости от типа пузыря
      let xpGained = XP_CALCULATOR.getBubbleXP(bubble.skillLevel || 'novice')

      // Добавляем пузырь в очередь на удаление
      addPendingBubbleRemoval({
        bubbleId: bubble.id,
        xpAmount: xpGained,
        isPhilosophyNegative: false,
        bubble
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

      // НЕ начисляем XP здесь! XP будет начислен после закрытия модалки в processPendingBubbleRemovals
      // Создаем Event Chain с временной информацией (XP еще не начислен)
      const eventChainConfig = createEventChainConfig(
        'bubble',
        achievements,
        levelAchievements,
        { leveledUp: false }, // XP еще не начислен, поэтому levelUp = false
        { bubble } // Передаем bubble в context
      )

      modalStore.startEventChain(eventChainConfig)

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
    // Закрываем модалку пузыря
    closeModalWithLogic('bubble')
  }

  // Level Up Modal
  const openLevelUpModal = (level: number, payload?: {
    level: number
    title?: string
    description?: string
    icon?: string
    currentXP: number
    xpGained: number
    xpRequired: number
    isProjectTransition?: boolean
  }) => {
    // Временный отладочный лог
    console.log('🚀 useModals openLevelUpModal called with:', { level, payload })
    
    // Level Up Modal теперь работает только через Event Chain
    const levelData = levelStore.getLevelByNumber(level)

    // Создаем объект с обязательными полями
    const levelUpData: LevelUpData = {
      level: level,
      title: payload?.title || levelData?.title || `Уровень ${level}`,
      description: payload?.description || levelData?.description || `Поздравляем! Вы достигли ${level} уровня!`,
      icon: payload?.icon || levelData?.icon || '✨',
      currentXP: payload?.currentXP || sessionStore.session?.currentXP || 0,
      xpGained: payload?.xpGained || 0,
      xpRequired: payload?.xpRequired || 0,
      isProjectTransition: payload?.isProjectTransition || false
    }

    modalStore.startEventChain({
      type: 'manual',
      pendingAchievements: [],
      pendingLevelAchievements: [],
      pendingLevelUp: {
        level: level,
        data: levelUpData
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

    // Не помечаем визит сразу. Он произойдет при завершении цепочки, перед взрывом.

    // Обрабатываем ответ
    if (isNegative) {
      // Для негативных ответов: отнимаем жизнь
      const isGameOver = await losePhilosophyLife()
      

      
      if (isGameOver) {
        closeModalWithLogic('philosophy')
        openGameOverModal()
        return
      }
      // Если игра не окончена, но жизнь потеряна - продолжаем обработку
    }
    // XP будет начислен в processPendingBubbleRemovals

    if (bubbleId) {
      addPendingBubbleRemoval({
        bubbleId,
        xpAmount, // Передаем xpAmount для начисления в processPendingBubbleRemovals
        isPhilosophyNegative: isNegative,
        bubble: canvasBridge?.findBubbleById ? canvasBridge.findBubbleById(bubbleId) : undefined
      })
    }

    // Закрываем модалку ПОСЛЕ лопания пузыря
    closeModalWithLogic('philosophy')

    // Выдаем ачивку за первый философский пузырь (любой ответ)
    const achievement = await unlockAchievement('philosophy-master')
    if (achievement) {
      const achievementResult = await gainXP(achievement.xpReward)

      // Создаем массив основных ачивок
      const achievements: PendingAchievement[] = [createPendingAchievement(achievement)]

      // Создаем массив level ачивок
      const levelAchievements: PendingAchievement[] = []

      // Запускаем Event Chain для философского пузыря
      modalStore.startEventChain(createEventChainConfig(
        'bubble',
        achievements,
        levelAchievements,
        achievementResult,
        { xpResult: achievementResult, bubbleId: bubbleId || undefined }
      ))
    } else {
      // Если нет ачивки, все равно обрабатываем пузыри сразу
      await processPendingBubbleRemovals()
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
    // Отладочный лог
    console.log('🔒 closeAchievementModal:', {
      hasAchievement: !!modalStore.data.achievement,
      hasEventChain: !!modalStore.currentEventChain,
      currentStep: modalStore.currentEventChain?.currentStep,
      hasPendingLevelUp: !!modalStore.currentEventChain?.pendingLevelUp
    })

    // Начисляем XP за ачивку только если НЕТ активного Event Chain
    // (XP уже начислен в ProcessAchievementEventChainUseCase)
    if (modalStore.data.achievement && !modalStore.currentEventChain) {
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

    // Final
    forceCompleteGame,
  }
}
