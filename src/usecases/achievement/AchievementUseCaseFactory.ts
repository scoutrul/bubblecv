import { UnlockAchievementUseCase } from './UnlockAchievementUseCase'
import { ResetAchievementsUseCase } from './ResetAchievementsUseCase'
import { GetAchievementsUseCase } from './GetAchievementsUseCase'
import type { AchievementStore, SessionStore, UiEventStore } from './types'

export class AchievementUseCaseFactory {
  constructor(
    private achievementStore: AchievementStore,
    private sessionStore: SessionStore,
    private uiEventStore: UiEventStore
  ) {}

  createUnlockAchievementUseCase(): UnlockAchievementUseCase {
    return new UnlockAchievementUseCase(
      this.achievementStore,
      this.sessionStore,
      this.uiEventStore
    )
  }

  createResetAchievementsUseCase(): ResetAchievementsUseCase {
    return new ResetAchievementsUseCase(this.achievementStore)
  }

  createGetAchievementsUseCase(): GetAchievementsUseCase {
    return new GetAchievementsUseCase(this.achievementStore)
  }
} 