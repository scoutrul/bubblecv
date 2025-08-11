import { i18n } from '@/i18n'
import skillLevels_ru from '@/data/skill-levels.json'
import skillLevels_en from '@/data/skill-levels_en.json'

export const SKILL_LEVELS = {
  NOVICE: 'novice',
  INTERMEDIATE: 'intermediate', 
  CONFIDENT: 'confident',
  EXPERT: 'expert',
  MASTER: 'master'
} as const

type SkillLevelDict = Record<string, string>
const getSkillLevelLabels = (): SkillLevelDict => (i18n.locale.value === 'en' ? (skillLevels_en as SkillLevelDict) : (skillLevels_ru as SkillLevelDict))

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = new Proxy({} as Record<SkillLevel, string>, {
  get: (_target, prop: string) => {
    const dict = getSkillLevelLabels()
    return dict[prop as SkillLevel]
  }
})

export type SkillLevel = typeof SKILL_LEVELS[keyof typeof SKILL_LEVELS]