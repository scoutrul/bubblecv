import { i18n } from '@/i18n'

// Fallback imports (ru by default)
import skills_ru from '@/data/skills.json'
import project_ru from '@/data/project.json'
import levels_ru from '@/data/levels.json'
import achievements_ru from '@/data/achievements.json'
import bonuses_ru from '@/data/bonuses.json'
import memoirs_ru from '@/data/memoirs.json'
import oldBubbles_ru from '@/data/old.json'
import questions_ru from '@/data/questions.json'

import type { NormalizedBubble, NormalizedAchievement, NormalizedLevel, NormalizedBonus, NormalizedMemoir } from '@/types/normalized'
import type { Bubble, Achievement, Bonus, Memoir, OldBubble } from '@/types/data'
import type { Level } from '@/types/levels'

import { normalizeSkillBubble, normalizeAchievement, normalizeLevels, normalizeBonus, normalizeMemoir, normalizeOldBubble } from '@/utils'
import { GAME_CONFIG } from '@/config'

// EN locale imports
import skills_en from '@/data/skills_en.json'
import project_en from '@/data/project_en.json'
import levels_en from '@/data/levels_en.json'
import achievements_en from '@/data/achievements_en.json'
import bonuses_en from '@/data/bonuses_en.json'
import memoirs_en from '@/data/memoirs_en.json'
import oldBubbles_en from '@/data/old_en.json'
import questions_en from '@/data/questions_en.json'

const pickLocaleFile = <T extends Record<string, any>>(ruData: T, enData: T): T => (
  i18n.locale.value === 'en' ? enData : ruData
)

export const api = {
  async getLevels(): Promise<{ data: NormalizedLevel[] }> {
    type LevelsFile = { levels: Level[] }
    const levels = pickLocaleFile(levels_ru as LevelsFile, levels_en as LevelsFile)
    const data = levels.levels.map((level: Level) => normalizeLevels(level))
    return { data }
  },

  async getBubbles(): Promise<{ data: NormalizedBubble[] }> {
    type SkillsFile = { skills: Bubble[] }
    const skills = pickLocaleFile(skills_ru as SkillsFile, skills_en as SkillsFile)
    const data = skills.skills.map((bubble: Bubble, index: number) => normalizeSkillBubble(bubble, index))
    return { data }
  },

  async getProjectBubbles(): Promise<{ data: NormalizedBubble[] }> {
    type ProjectFile = { skills: Bubble[] }
    const project = pickLocaleFile(project_ru as ProjectFile, project_en as ProjectFile)
    const projectOffset = 10000 // avoid ID collisions with career bubbles
    const data = project.skills.map((bubble: Bubble, index: number) => {
      const bubbleWithDefaultYear: Bubble = {
        ...bubble,
        year: (bubble as Bubble & { year?: number }).year ?? GAME_CONFIG.initialYear,
      }
      return normalizeSkillBubble(bubbleWithDefaultYear, index + projectOffset)
    })
    return { data }
  },

  async getAchievements(): Promise<{ data: NormalizedAchievement[] }> {
    type AchievementsFile = { achievements: Achievement[] }
    const achievements = pickLocaleFile(achievements_ru as AchievementsFile, achievements_en as AchievementsFile)
    const data = achievements.achievements.map((a: Achievement) => normalizeAchievement(a))
    return { data }
  },

  async getBonuses(): Promise<{ data: NormalizedBonus[] }> {
    type BonusesFile = { bonuses: Bonus[] }
    const bonuses = pickLocaleFile(bonuses_ru as BonusesFile, bonuses_en as BonusesFile)
    const data = bonuses.bonuses.map((bonus: Bonus, index: number) => normalizeBonus(bonus, index))
    return { data }
  },

  async getMemoirs(): Promise<{ data: NormalizedMemoir[] }> {
    type MemoirsFile = { memoirs: Memoir[] }
    const memoirs = pickLocaleFile(memoirs_ru as MemoirsFile, memoirs_en as MemoirsFile)
    const data = memoirs.memoirs.map((memoir: Memoir, index: number) => normalizeMemoir(memoir, index))
    return { data }
  },

  async getOldBubbles(): Promise<{ data: NormalizedBubble[] }> {
    type OldFile = { old: OldBubble[] }
    const oldBubbles = pickLocaleFile(oldBubbles_ru as OldFile, oldBubbles_en as OldFile)
    const data = oldBubbles.old.map((bubble: OldBubble, index: number) => normalizeOldBubble(bubble, -(1000 + index)))
    return { data }
  },

  async getQuestions(): Promise<{ data: any[] }> {
    type QuestionsFile = { questions: any[] }
    const q = pickLocaleFile(questions_ru as QuestionsFile, questions_en as QuestionsFile)
    return { data: q.questions || [] }
  }
}

