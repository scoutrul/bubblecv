import { UnlockAchievementUseCase } from './UnlockAchievementUseCase'
import { ResetAchievementsUseCase } from './ResetAchievementsUseCase'
import { GetAchievementsUseCase } from './GetAchievementsUseCase'
import type { AchievementStore, SessionStore } from './types'

export class AchievementUseCaseFactory {
  constructor(
    private achievementStore: AchievementStore,
    private sessionStore: SessionStore
  ) {}

  createUnlockAchievementUseCase(): UnlockAchievementUseCase {
    return new UnlockAchievementUseCase(
      this.achievementStore,
      this.sessionStore
    )
  }

  createResetAchievementsUseCase(): ResetAchievementsUseCase {
    return new ResetAchievementsUseCase(this.achievementStore)
  }

  createGetAchievementsUseCase(): GetAchievementsUseCase {
    return new GetAchievementsUseCase(this.achievementStore)
  }
} 