import { GAME_CONFIG } from '@/config'
import { SKILL_LEVELS } from '@/types/skill-levels'
import type { SkillLevel } from '@/types/skill-levels'
import type { NormalizedBubble, BubbleSizes } from '@/types/normalized'

export function calculateAdaptiveSizes(bubbleCount: number, width: number, height: number): { min: number; max: number } {
  // Фиксированные размеры как для больших экранов
  return { min: 35, max: 120 }
}

// Маппинг размеров на пиксели
const SIZE_TO_PIXELS: Record<BubbleSizes, number> = {
  small: 50,
  medium: 70,
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

  // Fallback для старой логики (если size не задан)
  const expertiseConfig = bubbleSkillLevel
    ? GAME_CONFIG.expertiseBubbles[bubbleSkillLevel]
    : GAME_CONFIG.expertiseBubbles[SKILL_LEVELS.INTERMEDIATE]

  const skillLevels = Object.keys(GAME_CONFIG.expertiseBubbles) as SkillLevel[]
  const skillIndex = skillLevels.indexOf(bubbleSkillLevel as SkillLevel)
  const sizeRatio = (skillIndex + 1) / skillLevels.length
  const calculatedRadius = sizes.min + (sizes.max - sizes.min) * sizeRatio

  return calculatedRadius
}
