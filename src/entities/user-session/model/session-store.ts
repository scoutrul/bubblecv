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
    const levels = Object.values(GAME_CONFIG.XP_LEVELS)
    const currentLevelXP = levels[currentLevel.value - 1] || 100
    
    if (currentLevel.value === 1) {
      return (currentXP.value / currentLevelXP) * 100
    }
    
    const prevLevelXP = levels[currentLevel.value - 2] || 0
    const range = currentLevelXP - prevLevelXP
    const progress = currentXP.value - prevLevelXP
    
    return Math.min((progress / range) * 100, 100)
  })

  const nextLevelXP = computed(() => {
    const levels = Object.values(GAME_CONFIG.XP_LEVELS)
    return levels[currentLevel.value - 1] || 100
  })

  const canLevelUp = computed(() => {
    return currentXP.value >= nextLevelXP.value && currentLevel.value < 4
  })

  const isAlive = computed(() => lives.value > 0)

  // Actions
  const loadSession = async (sessionId?: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const id = sessionId || generateSessionId()
      const response = await fetch(`/api/session/${id}`)
      const data: ApiResponse<UserSession> = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Ошибка загрузки сессии')
      }

      session.value = {
        ...data.data,
        startTime: new Date(data.data.start_time),
        lastActivity: new Date(data.data.last_activity)
      } as UserSession

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
      console.error('Ошибка загрузки сессии:', err)
    } finally {
      isLoading.value = false
    }
  }

  const saveSession = async (): Promise<void> => {
    if (!session.value) return

    try {
      const response = await fetch(`/api/session/${session.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentXP: session.value.currentXP,
          currentLevel: session.value.currentLevel,
          lives: session.value.lives,
          unlockedContent: session.value.unlockedContent,
          visitedBubbles: session.value.visitedBubbles,
          agreementScore: session.value.agreementScore
        })
      })

      const data: ApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Ошибка сохранения сессии')
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка сохранения'
      console.error('Ошибка сохранения сессии:', err)
    }
  }

  const gainXP = async (amount: number): Promise<boolean> => {
    if (!session.value) return false

    const oldLevel = session.value.currentLevel
    session.value.currentXP += amount
    
    // Проверяем повышение уровня
    if (canLevelUp.value) {
      session.value.currentLevel += 1
      
      // Разблокируем контент
      if (!session.value.unlockedContent.includes(session.value.currentLevel)) {
        session.value.unlockedContent.push(session.value.currentLevel)
      }
      
      await saveSession()
      return true // Произошло повышение уровня
    }
    
    await saveSession()
    return false
  }

  const loseLives = async (amount: number = 1): Promise<void> => {
    if (!session.value) return

    session.value.lives = Math.max(0, session.value.lives - amount)
    
    if (session.value.lives === 0) {
      session.value.gameCompleted = true
    }
    
    await saveSession()
  }

  const visitBubble = async (bubbleId: string): Promise<void> => {
    if (!session.value) return

    if (!session.value.visitedBubbles.includes(bubbleId)) {
      session.value.visitedBubbles.push(bubbleId)
      await saveSession()
    }
  }

  const updateAgreementScore = async (score: number): Promise<void> => {
    if (!session.value) return

    session.value.agreementScore += score
    await saveSession()
  }

  const resetSession = async (): Promise<void> => {
    if (!session.value) return

    session.value.currentXP = 0
    session.value.currentLevel = 1
    session.value.lives = GAME_CONFIG.MAX_LIVES
    session.value.unlockedContent = []
    session.value.visitedBubbles = []
    session.value.agreementScore = 0
    session.value.gameCompleted = false
    session.value.startTime = new Date()
    session.value.lastActivity = new Date()

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
    loseLives,
    visitBubble,
    updateAgreementScore,
    resetSession,
    clearError
  }
}) 