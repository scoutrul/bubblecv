import type { NormalizedBubble, NormalizedAchievement } from '../types/normalized'
import type { Bubble, Achievement } from '../types/data'
import { XP_CALCULATOR } from '../config/game-config'

export function normalizeSkillBubble(bubble: Bubble, id: number): NormalizedBubble {
  return {
    ...bubble,
    id,
    isActive: false,
    isPopped: false,
    isTough: false,
    toughClicks: 0,
    size: 'medium', // TODO: add size
  }
}

export function normalizeAchievement(raw: Achievement): NormalizedAchievement {
  return {
    ...raw,
    xpReward: XP_CALCULATOR.getAchievementXP(raw.id),
    isUnlocked: false,
    isShown: false
  }
} 