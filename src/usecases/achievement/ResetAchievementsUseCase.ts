import type { AchievementStore } from './types'
import type { Achievement } from '@/types/data'

export class ResetAchievementsUseCase {
  constructor(private achievementStore: AchievementStore) {}

  execute(): void {
    this.achievementStore.achievements.forEach((a: Achievement) => {
      a.isUnlocked = false
      a.isShown = false
    })
  }
} 