import type { UserSession } from '@/types/session'
import { generateSessionId } from '@/utils/ui'
import { GAME_CONFIG, maxGameLevel } from '@/config'

export class SessionRepository {
  createSession(sessionData: Partial<UserSession>): UserSession {
    const session: UserSession = {
      id: generateSessionId(),
      currentXP: 0,
      currentLevel: 1,
      lives: GAME_CONFIG.maxLives,
      visitedBubbles: [],
      agreementScore: 0,
      gameCompleted: false,
      hasDestroyedToughBubble: false,
      startTime: new Date(),
      lastActivity: new Date(),
      hasUnlockedFirstToughBubbleAchievement: false,
      currentYear: GAME_CONFIG.initialYear,
      ...sessionData
    }
    
    return session
  }

  canLevelUp(currentLevel: number, currentXP: number): boolean {
    if (currentLevel >= maxGameLevel) return false
    
    const requiredXPForNextLevel = GAME_CONFIG.levelRequirements[(currentLevel + 1) as keyof typeof GAME_CONFIG.levelRequirements]
    return currentXP >= requiredXPForNextLevel
  }

  getRequiredXPForLevel(level: number): number {
    return GAME_CONFIG.levelRequirements[level as keyof typeof GAME_CONFIG.levelRequirements] || 0
  }
} 