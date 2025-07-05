export interface UserSession {
  id: string
  currentXP: number
  currentLevel: number
  lives: number
  visitedBubbles: number[]
  agreementScore: number
  gameCompleted: boolean
  hasDestroyedToughBubble?: boolean
  startTime: Date
  lastActivity: Date
  hasUnlockedFirstToughBubbleAchievement: boolean
  currentYear: number
}

export type ModalType = 'welcome' | 'bubble' | 'achievement' | 'gameOver' | 'levelUp' | 'philosophy'

export type BubbleSizes = "small" | "medium" | "large"