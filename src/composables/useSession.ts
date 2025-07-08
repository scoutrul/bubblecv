import { computed } from 'vue'
import { useSessionStore, useUiEventStore, useLevelStore } from '@/stores'
import { useAchievement } from './useAchievement'
import { GAME_CONFIG, maxGameLevel } from '@/config'
import { generateSessionId } from '@/utils/ui'
import type { NormalizedBubble } from '@/types/normalized'

export function useSession() {
  const sessionStore = useSessionStore()
  const uiEventStore = useUiEventStore()
  const levelStore = useLevelStore()
  const { unlockAchievement, resetAchievements } = useAchievement()

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
      
      if (newLevel === 2) {
        const achievement = await unlockAchievement('first-level-master')
        if (achievement) {
          sessionStore.addXP(achievement.xpReward)
        }
      } else if (newLevel === maxGameLevel) {
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

  const gainPhilosophyXP = async (): Promise<boolean> => {
    const achievement = await unlockAchievement('philosophy-master')
    if (achievement) {
      const result = await gainXP(achievement.xpReward)
      return result.leveledUp
    }
    
    return false
  }

  const losePhilosophyLife = async (): Promise<boolean> => {
    if (!sessionStore.session) return false

    await loseLives()
    return false
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
        const result = await gainXP(achievement.xpReward)
      }
    }
  }

  const visitBubble = async (bubbleId: NormalizedBubble['id']): Promise<void> => {
    if (!sessionStore.session) return

    if (!sessionStore.session.visitedBubbles.includes(bubbleId)) {
      sessionStore.addVisitedBubble(bubbleId)
    }
  }

  const updateCurrentYear = (currYear: number) => {
    if (sessionStore.session) {
      sessionStore.setCurrentYear(currYear)
    }
  }
  
  const startSession = (): void => {
    resetAchievements()
    
    sessionStore.createSession({
      id: generateSessionId(),
      currentXP: 0,
      currentLevel: 1,
      lives: GAME_CONFIG.initialLives,
      visitedBubbles: [],
      agreementScore: 0,
      gameCompleted: false,
      hasDestroyedToughBubble: false,
      startTime: new Date(),
      lastActivity: new Date(),
      hasUnlockedFirstToughBubbleAchievement: false,
      currentYear: GAME_CONFIG.initialYear
    })
    
    window.dispatchEvent(new CustomEvent('game-reset'))
  }

  const unlockFirstToughBubbleAchievement = async (): Promise<boolean> => {
    if (!sessionStore.session || sessionStore.session.hasUnlockedFirstToughBubbleAchievement) return false
    
    sessionStore.setHasDestroyedToughBubble(true)
    sessionStore.setHasUnlockedFirstToughBubbleAchievement(true)
    
    const achievement = await unlockAchievement('tough-bubble-popper')
    if (achievement) {
      const result = await gainXP(achievement.xpReward)
      return true
    }
    
    return false
  }

  return {
    gainXP,
    gainPhilosophyXP,
    losePhilosophyLife,
    visitBubble,
    startSession,
    unlockFirstToughBubbleAchievement,
    updateCurrentYear
  }
}