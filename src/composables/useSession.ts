import { ref, computed, watch } from 'vue'
import { useSessionStore, useUiEventStore, useLevelStore, useModalStore } from '@/stores'
import { useAchievement } from '@/composables/useAchievement'
import { useBonuses } from '@/composables/useBonuses'
import { GAME_CONFIG, maxGameLevel } from '@/config'
import { generateSessionId } from '@/utils/ui'
import { getEventBridge } from '@/composables/useUi'
import type { NormalizedBubble } from '@/types/normalized'

export function useSession() {
  const sessionStore = useSessionStore()
  const uiEventStore = useUiEventStore()
  const levelStore = useLevelStore()
  const { unlockAchievement, resetAchievements } = useAchievement()
  const { unlockBonusForLevel } = useBonuses()
  const modalStore = useModalStore()

  const yearTransitionTrigger = ref(false)

  // Функция для показа модалки ачивки
  const showAchievementModal = (achievement: any) => {
    // Импортируем useModals динамически чтобы избежать циклических зависимостей
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

  const canLevelUp = computed(() => {
    if (!sessionStore.session) return false
    const level = sessionStore.session.currentLevel

    if (level >= maxGameLevel) return false

    const requiredXPForNextLevel = GAME_CONFIG.levelRequirements[(level + 1) as keyof typeof GAME_CONFIG.levelRequirements]
    const canLevel = sessionStore.currentXP >= requiredXPForNextLevel

    return canLevel
  })

  const gainXP = async (amount: number): Promise<{ leveledUp: boolean; newLevel?: number; levelData?: any }> => {
    if (!sessionStore.session) {
      return { leveledUp: false }
    }

    sessionStore.addXP(amount)
    uiEventStore.queueShake('xp')

    let leveledUp = false
    let newLevel = sessionStore.session.currentLevel

    while (canLevelUp.value) {
      newLevel = sessionStore.session.currentLevel + 1
      sessionStore.setLevel(newLevel)
      uiEventStore.queueShake('level')
      leveledUp = true

      // Разблокируем бонус для нового уровня
      unlockBonusForLevel(newLevel)

      // Не обрабатываем level achievements здесь - они будут обработаны в Event Chain
      if (newLevel === maxGameLevel) {
        const achievement = await unlockAchievement('final-level-master')
        if (achievement) {
          sessionStore.addXP(achievement.xpReward)
        }
      }
    }

    if (leveledUp) {
      const levelData = levelStore.getLevelByNumber(newLevel)
      const icon = ['👋', '🤔', '📚', '🤝', '🤜🤛'][newLevel - 1] || '⭐'

      console.log('Level up!', { newLevel, currentXP: sessionStore.currentXP, amount })

      return {
        leveledUp: true,
        newLevel,
        levelData: {
          level: newLevel,
          title: levelData?.title,
          description: levelData?.description,
          currentXP: sessionStore.currentXP,
          xpGained: amount,
          unlockedFeatures: levelData?.unlockedFeatures ?? [],
          icon
        }
      }
    }

    return { leveledUp: false }
  }

  const losePhilosophyLife = async (): Promise<boolean> => {
    if (!sessionStore.session) return false

    await loseLives()
    return sessionStore.session.lives === 0
  }

  const loseLives = async (amount: number = 1): Promise<void> => {
    if (!sessionStore.session) return

    if (amount >= sessionStore.session.lives) {
      sessionStore.setLives(0)
      sessionStore.setGameCompleted(true)
      uiEventStore.queueShake('lives')
      return
    }

    sessionStore.setLives(Math.max(0, sessionStore.session.lives - amount))

    if (sessionStore.session.lives === 0) {
      sessionStore.setGameCompleted(true)
    }

    uiEventStore.queueShake('lives')

    if (sessionStore.session.lives === 1) {
      const achievement = await unlockAchievement('on-the-edge')
      if (achievement) {
        await gainXP(achievement.xpReward)
        showAchievementModal(achievement)
      }
    }
  }

  const visitBubble = async (bubbleId: NormalizedBubble['id']): Promise<void> => {
    if (!sessionStore.session) return

    if (!sessionStore.session.visitedBubbles.includes(bubbleId)) {
      sessionStore.addVisitedBubble(bubbleId)
    }
  }

  const updateCurrentYear = (currYear: number, triggerAnimation: boolean = false) => {
    if (sessionStore.session) {
      sessionStore.setCurrentYear(currYear)
      if (triggerAnimation) {
        yearTransitionTrigger.value = !yearTransitionTrigger.value
      }
    }
  }

  const startSession = (options: { lives?: number } = { lives: GAME_CONFIG.maxLives }): void => {
    resetAchievements()

    sessionStore.createSession({
      id: generateSessionId(),
      currentXP: 0,
      currentLevel: 1,
      lives: options.lives ?? GAME_CONFIG.initialLives,
      visitedBubbles: [],
      agreementScore: 0,
      gameCompleted: false,
      hasDestroyedToughBubble: false,
      startTime: new Date(),
      lastActivity: new Date(),
      hasUnlockedFirstToughBubbleAchievement: false,
      currentYear: GAME_CONFIG.initialYear
    })

    // Заменяем dispatchEvent на прямой вызов
    const bridge = getEventBridge()
    if (bridge) {
      bridge.resetCanvas()
    }
  }

  const saveCustomPhilosophyAnswer = async (questionId: string, answer: string, questionText: string) => {
    if (!sessionStore.session) return
    
    if (!sessionStore.session.customPhilosophyAnswers) {
      sessionStore.session.customPhilosophyAnswers = {}
    }
    
    if (!sessionStore.session.allPhilosophyAnswers) {
      sessionStore.session.allPhilosophyAnswers = {}
    }
    
    sessionStore.session.customPhilosophyAnswers[questionId] = answer
    sessionStore.session.allPhilosophyAnswers[questionId] = {
      type: 'custom',
      answer,
      questionText
    }
  }

  const saveSelectedPhilosophyAnswer = async (questionId: string, selectedOptionText: string, questionText: string) => {
    if (!sessionStore.session) return
    
    if (!sessionStore.session.allPhilosophyAnswers) {
      sessionStore.session.allPhilosophyAnswers = {}
    }
    
    sessionStore.session.allPhilosophyAnswers[questionId] = {
      type: 'selected',
      answer: selectedOptionText,
      questionText
    }
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