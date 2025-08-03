export interface UserSession {
  id: string
  currentXP: number
  currentLevel: number
  lives: number
  visitedBubbles: number[]
  gameCompleted: boolean
  hasDestroyedToughBubble?: boolean
  startTime: Date
  lastActivity: Date
  hasUnlockedFirstToughBubbleAchievement: boolean
  hasUnlockedSecretBubbleAchievement: boolean
  currentYear: number
  customPhilosophyAnswers?: Record<string, string>
  allPhilosophyAnswers?: Record<string, { type: 'selected' | 'custom', answer: string, questionText: string }>
}