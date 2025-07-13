import type { BubbleNode } from './canvas'
import type { Question } from './data'
import type { NormalizedLevel, NormalizedBonus } from './normalized'

export interface PendingAchievement {
  title: string
  description: string
  icon: string
  xpReward: number
}

export interface PendingBubbleRemoval {
  bubbleId: number
  xpAmount: number
  isPhilosophyNegative: boolean
}

export interface CanvasBridge {
  removeBubble: (bubbleId: number, xpAmount?: number, isPhilosophyNegative?: boolean) => void
}

export interface LevelUpData {
  level: number
  title: string
  description: string
  icon: string
  currentXP: number
  xpGained: number
  unlockedFeatures: string[]
  xpRequired: number
}

export interface ModalData {
  currentBubble: BubbleNode | null
  currentQuestion: Question | null
  philosophyBubbleId: BubbleNode['id'] | null
  achievement: PendingAchievement | null
  gameOverStats: { currentXP: number; currentLevel: number } | null
  levelUpData: LevelUpData
  currentBonus: NormalizedBonus | null
}

export interface ModalStates {
  welcome: boolean
  bubble: boolean
  levelUp: boolean
  philosophy: boolean
  gameOver: boolean
  achievement: boolean
  bonus: boolean
}