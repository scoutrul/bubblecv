import type { BubbleNode } from './canvas'
import type { Question } from './data'
import type { NormalizedLevel } from './normalized'

export interface PendingAchievement {
  title: string
  description: string
  icon: string
  xpReward: number
}

export interface LevelUpData extends NormalizedLevel {
  level: number
  title: string
  description: string
  icon: string
  currentXP: number
  xpGained: number
  unlockedFeatures: string[]
}

export interface ModalData {
  currentBubble: BubbleNode | null
  currentQuestion: Question | null
  philosophyBubbleId: BubbleNode['id'] | null
  achievement: PendingAchievement | null
  gameOverStats: { currentXP: number; currentLevel: number } | null
  levelUpData: LevelUpData
}

export interface ModalStates {
  welcome: boolean
  bubble: boolean
  levelUp: boolean
  philosophy: boolean
  gameOver: boolean
  achievement: boolean
}