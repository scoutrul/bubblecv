import { GAME_CONFIG } from '@/config'
import { SKILL_LEVELS } from '@/types/skill-levels'
import type { SkillLevel } from '@/types/skill-levels'
import type { NormalizedBubble } from '@/types/normalized'

export function calculateAdaptiveSizes(bubbleCount: number, width: number, height: number): { min: number; max: number } {
  // Фиксированные размеры как для больших экранов
  return { min: 35, max: 120 }
}

export function calcBubbleRadius(bubbleSkillLevel: SkillLevel | undefined, sizes: { min: number; max: number }, bubble?: NormalizedBubble) {
  // Специальная логика для философских пузырей
  if (bubble?.isQuestion) {
    // Генерируем случайный размер для философских пузырей
    // Используем ID пузыря как seed для консистентности
    const seed = Math.abs(bubble.id) % 1000
    const random = (seed / 1000) // Псевдослучайное число от 0 до 1
    
    // Базовый размер от 60 до 100 пикселей
    const minPhilosophySize = 60
    const maxPhilosophySize = 100
    const baseSize = minPhilosophySize + (maxPhilosophySize - minPhilosophySize) * random
    
    // Применяем sizeMultiplier из конфигурации
    return baseSize * GAME_CONFIG.questionBubble.sizeMultiplier
  }

  // Специальная логика для скрытых пузырей
  if (bubble?.isHidden) {
    // Генерируем случайный размер для скрытых пузырей
    // Используем ID пузыря как seed для консистентности
    const seed = Math.abs(bubble.id) % 1000
    const random = (seed / 1000) // Псевдослучайное число от 0 до 1
    
    // Базовый размер от 30 до 80 пикселей (меньше философских)
    const minHiddenSize = 30
    const maxHiddenSize = 80
    const baseSize = minHiddenSize + (maxHiddenSize - minHiddenSize) * random
    
    // Применяем sizeMultiplier из конфигурации
    return baseSize * GAME_CONFIG.hiddenBubble.sizeMultiplier
  }

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
