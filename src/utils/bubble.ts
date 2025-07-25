import {GAME_CONFIG} from '@/config'
import type {SkillLevel} from '@/types/skill-levels'
import type {BubbleSizes, NormalizedBubble} from '@/types/normalized'

export function calculateAdaptiveSizes(): { min: number; max: number } {
  return { min: 35, max: 120 }
}

// Маппинг размеров на пиксели
const SIZE_TO_PIXELS: Record<BubbleSizes, number> = {
  small: 40,
  medium: 60,
  large: 90
}

export function calcBubbleRadius(bubbleSkillLevel: SkillLevel | undefined, sizes: { min: number; max: number }, bubble?: NormalizedBubble) {
  // Для философских пузырей используем случайный размер
  if (bubble?.isQuestion) {
    const seed = Math.abs(bubble.id) % 3
    const sizeOptions: BubbleSizes[] = ['small', 'medium', 'large']
    const randomSize = sizeOptions[seed]
    return SIZE_TO_PIXELS[randomSize]
  }

  // Для обычных пузырей (включая скрытые) используем размер из свойства size
  if (bubble?.size) {
    return SIZE_TO_PIXELS[bubble.size]
  }

  const skillLevels = Object.keys(GAME_CONFIG.expertiseBubbles) as SkillLevel[]
  const skillIndex = skillLevels.indexOf(bubbleSkillLevel as SkillLevel)
  const sizeRatio = (skillIndex + 1) / skillLevels.length
  return sizes.min + (sizes.max - sizes.min) * sizeRatio
}


export const getBubbleColor = (bubble: NormalizedBubble) => {
  if (!bubble) return '#3b82f6'
  if (bubble.isQuestion) {
    return GAME_CONFIG.expertiseBubbles[bubble.skillLevel].gradientColors[0]
  }

  const expertiseConfig = GAME_CONFIG.expertiseBubbles[bubble.skillLevel]
  return expertiseConfig?.gradientColors?.[0] || '#3b82f6'
}
