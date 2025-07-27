import { ref } from 'vue'
import type { UnlockAchievementParams, UnlockAchievementResult, AchievementStore, SessionStore, UiEventStore } from './types'
import type { Achievement } from '@/types/data'

export class UnlockAchievementUseCase {
  private pendingUnlockIds = ref(new Set<string>())

  constructor(
    private achievementStore: AchievementStore,
    private sessionStore: SessionStore,
    private uiEventStore: UiEventStore
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
      // Проверяем условия для конкретных ачивок
      if (id === 'tough-bubble-popper') {
        if (this.sessionStore.session?.hasUnlockedFirstToughBubbleAchievement) {
          return { success: false, error: 'Achievement already unlocked' }
        }
        this.sessionStore.setHasDestroyedToughBubble(true)
        this.sessionStore.setHasUnlockedFirstToughBubbleAchievement(true)
      }

      achievement.isUnlocked = true
      this.uiEventStore.queueShake('achievements')

      if (showModal) {
        achievement.isShown = true
      }

      return { success: true, achievement }
    } finally {
      this.pendingUnlockIds.value.delete(id)
    }
  }
} 