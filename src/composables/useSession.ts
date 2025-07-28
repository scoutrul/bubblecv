import { computed, ref } from 'vue'
import { useLevelStore, useSessionStore, useUiEventStore } from '@/stores'
import { useAchievement } from '@/composables/useAchievement'
import { useBonuses } from '@/composables/useBonuses'
import { GAME_CONFIG, maxGameLevel } from '@/config'
import { getEventBridge } from '@/composables/useUi'
import { SessionUseCaseFactory } from '@/usecases/session'
import type { NormalizedBubble } from '@/types/normalized'

export function useSession() {
  const sessionStore = useSessionStore()
  const uiEventStore = useUiEventStore()
  const levelStore = useLevelStore()
  const { unlockAchievement, resetAchievements } = useAchievement()
  const { unlockBonusForLevel, resetBonuses } = useBonuses()

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
      } as any, // Временно используем any для обхода проблем с типами
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
      uiEventAdapter: {
        queueShake: uiEventStore.queueShake
      },
      modalAdapter: {
        openAchievementModal: (achievement: any) => {
          // Используем useModals для открытия модалки достижения
          import('@/composables/useModals').then(({ useModals }) => {
            const { openAchievementModal } = useModals()
            openAchievementModal({
              title: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              xpReward: achievement.xpReward
            })
          })
        }
      },
      canvasAdapter: {
        resetCanvas: () => {
          const bridge = getEventBridge()
          if (bridge) {
            bridge.resetCanvas()
          }
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
      adapters.uiEventAdapter,
      adapters.modalAdapter,
      adapters.canvasAdapter
    )
  }

  const gainXP = async (amount: number): Promise<{ leveledUp: boolean; newLevel?: number; levelData?: any }> => {
    
    const factory = createFactory()
    const gainXPUseCase = factory.createGainXPUseCase()
    const result = await gainXPUseCase.execute({ amount })
    
    if (result.success && result.leveledUp) {
      return {
        leveledUp: true,
        newLevel: result.newLevel,
        levelData: result.levelData
      }
    }
    
    return { leveledUp: false }
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
    saveSelectedPhilosophyAnswer
  }
}
