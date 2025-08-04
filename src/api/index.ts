import skills from '@/data/skills.json'
import levels from '@/data/levels.json'
import achievements from '@/data/achievements.json'
import bonuses from '@/data/bonuses.json'
import memoirs from '@/data/memoirs.json'
import oldBubbles from '@/data/old.json'

import type { NormalizedBubble, NormalizedAchievement, NormalizedLevel, NormalizedBonus, NormalizedMemoir } from '@/types/normalized'
import type { Bubble, Achievement, Bonus, Memoir } from '@/types/data'
import type { Level } from '@/types/levels'

import { normalizeSkillBubble, normalizeAchievement, normalizeLevels, normalizeBonus, normalizeMemoir, normalizeOldBubble } from '@/utils'

export const api = {
  async getLevels(): Promise<{ data: NormalizedLevel[] }> {
    const data = levels.levels.map((level) =>
      normalizeLevels(level as Level)
    )
    return { data }
  },

  async getBubbles(): Promise<{ data: NormalizedBubble[] }> {
    const data = skills.skills.map((bubble, index) =>
      normalizeSkillBubble(bubble as Bubble, index)
    )
    return { data }
  },

  async getAchievements(): Promise<{ data: NormalizedAchievement[] }> {
    const data = achievements.achievements.map((a) =>
      normalizeAchievement(a as Achievement)
    )
    return { data }
  },

  async getBonuses(): Promise<{ data: NormalizedBonus[] }> {
    const data = bonuses.bonuses.map((bonus, index) =>
      normalizeBonus(bonus as Bonus, index)
    )
    return { data }
  },

  async getMemoirs(): Promise<{ data: NormalizedMemoir[] }> {
    const data = memoirs.memoirs.map((memoir, index) =>
      normalizeMemoir(memoir as Memoir, index)
    )
    return { data }
  },

  async getOldBubbles(): Promise<{ data: NormalizedBubble[] }> {
    const data = oldBubbles.old.map((bubble, index) =>
      normalizeOldBubble(bubble as Bubble, -(1000 + index)) // Отрицательные ID для old bubbles
    )
    return { data }
  }
}
