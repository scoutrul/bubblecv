import type { Achievement, Bubble } from './data'
import type { BubbleSizes } from './client'

export interface NormalizedBubble extends Bubble {
  id: number
  isPopped: boolean
  isTough: boolean
  isHidden: boolean
  isQuestion: boolean
  toughClicks?: number
  isActive?: false,
  size: BubbleSizes
}

export interface NormalizedAchievement extends Achievement {
  xpReward: number
  isUnlocked: boolean
  isShown: boolean
}