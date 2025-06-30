// Константы для уровней навыков
export const SKILL_LEVELS = {
  NOVICE: 'novice',
  INTERMEDIATE: 'intermediate', 
  CONFIDENT: 'confident',
  EXPERT: 'expert',
  MASTER: 'master'
} as const

// Типы для TypeScript
export type SkillLevel = typeof SKILL_LEVELS[keyof typeof SKILL_LEVELS]
export type SkillLevelKey = keyof typeof SKILL_LEVELS

// Массив всех уровней для валидации
export const SKILL_LEVELS_ARRAY = Object.values(SKILL_LEVELS)

// Человекочитаемые лейблы для каждого уровня
export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  [SKILL_LEVELS.NOVICE]: 'Новичок',
  [SKILL_LEVELS.INTERMEDIATE]: 'Средний',
  [SKILL_LEVELS.CONFIDENT]: 'Уверенный',
  [SKILL_LEVELS.EXPERT]: 'Эксперт',
  [SKILL_LEVELS.MASTER]: 'Мастер'
}

// Маппинг для API (используется в server/index.js)
export const SKILL_LEVEL_API_MAP: Record<SkillLevel, string> = {
  [SKILL_LEVELS.NOVICE]: 'beginner',
  [SKILL_LEVELS.INTERMEDIATE]: 'intermediate',
  [SKILL_LEVELS.CONFIDENT]: 'advanced',
  [SKILL_LEVELS.EXPERT]: 'expert',
  [SKILL_LEVELS.MASTER]: 'expert'
}

// Маппинг для масштабирования пузырей
export const SKILL_LEVEL_SCALE_MAP: Partial<Record<SkillLevel, number>> = {
  [SKILL_LEVELS.NOVICE]: 0.85,
  [SKILL_LEVELS.INTERMEDIATE]: 0.9
}

// Размеры пузырей
export const BUBBLE_SIZES = {
  NOVICE: 'small',
  INTERMEDIATE: 'medium',
  CONFIDENT: 'medium',
  EXPERT: 'large',
  MASTER: 'large'
} as const

export type BubbleSize = typeof BUBBLE_SIZES[keyof typeof BUBBLE_SIZES]

// Маппинг уровней навыков в размеры пузырей
export const SKILL_TO_BUBBLE_SIZE: Record<SkillLevel, BubbleSize> = {
  [SKILL_LEVELS.NOVICE]: BUBBLE_SIZES.NOVICE,
  [SKILL_LEVELS.INTERMEDIATE]: BUBBLE_SIZES.INTERMEDIATE,
  [SKILL_LEVELS.CONFIDENT]: BUBBLE_SIZES.CONFIDENT,
  [SKILL_LEVELS.EXPERT]: BUBBLE_SIZES.EXPERT,
  [SKILL_LEVELS.MASTER]: BUBBLE_SIZES.MASTER
}

// Маппинг старых значений в новые (для миграции данных)
export const SKILL_LEVEL_MIGRATION_MAP: Record<string, SkillLevel> = {
  'beginner': SKILL_LEVELS.NOVICE,
  'intermediate': SKILL_LEVELS.INTERMEDIATE,
  'advanced': SKILL_LEVELS.CONFIDENT,
  'expert': SKILL_LEVELS.EXPERT,
  'master': SKILL_LEVELS.MASTER,
  // Для обратной совместимости
  'novice': SKILL_LEVELS.NOVICE,
  'confident': SKILL_LEVELS.CONFIDENT
} 