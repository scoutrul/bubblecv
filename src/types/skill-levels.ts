import skillLevels from '../data/skill-levels.json'

export const SKILL_LEVELS = {
  NOVICE: 'novice',
  INTERMEDIATE: 'intermediate', 
  CONFIDENT: 'confident',
  EXPERT: 'expert',
  MASTER: 'master'
} as const

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  [SKILL_LEVELS.NOVICE]: skillLevels[SKILL_LEVELS.NOVICE],
  [SKILL_LEVELS.INTERMEDIATE]: skillLevels[SKILL_LEVELS.INTERMEDIATE],
  [SKILL_LEVELS.CONFIDENT]: skillLevels[SKILL_LEVELS.CONFIDENT],
  [SKILL_LEVELS.EXPERT]: skillLevels[SKILL_LEVELS.EXPERT],
  [SKILL_LEVELS.MASTER]: skillLevels[SKILL_LEVELS.MASTER]
}

export type SkillLevel = typeof SKILL_LEVELS[keyof typeof SKILL_LEVELS]