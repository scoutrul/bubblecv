// Константы для уровней навыков (синхронизировано с фронтендом)
export const SKILL_LEVELS = {
  NOVICE: 'novice',
  INTERMEDIATE: 'intermediate', 
  CONFIDENT: 'confident',
  EXPERT: 'expert',
  MASTER: 'master'
}

// Массив всех уровней для валидации
export const SKILL_LEVELS_ARRAY = Object.values(SKILL_LEVELS)

// Маппинг старых значений в новые (для миграции данных)
export const SKILL_LEVEL_MIGRATION_MAP = {
  'beginner': SKILL_LEVELS.NOVICE,
  'intermediate': SKILL_LEVELS.INTERMEDIATE,
  'advanced': SKILL_LEVELS.CONFIDENT,
  'expert': SKILL_LEVELS.EXPERT,
  'master': SKILL_LEVELS.MASTER,
  // Для обратной совместимости
  'novice': SKILL_LEVELS.NOVICE,
  'confident': SKILL_LEVELS.CONFIDENT
}

// Валидация уровня навыка
export const isValidSkillLevel = (level) => {
  return SKILL_LEVELS_ARRAY.includes(level)
}

// Нормализация уровня навыка
export const normalizeSkillLevel = (level) => {
  return SKILL_LEVEL_MIGRATION_MAP[level] || SKILL_LEVELS.NOVICE
} 