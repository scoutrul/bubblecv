import type { Achievement } from '@/types/data'
import type { UserSession } from '@/types/session'

export interface UnlockAchievementParams {
  id: string
  showModal?: boolean
}

export interface UnlockAchievementResult {
  success: boolean
  achievement?: Achievement
  error?: string
}

export interface AchievementStore {
  achievements: Achievement[]
  isLoading: boolean
  loadAchievements(): Promise<void>
}

export interface SessionStore {
  session: UserSession | null
  setHasDestroyedToughBubble(value: boolean): void
  setHasUnlockedFirstToughBubbleAchievement(value: boolean): void
  setHasUnlockedSecretBubbleAchievement(value: boolean): void
}

export interface UiEventStore {
  showAchievements: boolean
  toggleAchievements(): void
  closeAchievements(): void
}

export interface AchievementUseCase {
  unlockAchievement(params: UnlockAchievementParams): Promise<UnlockAchievementResult>
  resetAchievements(): void
  getUnlockedCount(): number
  getUnlockedAchievements(): Achievement[]
} 