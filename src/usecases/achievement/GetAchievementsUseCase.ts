import type { AchievementStore } from './types'
import type { Achievement } from '@/types/data'

export class GetAchievementsUseCase {
  constructor(private achievementStore: AchievementStore) {}

  getUnlockedAchievements(): Achievement[] {
    return this.achievementStore.achievements.filter((a: Achievement) => a.isUnlocked)
  }

  getUnlockedCount(): number {
    return this.achievementStore.achievements.filter((a: Achievement) => a.isUnlocked).length
  }

  getAllAchievements(): Achievement[] {
    return this.achievementStore.achievements
  }
} 