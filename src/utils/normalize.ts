import type { Level } from '@/types/levels'
import type { Bubble, Achievement } from '@/types/data'
import type { NormalizedBubble, NormalizedAchievement, NormalizedLevel } from '@/types/normalized'
import { XP_CALCULATOR } from '@/config'

// Значения по умолчанию для пузыря
const DEFAULT_BUBBLE_PROPS = {
  isActive: false,
  isPopped: false,
  isTough: false,
  isHidden: false,
  isQuestion: false,
  toughClicks: 0,
  size: 'medium' as const,
}

export function normalizeSkillBubble(bubble: Bubble, id: number): NormalizedBubble {
  return {
    ...bubble,
    ...DEFAULT_BUBBLE_PROPS,
    id,
  }
}

export function normalizeAchievement(raw: Achievement): NormalizedAchievement {
  return {
    ...raw,
    xpReward: XP_CALCULATOR.getAchievementXP(raw.id),
    isUnlocked: false,
    isShown: false,
  }
}

export function normalizeLevels(raw: Level): NormalizedLevel {
  return {
    ...raw,
    unlockedFeatures: [],
    xpRequired: 0
  }
}

