import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserSession, ApiResponse } from '@shared/types'
import { GAME_CONFIG } from '@shared/config/game-config'

export const useSessionStore = defineStore('session', () => {
  // State
  const session = ref<UserSession | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Generate session ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Getters
  const currentXP = computed(() => session.value?.currentXP || 0)
  const currentLevel = computed(() => session.value?.currentLevel || 1)
  const lives = computed(() => session.value?.lives || GAME_CONFIG.maxLives)
  const unlockedContent = computed(() => session.value?.unlockedContent || [])
  const visitedBubbles = computed(() => session.value?.visitedBubbles || [])
  const agreementScore = computed(() => session.value?.agreementScore || 0)
  const gameCompleted = computed(() => session.value?.gameCompleted || false)

  const xpProgress = computed(() => {
    if (!session.value) return 0
    const level = session.value.currentLevel
    if (level >= 5) return 100
    
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
    if (currentLevel >= 5) return 0 // Максимальный уровень
    
    return GAME_CONFIG.levelRequirements[(currentLevel + 1) as keyof typeof GAME_CONFIG.levelRequirements]
  })

  const canLevelUp = computed(() => {
    if (!session.value) return false
    const level = session.value.currentLevel
    
    // Не можем повыситься если уже максимальный уровень
    if (level >= 5) return false
    
    // XP необходимый для следующего уровня
    const requiredXPForNextLevel = GAME_CONFIG.levelRequirements[(level + 1) as keyof typeof GAME_CONFIG.levelRequirements]
    const canLevel = currentXP.value >= requiredXPForNextLevel
    
    return canLevel
  })

  const isAlive = computed(() => lives.value > 0)

  // Actions
  const loadSession = async (sessionId?: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Всегда генерируем новый ID сессии для новой вкладки
      const id = generateSessionId()
      
      // Создаём новую сессию
      session.value = {
        id,
        currentXP: 0,
        currentLevel: 1,
        lives: GAME_CONFIG.initialLives,
        unlockedContent: [],
        visitedBubbles: [],
        agreementScore: 0,
        gameCompleted: false,
        hasDestroyedToughBubble: false,
        startTime: new Date(),
        lastActivity: new Date()
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
    } finally {
      isLoading.value = false
    }
  }

  const gainXP = async (amount: number): Promise<boolean> => {
    if (!session.value) {
      return false
    }

    const oldLevel = session.value.currentLevel
    const oldXP = session.value.currentXP
    
    session.value.currentXP += amount
    
    // Проверяем можем ли повыситься в уровне
    if (canLevelUp.value) {
      const newLevel = session.value.currentLevel + 1
      session.value.currentLevel = newLevel
      
      // Проверяем достижения за уровни (отложенно)
      if (newLevel === 2) { // Достигли уровня 2 (первое повышение)
        const { useGameStore } = await import('../../../features/gamification/model/game-store')
        const { useModalStore } = await import('../../../shared/stores/modal-store')
        const gameStore = useGameStore()
        const modalStore = useModalStore()
        
        const achievement = await gameStore.unlockAchievement('first-level-master')
        if (achievement) {
          // Начисляем XP за достижение
          session.value.currentXP += achievement.xpReward
          
          modalStore.queueOrShowAchievement({
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward
          })
        }
      } else if (newLevel === 5) { // Достигли максимального уровня
        const { useGameStore } = await import('../../../features/gamification/model/game-store')
        const { useModalStore } = await import('../../../shared/stores/modal-store')
        const gameStore = useGameStore()
        const modalStore = useModalStore()
        
        const achievement = await gameStore.unlockAchievement('final-level-master')
        if (achievement) {
          // Начисляем XP за достижение
          session.value.currentXP += achievement.xpReward
          
          modalStore.queueOrShowAchievement({
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward
          })
        }
      }
      
      return true // Произошло повышение уровня
    }
    
    return false // Уровень не повысился
  }

  // Получить XP за уровень экспертизы пузыря
  const gainBubbleXP = async (expertiseLevel: string): Promise<boolean> => {
    const xpAmount = GAME_CONFIG.xpPerExpertiseLevel[expertiseLevel as keyof typeof GAME_CONFIG.xpPerExpertiseLevel] || 1
    
    const result = await gainXP(xpAmount)
    return result
  }

  // Получить XP за правильный ответ на философский вопрос
  const gainPhilosophyXP = async (): Promise<boolean> => {
    // Проверяем достижение "Философ" (если еще не разблокировано)
    const { useGameStore } = await import('../../../features/gamification/model/game-store')
    const { useModalStore } = await import('../../../shared/stores/modal-store')
    const gameStore = useGameStore()
    const modalStore = useModalStore()
    
    const achievement = await gameStore.unlockAchievement('philosophy-master')
    if (achievement) {
      // Начисляем XP за достижение
      await gainXP(achievement.xpReward)
      
      modalStore.queueOrShowAchievement({
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      })
    }
    
    return await gainXP(GAME_CONFIG.philosophyCorrectXp)
  }

  // Потерять жизнь за неправильный ответ на философский вопрос
  const losePhilosophyLife = async (): Promise<boolean> => {
    await loseLives(GAME_CONFIG.philosophyWrongLives)
    return lives.value === 0 // Возвращаем true если Game Over
  }

  const loseLives = async (amount: number = 1): Promise<void> => {
    if (!session.value) return

    session.value.lives = Math.max(0, session.value.lives - amount)
    
    // Проверяем достижение "На краю" (осталась 1 жизнь)
    if (session.value.lives === 1) {
      const { useGameStore } = await import('../../../features/gamification/model/game-store')
      const { useModalStore } = await import('../../../shared/stores/modal-store')
      const gameStore = useGameStore()
      const modalStore = useModalStore()
      
      const achievement = await gameStore.unlockAchievement('on-the-edge')
      if (achievement) {
        // Начисляем XP за достижение
        await gainXP(achievement.xpReward)
        
        modalStore.queueOrShowAchievement({
          title: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward
        })
      }
    }
    
    if (session.value.lives === 0) {
      session.value.gameCompleted = true
      
      // Показываем Game Over модал через modal store
      const { useModalStore } = await import('../../../shared/stores/modal-store')
      const modalStore = useModalStore()
      
      modalStore.openGameOverModal({
        currentXP: session.value.currentXP,
        currentLevel: session.value.currentLevel
      })
    }
  }

  const visitBubble = async (bubbleId: string): Promise<void> => {
    if (!session.value) return

    if (!session.value.visitedBubbles.includes(bubbleId)) {
      session.value.visitedBubbles.push(bubbleId)
    }
  }

  const updateAgreementScore = async (score: number): Promise<void> => {
    if (!session.value) return

    session.value.agreementScore += score
  }

  const resetSession = async (): Promise<void> => {
    // Сбрасываем состояние сессии
    session.value = {
      id: generateSessionId(),
      currentXP: 0,
      currentLevel: 1,
      lives: GAME_CONFIG.initialLives,
      unlockedContent: [],
      visitedBubbles: [],
      agreementScore: 0,
      gameCompleted: false,
      hasDestroyedToughBubble: false,
      startTime: new Date(),
      lastActivity: new Date()
    }

    // Показываем приветственную модалку
    const { useModalStore } = await import('@shared/stores/modal-store')
    const modalStore = useModalStore()
    modalStore.openWelcome()
    
    // Уведомляем компоненты о сбросе игры
    window.dispatchEvent(new CustomEvent('game-reset'))
  }

  const unlockFirstToughBubbleAchievement = async (): Promise<void> => {
    if (!session.value || session.value.hasDestroyedToughBubble) return
    
    session.value.hasDestroyedToughBubble = true
    
    const { useGameStore } = await import('../../../features/gamification/model/game-store')
    const { useModalStore } = await import('../../../shared/stores/modal-store')
    const gameStore = useGameStore()
    const modalStore = useModalStore()
    
    const achievement = await gameStore.unlockAchievement('tough-bubble-popper')
    if (achievement) {
      // Начисляем XP за достижение
      await gainXP(achievement.xpReward)
      
      modalStore.queueOrShowAchievement({
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      })
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    session,
    isLoading,
    error,
    
    // Getters
    currentXP,
    currentLevel,
    lives,
    unlockedContent,
    visitedBubbles,
    agreementScore,
    gameCompleted,
    xpProgress,
    nextLevelXP,
    canLevelUp,
    isAlive,
    
    // Actions
    loadSession,
    gainXP,
    gainBubbleXP,
    gainPhilosophyXP,
    losePhilosophyLife,
    loseLives,
    visitBubble,
    updateAgreementScore,
    resetSession,
    unlockFirstToughBubbleAchievement,
    clearError
  }
}) 