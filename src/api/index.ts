import skills from '@/data/skills.json'
import levels from '@/data/levels.json'
import achievements from '@/data/achievements.json'

import type { NormalizedBubble, NormalizedAchievement } from '@/types/normalized'
import type { Bubble, Achievement } from '@/types/data'
import type { Level } from '@/types/levels'

import { normalizeSkillBubble, normalizeAchievement } from '@/utils/normalize'

export const api = {
  async getLevels(): Promise<{ data: Level[] }> {
    return { data: levels.levels }
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
}
