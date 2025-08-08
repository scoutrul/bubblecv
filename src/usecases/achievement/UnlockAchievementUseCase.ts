import { ref } from 'vue'
import type { UnlockAchievementParams, UnlockAchievementResult, AchievementStore, SessionStore } from './types'
import type { Achievement } from '@/types/data'

export class UnlockAchievementUseCase {
  private pendingUnlockIds = ref(new Set<string>())

  constructor(
    private achievementStore: AchievementStore,
    private sessionStore: SessionStore
  ) {}

  async execute(params: UnlockAchievementParams): Promise<UnlockAchievementResult> {
    const { id, showModal = true } = params

    if (this.pendingUnlockIds.value.has(id)) {
      return { success: false, error: 'Achievement unlock already in progress' }
    }

    const achievement = this.achievementStore.achievements.find((a: Achievement) => a.id === id)
    if (!achievement) {
      return { success: false, error: 'Achievement not found' }
    }

    if (achievement.isUnlocked) {
      return { success: false, error: 'Achievement already unlocked' }
    }

    this.pendingUnlockIds.value.add(id)

    try {
      if (id === 'tough-bubble-popper') {
        if (this.sessionStore.session?.hasUnlockedFirstToughBubbleAchievement) {
          return { success: false, error: 'Achievement already unlocked' }
        }
        this.sessionStore.setHasDestroyedToughBubble(true)
        this.sessionStore.setHasUnlockedFirstToughBubbleAchievement(true)
      }

      if (id === 'secret-bubble-discoverer') {
        if (this.sessionStore.session?.hasUnlockedSecretBubbleAchievement) {
          return { success: false, error: 'Achievement already unlocked' }
        }
        this.sessionStore.setHasUnlockedSecretBubbleAchievement(true)
      }

      achievement.isUnlocked = true

      if (showModal) {
        achievement.isShown = true
      }

      return { success: true, achievement }
    } finally {
      this.pendingUnlockIds.value.delete(id)
    }
  }
} 