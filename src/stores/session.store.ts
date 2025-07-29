import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { UserSession } from '@/types/session'

import { GAME_CONFIG, maxGameLevel } from '@/config'

export const useSessionStore = defineStore('sessionStore', () => {
  // State
  const session = ref<UserSession | null>(null)

  // Getters
  const currentYear = computed(() => session.value?.currentYear || GAME_CONFIG.initialYear)
  const currentXP = computed(() => session.value?.currentXP || 0)
  const currentLevel = computed(() => session.value?.currentLevel || 1)
  const lives = computed(() => session.value?.lives || GAME_CONFIG.maxLives)
  const visitedBubbles = computed(() => session.value?.visitedBubbles || [])
  const agreementScore = computed(() => session.value?.agreementScore || 0)
  const gameCompleted = computed(() => session.value?.gameCompleted || false)
  const hasUnlockedFirstToughBubbleAchievement = computed(() => 
    session.value?.hasUnlockedFirstToughBubbleAchievement || false
  )

  const hasUnlockedSecretBubbleAchievement = computed(() => 
    session.value?.hasUnlockedSecretBubbleAchievement || false
  )

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
    if (currentLevel >= maxGameLevel) return 0
    
    return GAME_CONFIG.levelRequirements[(currentLevel + 1) as keyof typeof GAME_CONFIG.levelRequirements]
  })

  // Setters
  const createSession = (sessionData: UserSession) => {
    session.value = sessionData
  }

  const addXP = (amount: number) => {
    if (session.value) {
      session.value.currentXP += amount
    }
  }

  const setLevel = (level: number) => {
    if (session.value) {
      session.value.currentLevel = level
    }
  }

  const setLives = (lives: number) => {
    if (session.value) {
      session.value.lives = lives
    }
  }

  const setGameCompleted = (completed: boolean) => {
    if (session.value) {
      session.value.gameCompleted = completed
    }
  }

  const addVisitedBubble = (bubbleId: number) => {
    if (session.value && !session.value.visitedBubbles.includes(bubbleId)) {
      session.value.visitedBubbles.push(bubbleId)
    }
  }

  const setCurrentYear = (year: number) => {
    if (session.value) {
      session.value.currentYear = year
    }
  }

  const setHasDestroyedToughBubble = (value: boolean) => {
    if (session.value) {
      session.value.hasDestroyedToughBubble = value
    }
  }

  const setHasUnlockedFirstToughBubbleAchievement = (value: boolean) => {
    if (session.value) {
      session.value.hasUnlockedFirstToughBubbleAchievement = value
    }
  }

  const setHasUnlockedSecretBubbleAchievement = (value: boolean) => {
    if (session.value) {
      session.value.hasUnlockedSecretBubbleAchievement = value
    }
  }

  return {
    // State
    session,
    
    // Getters
    currentYear,
    currentXP,
    currentLevel,
    lives,
    visitedBubbles,
    agreementScore,
    gameCompleted,
    xpProgress,
    nextLevelXP,
    hasUnlockedFirstToughBubbleAchievement,
    hasUnlockedSecretBubbleAchievement,
    
    // Setters
    createSession,
    addXP,
    setLevel,
    setLives,
    setGameCompleted,
    addVisitedBubble,
    setCurrentYear,
    setHasDestroyedToughBubble,
    setHasUnlockedFirstToughBubbleAchievement,
    setHasUnlockedSecretBubbleAchievement
  }
}) 