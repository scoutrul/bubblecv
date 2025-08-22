import { ref } from 'vue'
import { useLevelsStore, useSessionStore } from '@/stores'
import { useAchievement } from '@/composables/useAchievement'
import { useBonuses } from '@/composables/useBonuses'
import { useMemoirs } from '@/composables/useMemoirs'
import { GAME_CONFIG } from '@/config'
import { getEventBridge } from '@/composables/useUi'
import { SessionUseCaseFactory } from '@/usecases/session'
import type { NormalizedBubble } from '@/types/normalized'
import type { GainXPResult } from '@/usecases/session'

export function useSession() {
  const sessionStore = useSessionStore()
  const levelStore = useLevelsStore()
  const { unlockAchievement, resetAchievements } = useAchievement()
  const { unlockBonusForLevel, resetBonuses } = useBonuses()
  const { unlockMemoirForLevel, resetMemoirs } = useMemoirs()

  const yearTransitionTrigger = ref(false)

  // Функция для создания адаптеров с актуальными данными
  const createAdapters = () => {
    return {
      sessionAdapter: {
        session: sessionStore.session,
        currentXP: sessionStore.currentXP,
        createSession: sessionStore.createSession,
        addXP: sessionStore.addXP,
        setLevel: sessionStore.setLevel,
        setLives: sessionStore.setLives,
        setGameCompleted: sessionStore.setGameCompleted,
        addVisitedBubble: sessionStore.addVisitedBubble,
        setCurrentYear: sessionStore.setCurrentYear
      } as unknown as import('@/usecases/session/types').SessionSessionStore, // conforms to expected adapter shape
      levelAdapter: {
        getLevelByNumber: levelStore.getLevelByNumber
      },
      achievementAdapter: {
        unlockAchievement: (id: string, showModal?: boolean) => unlockAchievement(id, showModal),
        resetAchievements
      },
      bonusAdapter: {
        unlockBonusForLevel,
        resetBonuses
      },
      modalAdapter: {
        openAchievementModal: (achievement: {
          title: string
          description: string
          icon: string
          xpReward: number
        }) => {
          // Используем useModals для открытия модалки достижения
          import('@/composables/useModals').then(({ useModals }) => {
            const { openAchievementModal } = useModals()
            openAchievementModal(achievement)
          })
        },

      },
      canvasAdapter: {
        resetCanvas: () => {
          const bridge = getEventBridge()
          if (bridge) {
            bridge.resetCanvas()
          } else {
            // Если bridge еще не установлен, игнорируем сброс canvas
            // Это может произойти при инициализации приложения
          }
        }
      },
      memoirAdapter: {
        resetReadMemoirs: () => {
          // Импортируем useMemoirs для сброса мемуаров
          import('@/composables/useMemoirs').then(({ useMemoirs }) => {
            const memoirs = useMemoirs()
            memoirs.resetMemoirs()
          })
        }
      }
    }
  }

  // Функция для создания фабрики с актуальными данными
  const createFactory = () => {
    const adapters = createAdapters()
    return new SessionUseCaseFactory(
      adapters.sessionAdapter,
      adapters.levelAdapter,
      adapters.achievementAdapter,
      adapters.bonusAdapter,
      adapters.canvasAdapter,
      adapters.modalAdapter,
      adapters.memoirAdapter
    )
  }

  const gainXP = async (amount: number): Promise<{ leveledUp: boolean; newLevel?: number; levelData?: GainXPResult['levelData'] }> => {
    
    const factory = createFactory()
    const gainXPUseCase = factory.createGainXPUseCase()
    const result = await gainXPUseCase.execute({ amount })
    
    if (result.success && result.leveledUp) {
      // Разблокируем мемуар для нового уровня
      if (result.newLevel) {
        await unlockMemoirForLevel(result.newLevel)
      }
      
      return {
        leveledUp: true,
        newLevel: result.newLevel,
        levelData: result.levelData
      }
    }
    
    return { leveledUp: false }
  }

  const handleSecretBubbleDestroyed = async (): Promise<void> => {
    const achievement = await unlockAchievement('secret-bubble-discoverer', true)
    if (achievement) {
      const { useModals } = await import('@/composables/useModals')
      const { openAchievementModal } = useModals()
      openAchievementModal({
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      })
      // XP за ачивку будет начислен при закрытии модалки (см. closeAchievementModal)
    }
  }

  const losePhilosophyLife = async (): Promise<boolean> => {
    const factory = createFactory()
    const loseLivesUseCase = factory.createLoseLivesUseCase()
    const result = await loseLivesUseCase.execute({ amount: 1 })
    return result.success && result.gameCompleted
  }

  const loseLives = async (amount: number = 1): Promise<void> => {
    const factory = createFactory()
    const loseLivesUseCase = factory.createLoseLivesUseCase()
    await loseLivesUseCase.execute({ amount })
  }

  const visitBubble = async (bubbleId: NormalizedBubble['id']): Promise<void> => {
    const factory = createFactory()
    const visitBubbleUseCase = factory.createVisitBubbleUseCase()
    await visitBubbleUseCase.execute({ bubbleId })
  }

  const updateCurrentYear = (currYear: number, triggerAnimation: boolean = false) => {
    const factory = createFactory()
    const updateCurrentYearUseCase = factory.createUpdateCurrentYearUseCase()
    updateCurrentYearUseCase.execute({ year: currYear, triggerAnimation })
    if (triggerAnimation) {
      yearTransitionTrigger.value = !yearTransitionTrigger.value
    }
  }

  const startSession = async (options: { lives?: number } = { lives: GAME_CONFIG.maxLives }): Promise<void> => {
    const factory = createFactory()
    const startSessionUseCase = factory.createStartSessionUseCase()
    await startSessionUseCase.execute({ lives: options.lives })
    
    // Сбрасываем мемуары при старте новой сессии
    resetMemoirs()
  }

  const saveCustomPhilosophyAnswer = async (questionId: string, answer: string, questionText: string) => {
    const factory = createFactory()
    const savePhilosophyAnswerUseCase = factory.createSavePhilosophyAnswerUseCase()
    await savePhilosophyAnswerUseCase.executeCustomAnswer({ questionId, answer, questionText })
  }

  const saveSelectedPhilosophyAnswer = async (questionId: string, selectedOptionText: string, questionText: string) => {
    const factory = createFactory()
    const savePhilosophyAnswerUseCase = factory.createSavePhilosophyAnswerUseCase()
    await savePhilosophyAnswerUseCase.executeSelectedAnswer({ questionId, selectedOptionText, questionText })
  }

  return {
    gainXP,
    losePhilosophyLife,
    visitBubble,
    startSession,
    updateCurrentYear,
    yearTransitionTrigger,
    saveCustomPhilosophyAnswer,
    saveSelectedPhilosophyAnswer,
    handleSecretBubbleDestroyed
  }
}
