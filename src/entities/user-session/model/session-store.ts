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
  const lives = computed(() => session.value?.lives || GAME_CONFIG.MAX_LIVES)
  const unlockedContent = computed(() => session.value?.unlockedContent || [])
  const visitedBubbles = computed(() => session.value?.visitedBubbles || [])
  const agreementScore = computed(() => session.value?.agreementScore || 0)
  const gameCompleted = computed(() => session.value?.gameCompleted || false)

  const xpProgress = computed(() => {
    const levels = Object.values(GAME_CONFIG.XP_LEVELS) // [25, 50, 75, 100, 125]
    const currentLevelIndex = currentLevel.value - 1 // 0-based index
    
    // XP нужный для текущего уровня
    const currentLevelRequiredXP = levels[currentLevelIndex] || 25
    
    // XP нужный для предыдущего уровня (0 для первого уровня)
    const prevLevelRequiredXP = currentLevelIndex > 0 ? levels[currentLevelIndex - 1] : 0
    
    // Сколько XP нужно набрать между уровнями
    const xpRangeForLevel = currentLevelRequiredXP - prevLevelRequiredXP
    
    // Сколько XP уже набрано сверх предыдущего уровня
    const xpAbovePrevLevel = Math.max(0, currentXP.value - prevLevelRequiredXP)
    
    // Процент прогресса для текущего уровня
    const progress = Math.min((xpAbovePrevLevel / xpRangeForLevel) * 100, 100)
    

    
    return Math.max(0, Math.min(progress, 100))
  })

  const nextLevelXP = computed(() => {
    const levels = Object.values(GAME_CONFIG.XP_LEVELS)
    const nextLevelIndex = currentLevel.value // index for next level (0-based + 1)
    const nextXP = levels[nextLevelIndex] || levels[levels.length - 1]
    

    
    return nextXP
  })

  const canLevelUp = computed(() => {
    const levels = Object.values(GAME_CONFIG.XP_LEVELS)
    const maxLevel = levels.length
    
    // Не можем повыситься если уже максимальный уровень
    if (currentLevel.value >= maxLevel) return false
    
    // XP необходимый для следующего уровня
    // Если мы на уровне 4, нам нужен XP для уровня 5, который в массиве под индексом 4
    const requiredXPForNextLevel = levels[currentLevel.value] // следующий уровень в массиве
    const canLevel = currentXP.value >= requiredXPForNextLevel
    
    console.log('🔄 Can Level Up Check:', {
      currentLevel: currentLevel.value,
      currentXP: currentXP.value,
      requiredXPForNextLevel,
      canLevel,
      maxLevel,
      levels
    })
    
    return canLevel
  })

  const isAlive = computed(() => lives.value > 0)

  // Actions
  const loadSession = async (sessionId?: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const id = sessionId || generateSessionId()
      
      // ВСЕГДА создаём новую сессию без сохранения
      session.value = {
        id,
        currentXP: 0,
        currentLevel: 1,
        lives: GAME_CONFIG.INITIAL_LIVES,
        unlockedContent: [],
        visitedBubbles: [],
        agreementScore: 0,
        gameCompleted: false,
        hasDestroyedToughBubble: false,
        startTime: new Date(),
        lastActivity: new Date()
      }
      
      console.log('🎮 Создана новая игровая сессия:', {
        id: session.value.id,
        currentXP: session.value.currentXP,
        currentLevel: session.value.currentLevel,
        lives: session.value.lives
      })

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
      console.error('Ошибка создания сессии:', err)
    } finally {
      isLoading.value = false
    }
  }

  const saveSession = async (): Promise<void> => {
    // Больше не сохраняем сессии - игра сбрасывается при обновлении
    console.log('🎮 Сохранение отключено - игра сбрасывается при обновлении страницы')
  }

  const gainXP = async (amount: number): Promise<boolean> => {
    console.log('🚀 gainXP вызван:', { amount, sessionExists: !!session.value })
    
    if (!session.value) {
      console.error('❌ Session не существует! Не можем начислить XP')
      return false
    }

    const oldLevel = session.value.currentLevel
    const oldXP = session.value.currentXP
    
    console.log('📊 Состояние ДО начисления XP:', {
      oldXP,
      oldLevel,
      amount,
      sessionId: session.value.id
    })
    
    session.value.currentXP += amount
    
    console.log('✨ Gaining XP:', { 
      amount, 
      oldXP, 
      newXP: session.value.currentXP, 
      oldLevel, 
      canLevelUp: canLevelUp.value,
      nextLevelXP: nextLevelXP.value
    })
    
    // Проверяем повышение уровня
    if (canLevelUp.value) {
      const newLevel = session.value.currentLevel + 1
      session.value.currentLevel = newLevel
      
      console.log('🎉 LEVEL UP!', { 
        oldLevel, 
        newLevel: newLevel,
        currentXP: session.value.currentXP
      })
      
      // Проверяем достижение за достижение первого уровня
      if (newLevel === 2) { // Достигли уровня 2 (первое повышение)
        const { useGameStore } = await import('../../../features/gamification/model/game-store')
        const { useModalStore } = await import('../../../shared/stores/modal-store')
        const gameStore = useGameStore()
        const modalStore = useModalStore()
        
        const achievement = gameStore.unlockAchievement('first-level-master')
        if (achievement) {
          console.log('🚀 Разблокировано достижение "Первопроходец"!')
          
          // Начисляем XP за достижение
          session.value.currentXP += achievement.xpReward
          
          modalStore.openAchievementModal({
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward
          })
        }
      }
      
      // Проверяем достижение за финальный уровень
      if (newLevel === 5) { // Достигли максимального уровня
        const { useGameStore } = await import('../../../features/gamification/model/game-store')
        const { useModalStore } = await import('../../../shared/stores/modal-store')
        const gameStore = useGameStore()
        const modalStore = useModalStore()
        
        const achievement = gameStore.unlockAchievement('final-level-master')
        if (achievement) {
          console.log('🎖️ Разблокировано достижение "Финалист"!')
          
          // Начисляем XP за достижение
          session.value.currentXP += achievement.xpReward
          
          modalStore.openAchievementModal({
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward
          })
        }
      }
      
      console.log('💾 Сохраняем сессию после level up...')
      await saveSession()
      console.log('✅ Сессия сохранена после level up')
      return true // Произошло повышение уровня
    }
    
    console.log('💾 Сохраняем сессию после получения XP...')
    await saveSession()
    console.log('✅ Сессия сохранена после получения XP')
    return false
  }

  // Получить XP за уровень экспертизы пузыря
  const gainBubbleXP = async (expertiseLevel: string): Promise<boolean> => {
    console.log('🫧 gainBubbleXP вызван:', { expertiseLevel })
    
    const xpAmount = GAME_CONFIG.XP_PER_EXPERTISE_LEVEL[expertiseLevel as keyof typeof GAME_CONFIG.XP_PER_EXPERTISE_LEVEL] || 1
    console.log('🫧 Bubble XP:', { expertiseLevel, xpAmount })
    
    const result = await gainXP(xpAmount)
    console.log('🫧 gainBubbleXP результат:', result)
    return result
  }

  // Получить XP за правильный ответ на философский вопрос
  const gainPhilosophyXP = async (): Promise<boolean> => {
    // Проверяем достижение "Философ" (если еще не разблокировано)
    const { useGameStore } = await import('../../../features/gamification/model/game-store')
    const { useModalStore } = await import('../../../shared/stores/modal-store')
    const gameStore = useGameStore()
    const modalStore = useModalStore()
    
    const achievement = gameStore.unlockAchievement('philosophy-master')
    if (achievement) {
      console.log('🤔 Разблокировано достижение "Философ"!')
      
      // Начисляем XP за достижение
      await gainXP(achievement.xpReward)
      
      modalStore.openAchievementModal({
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      })
    }
    
    return await gainXP(GAME_CONFIG.PHILOSOPHY_CORRECT_XP)
  }

  // Потерять жизнь за неправильный ответ на философский вопрос
  const losePhilosophyLife = async (): Promise<boolean> => {
    await loseLives(GAME_CONFIG.PHILOSOPHY_WRONG_LIVES)
    return lives.value === 0 // Возвращаем true если Game Over
  }

  const loseLives = async (amount: number = 1): Promise<void> => {
    if (!session.value) return

    session.value.lives = Math.max(0, session.value.lives - amount)
    
    console.log('💔 Lost lives:', { amount, remainingLives: session.value.lives })
    
    // Проверяем достижение "На краю" (осталась 1 жизнь)
    if (session.value.lives === 1) {
      const { useGameStore } = await import('../../../features/gamification/model/game-store')
      const { useModalStore } = await import('../../../shared/stores/modal-store')
      const gameStore = useGameStore()
      const modalStore = useModalStore()
      
      const achievement = gameStore.unlockAchievement('on-the-edge')
      if (achievement) {
        console.log('🔥 Разблокировано достижение "На краю"!')
        
        // Начисляем XP за достижение
        await gainXP(achievement.xpReward)
        
        modalStore.openAchievementModal({
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
      
      console.log('💀 GAME OVER! Opening modal...')
    }
    
    await saveSession()
  }

  const visitBubble = async (bubbleId: string): Promise<void> => {
    if (!session.value) return

    if (!session.value.visitedBubbles.includes(bubbleId)) {
      session.value.visitedBubbles.push(bubbleId)
      
      const bubblesCount = session.value.visitedBubbles.length
      console.log('🫧 Посещен пузырь:', { bubbleId, totalBubbles: bubblesCount })
      
      // Проверяем достижения за количество исследованных пузырей
      const { useGameStore } = await import('../../../features/gamification/model/game-store')
      const { useModalStore } = await import('../../../shared/stores/modal-store')
      const gameStore = useGameStore()
      const modalStore = useModalStore()
      
      let achievement = null
      
      if (bubblesCount === 10) {
        achievement = gameStore.unlockAchievement('bubble-explorer-10')
      } else if (bubblesCount === 30) {
        achievement = gameStore.unlockAchievement('bubble-explorer-30')
      } else if (bubblesCount === 50) {
        achievement = gameStore.unlockAchievement('bubble-explorer-50')
      }
      
      if (achievement) {
        console.log('🔍 Разблокировано достижение за исследование:', achievement.name)
        
        // Начисляем XP за достижение
        await gainXP(achievement.xpReward)
        
        modalStore.openAchievementModal({
          title: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward
        })
      }
      
      await saveSession()
    }
  }

  const updateAgreementScore = async (score: number): Promise<void> => {
    if (!session.value) return

    session.value.agreementScore += score
    await saveSession()
  }

  const resetSession = async (): Promise<void> => {
    const id = generateSessionId()
    
    session.value = {
      id,
      currentXP: 0,
      currentLevel: 1,
      lives: GAME_CONFIG.MAX_LIVES, // При ресете восстанавливаем все 5 жизней
      unlockedContent: [],
      visitedBubbles: [],
      agreementScore: 0,
      gameCompleted: false,
      hasDestroyedToughBubble: false,
      startTime: new Date(),
      lastActivity: new Date()
    }

    console.log('🔄 Игра сброшена! Новая сессия:', {
      id: session.value.id,
      currentXP: session.value.currentXP,
      currentLevel: session.value.currentLevel,
      lives: session.value.lives
    })
    
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
    
    const achievement = gameStore.unlockAchievement('first-tough-bubble')
    if (achievement) {
      console.log('💪 Разблокировано достижение "Упорство"!')
      
      // Начисляем XP за достижение
      await gainXP(achievement.xpReward)
      
      modalStore.openAchievementModal({
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      })
    }
    
    await saveSession()
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
    saveSession,
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