import type { LevelContent, Level } from './levels'
import type { Achievement, Bubble, Bonus } from './data'

export interface NormalizedBubble extends Bubble {
  id: number
  isPopped: boolean
  isTough: boolean
  isHidden: boolean
  isQuestion: boolean
  questionId?: string
  toughClicks?: number
  requiredClicks?: number
  isActive: boolean,
  size: BubbleSizes
}

export interface NormalizedAchievement extends Achievement {
  xpReward: number
  isUnlocked: boolean
  isShown: boolean
}

export interface NormalizedLevel extends Level {
  xpRequired: number
  content?: LevelContent
  unlockedFeatures?: string[]
  lockedMessage?: string
  congratulations?: string
}

export interface NormalizedBonus extends Bonus {
  id: number
  isUnlocked: boolean
}

export type BubbleSizes = "small" | "medium" | "large"