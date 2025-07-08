import { GAME_CONFIG } from '@/config'
import { SKILL_LEVELS } from '@/types/skill-levels'
import type { SkillLevel } from '@/types/skill-levels'

export function calculateAdaptiveSizes(bubbleCount: number, width: number, height: number): { min: number; max: number } {
  const screenArea = width * height * 0.75
  const averageAreaPerBubble = screenArea / bubbleCount
  const averageRadius = Math.sqrt(averageAreaPerBubble / Math.PI)

  const aspectRatio = width / height
  const aspectFactor = Math.min(1.2, Math.max(0.8, aspectRatio / 1.5))

  const baseMinRadius = Math.max(25, averageRadius * 0.5 * aspectFactor)
  const baseMaxRadius = Math.min(180, averageRadius * 1.6 * aspectFactor)

  const maxAllowedRadius = Math.min(width, height) / 8
  const minRadius = Math.min(baseMinRadius, maxAllowedRadius * 0.4)
  const maxRadius = Math.min(baseMaxRadius, maxAllowedRadius)

  return { min: minRadius, max: maxRadius }
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
