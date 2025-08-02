import type {
  AppSessionStore,
  AppBubbleStore,
  AppLevelStore,
  AppAchievementStore,
  AppBonusStore,
  AppModalStore,
  AppRepository,
  AppMemoirStore
} from './types'
import { InitializeAppUseCase } from './InitializeAppUseCase'
import { ResetGameUseCase } from './ResetGameUseCase'
import { LoadOldBubblesUseCase } from './LoadOldBubblesUseCase'
import { GetGameStateUseCase } from './GetGameStateUseCase'

export class AppUseCaseFactory {
  constructor(
    private sessionStore: AppSessionStore,
    private bubbleStore: AppBubbleStore,
    private levelStore: AppLevelStore,
    private achievementStore: AppAchievementStore,
    private bonusStore: AppBonusStore,
    private modalStore: AppModalStore,
    private repository: AppRepository,
    private memoirStore?: AppMemoirStore
  ) {}

  createInitializeAppUseCase(): InitializeAppUseCase {
    return new InitializeAppUseCase(
      this.sessionStore,
      this.bubbleStore,
      this.levelStore,
      this.achievementStore,
      this.bonusStore,
      this.modalStore,
      this.repository,
      this.memoirStore
    )
  }

  createResetGameUseCase(): ResetGameUseCase {
    return new ResetGameUseCase(
      this.sessionStore,
      this.modalStore
    )
  }

  createLoadOldBubblesUseCase(): LoadOldBubblesUseCase {
    return new LoadOldBubblesUseCase(
      this.sessionStore,
      this.bubbleStore,
      this.repository
    )
  }

  createGetGameStateUseCase(): GetGameStateUseCase {
    return new GetGameStateUseCase(
      this.sessionStore,
      this.bubbleStore,
      this.levelStore,
      this.repository
    )
  }
} 