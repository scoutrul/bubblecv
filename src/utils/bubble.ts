import { GAME_CONFIG } from '@/config'
import { SKILL_LEVELS } from '@/types/skill-levels'
import type { SkillLevel } from '@/types/skill-levels'

export function calculateAdaptiveSizes(bubbleCount: number, width: number, height: number): { min: number; max: number } {
  // Фиксированные размеры как для больших экранов
  return { min: 35, max: 120 }
}

export function calcBubbleRadius(bubbleSkillLevel: SkillLevel | undefined, sizes: { min: number; max: number }) {
  const expertiseConfig = bubbleSkillLevel
    ? GAME_CONFIG.expertiseBubbles[bubbleSkillLevel]
    : GAME_CONFIG.expertiseBubbles[SKILL_LEVELS.INTERMEDIATE]

  const skillLevels = Object.keys(GAME_CONFIG.expertiseBubbles) as SkillLevel[]
  const skillIndex = skillLevels.indexOf(bubbleSkillLevel as SkillLevel)
  const sizeRatio = (skillIndex + 1) / skillLevels.length
  const calculatedRadius = sizes.min + (sizes.max - sizes.min) * sizeRatio
  const baseRadius = calculatedRadius * expertiseConfig.sizeMultiplier

  return baseRadius
}
