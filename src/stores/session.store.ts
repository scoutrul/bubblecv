import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserSession } from '@/types/client'
import { GAME_CONFIG, maxGameLevel } from '@/config/game-config'
import { useUiEventStore } from '@/stores/ui-event.store'
import type { NormalizedBubble } from '@/types/normalized'
import { useModalStore } from '@/stores/modal.store'
import { useAchievmentStore } from '@/stores/achievements.store'

export const useSessionStore = defineStore('sessionStore', () => {
  const modalStore = useModalStore()
  const uiEventStore = useUiEventStore()
  const achievmentStore = useAchievmentStore()

  // State
  const session = ref<UserSession | null>(null)

  // Generate session ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}`
  }

  // Getters
  const currentYear = computed(() => session.value?.currentYear || GAME_CONFIG.initialYear)
  const currentXP = computed(() => session.value?.currentXP || 0)
  const currentLevel = computed(() => session.value?.currentLevel || 1)
  const lives = computed(() => session.value?.lives || GAME_CONFIG.maxLives)
  const visitedBubbles = computed(() => session.value?.visitedBubbles || [])
  const agreementScore = computed(() => session.value?.agreementScore || 0)
  const gameCompleted = computed(() => session.value?.gameCompleted || false)
  const hasUnlockedFirstToughBubbleAchievement = computed(() => session.value?.hasUnlockedFirstToughBubbleAchievement || false)

  const xpProgress = computed(() => {
    if (!session.value) return 0
    const level = session.value.currentLevel
    if (level >= maxGameLevel) return 100
    
    const currentLevelXP = GAME_CONFIG.levelRequirements[level as keyof typeof GAME_CONFIG.levelRequirements]
    const nextLevelXP = GAME_CONFIG.levelRequirements[(level + 1) as keyof typeof GAME_CONFIG.levelRequirements]
    
    const xpRangeForLevel = nextLevelXP - currentLevelXP
    const xpAbovePrevLevel = Math.max(0, currentXP.value - currentLevelXP)
    
    const progress = Math.min((xpAbovePrevLevel / xpRangeForLevel) * 100, 100)
    
    return Math.max(0, Math.min(progress, 100))
  })

  const nextLevelXP = computed(() => {
    if (!session.value) return 0
    const currentLevel = session.value.currentLevel
    if (currentLevel >= maxGameLevel) return 0 // Максимальный уровень
    
    return GAME_CONFIG.levelRequirements[(currentLevel + 1) as keyof typeof GAME_CONFIG.levelRequirements]
  })

  const canLevelUp = computed(() => {
    if (!session.value) return false
    const level = session.value.currentLevel
    
    // Не можем повыситься если уже максимальный уровень
    if (level >= maxGameLevel) return false
    
    // XP необходимый для следующего уровня
    const requiredXPForNextLevel = GAME_CONFIG.levelRequirements[(level + 1) as keyof typeof GAME_CONFIG.levelRequirements]
    const canLevel = currentXP.value >= requiredXPForNextLevel
    
    return canLevel
  })

  const gainXP = async (amount: number): Promise<boolean> => {
    if (!session.value) {
      return false
    }
    
    session.value.currentXP += amount
    
    uiEventStore.queueShake('xp')

    // Проверяем повышение уровня в цикле, чтобы обработать несколько уровней сразу
    let leveledUp = false
    
    // Продолжаем повышать уровень, пока набранный XP достаточен для следующего уровня
    while (canLevelUp.value) {
      const newLevel = session.value.currentLevel + 1
      session.value.currentLevel = newLevel
      uiEventStore.queueShake('level')
      leveledUp = true
      
      // Проверяем достижения за уровни (отложенно)
      if (newLevel === 2) { // Достигли уровня 2 (первое повышение)
        const achievement = await achievmentStore.unlockAchievement('first-level-master')
        if (achievement) {
          // Начисляем XP за достижение
          session.value.currentXP += achievement.xpReward
        }
      } else if (newLevel === maxGameLevel) { // Достигли максимального уровня
        const achievement = await achievmentStore.unlockAchievement('final-level-master')
        if (achievement) {
          // Начисляем XP за достижение
          session.value.currentXP += achievement.xpReward
        }
      }
    }
    
    return leveledUp // Произошло ли повышение уровня
  }

  // Получить XP за правильный ответ на философский вопрос
  const gainPhilosophyXP = async (): Promise<boolean> => {
    // Проверяем достижение "Философ" (если еще не разблокировано)
    
    const achievement = await achievmentStore.unlockAchievement('philosophy-master')
    if (achievement) {
      // Начисляем XP только за достижение (основной XP начисляется отдельно)
      return await gainXP(achievement.xpReward)
    }
    
    // Если достижение уже было разблокировано, не начисляем дополнительный XP
    return false
  }

  // Потерять жизнь за неправильный ответ на философский вопрос
  // TODO вынести в шину управления стейтом игры
  const losePhilosophyLife = async (): Promise<boolean> => {
    if (!session.value) return false

    await loseLives()

    return false
    
  }

  const loseLives = async (amount: number = 1): Promise<void> => {
    if (!session.value) return

    // Для тестов - принудительно устанавливаем жизни в 0, если amount >= session.value.lives
    if (amount >= session.value.lives) {
      // Устанавливаем жизни в 0
      session.value.lives = 0
      session.value.gameCompleted = true
      
      // Показываем Game Over модал через modal store
      modalStore.openGameOverModal({
        currentXP: session.value.currentXP,
        currentLevel: session.value.currentLevel
      })
      
      const uiEventStore = useUiEventStore()
      uiEventStore.queueShake('lives')
      
      return
    }
    
    // Обычная логика для случая, когда жизней остается больше 0
    session.value.lives = Math.max(0, session.value.lives - amount)
    
    // Проверяем, если после отнятия жизней их стало 0, то это Game Over
    if (session.value.lives === 0) {
      session.value.gameCompleted = true
      
      modalStore.openGameOverModal({
        currentXP: session.value.currentXP,
        currentLevel: session.value.currentLevel
      })
    }
    
    const uiEventStore = useUiEventStore()
    uiEventStore.queueShake('lives')

    // Проверяем достижение "На краю" (осталась 1 жизнь)
    if (session.value.lives === 1) {
      
      const achievement = await achievmentStore.unlockAchievement('on-the-edge')
      if (achievement) {
        // Начисляем XP за достижение
        await gainXP(achievement.xpReward)
      }
    }
  }

  const visitBubble = async (bubbleId: NormalizedBubble['id']): Promise<void> => {
    if (!session.value) return

    if (!session.value.visitedBubbles.includes(bubbleId)) {
      session.value.visitedBubbles.push(bubbleId)
    }
  }

  function updateCurrentYear(currYear: number) {
    if(session.value) {
      session.value.currentYear = currYear
    }
  }
  
  const resetSession = async (): Promise<void> => {
    // Сбрасываем состояние сессии
    session.value = {
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
    }

    modalStore.openWelcome()
    
    // Уведомляем компоненты о сбросе игры
    window.dispatchEvent(new CustomEvent('game-reset'))
  }

  const unlockFirstToughBubbleAchievement = async (): Promise<void> => {
    if (!session.value || session.value.hasUnlockedFirstToughBubbleAchievement) return
    
    session.value.hasDestroyedToughBubble = true
    session.value.hasUnlockedFirstToughBubbleAchievement = true
    
    const achievement = await achievmentStore.unlockAchievement('tough-bubble-popper')
    if (achievement) {
      await gainXP(achievement.xpReward)
      
      // Отображаем модальное окно достижения
      
      modalStore.queueOrShowAchievement({
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      })
    }
  }

  return {
    currentYear,
    session,
    currentXP,
    currentLevel,
    lives,
    visitedBubbles,
    agreementScore,
    gameCompleted,
    xpProgress,
    nextLevelXP,
    canLevelUp,
    hasUnlockedFirstToughBubbleAchievement,
    gainXP,
    gainPhilosophyXP,
    losePhilosophyLife,
    visitBubble,
    resetSession,
    unlockFirstToughBubbleAchievement,
    updateCurrentYear
  }
}) 