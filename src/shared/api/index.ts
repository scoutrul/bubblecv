import skills from '../data/skills.json'
import levels from '../data/levels.json'
import achievements from '../data/achievements.json'

import type { NormalizedSkillBubble, NormalizedAchievement } from '../types/normalized'
import type { Bubble, Achievement } from '../types/data'
import type { Level } from '../types/levels'

import { normalizeSkillBubble, normalizeAchievement } from '../utils/normalize'

export const api = {
  async getLevels(): Promise<{ data: Level[] }> {
    const data: Level[] = levels.levels
    return { data }
  },
  
  async getBubbles(): Promise<{ data: NormalizedSkillBubble[] }> {
    const data: NormalizedSkillBubble[] = skills.skills.map((bubble, id) => normalizeSkillBubble(bubble as Bubble, id))
    return { data }
  },

  async getAchievements(): Promise<{ data: NormalizedAchievement[] }> {
    const data: NormalizedAchievement[] = achievements.achievements.map((achievement) => normalizeAchievement(achievement as Achievement))
    return { data }
  },
} 