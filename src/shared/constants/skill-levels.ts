// Константы для уровней навыков
export const SKILL_LEVELS = {
  NOVICE: 'novice',
  INTERMEDIATE: 'intermediate', 
  CONFIDENT: 'confident',
  EXPERT: 'expert',
  MASTER: 'master'
} as const

// Массив всех уровней для валидации
export const SKILL_LEVELS_ARRAY = Object.values(SKILL_LEVELS)

// Тип для TypeScript
export type SkillLevel = typeof SKILL_LEVELS[keyof typeof SKILL_LEVELS]

// Маппинг старых значений из API в новые
export const SKILL_LEVEL_API_MAPPING: Record<string, SkillLevel> = {
  'beginner': SKILL_LEVELS.NOVICE,
  'intermediate': SKILL_LEVELS.INTERMEDIATE,
  'advanced': SKILL_LEVELS.CONFIDENT,
  'expert': SKILL_LEVELS.EXPERT,
  'master': SKILL_LEVELS.MASTER,
  // Для обратной совместимости
  'novice': SKILL_LEVELS.NOVICE,
  'confident': SKILL_LEVELS.CONFIDENT
}

// Размеры пузырей
export const BUBBLE_SIZES = {
  NOVICE: 'bubble-novice',
  INTERMEDIATE: 'bubble-intermediate',
  CONFIDENT: 'bubble-confident', 
  EXPERT: 'bubble-expert',
  MASTER: 'bubble-master'
} as const

export type BubbleSize = typeof BUBBLE_SIZES[keyof typeof BUBBLE_SIZES]

// Маппинг уровня навыка в размер пузыря
export const SKILL_TO_BUBBLE_SIZE: Record<SkillLevel, BubbleSize> = {
  [SKILL_LEVELS.NOVICE]: BUBBLE_SIZES.NOVICE,
  [SKILL_LEVELS.INTERMEDIATE]: BUBBLE_SIZES.INTERMEDIATE,
  [SKILL_LEVELS.CONFIDENT]: BUBBLE_SIZES.CONFIDENT,
  [SKILL_LEVELS.EXPERT]: BUBBLE_SIZES.EXPERT,
  [SKILL_LEVELS.MASTER]: BUBBLE_SIZES.MASTER
} 