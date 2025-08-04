import { GainXPUseCase } from './GainXPUseCase'
import { LoseLivesUseCase } from './LoseLivesUseCase'
import { VisitBubbleUseCase } from './VisitBubbleUseCase'
import { UpdateCurrentYearUseCase } from './UpdateCurrentYearUseCase'
import { StartSessionUseCase } from './StartSessionUseCase'
import { SavePhilosophyAnswerUseCase } from './SavePhilosophyAnswerUseCase'
import type { 
  SessionSessionStore, 
  SessionLevelStore, 
  SessionAchievementStore, 
  SessionBonusStore, 
  SessionCanvasRepository,
  SessionMemoirStore
} from './types'

export class SessionUseCaseFactory {
  constructor(
    private sessionStore: SessionSessionStore,
    private levelStore: SessionLevelStore,
    private achievementStore: SessionAchievementStore,
    private bonusStore: SessionBonusStore,
    private canvasRepository: SessionCanvasRepository,
    private memoirStore?: SessionMemoirStore
  ) {}

  createGainXPUseCase(): GainXPUseCase {
    return new GainXPUseCase(
      this.sessionStore,
      this.levelStore,
      this.achievementStore,
      this.bonusStore
    )
  }

  createLoseLivesUseCase(): LoseLivesUseCase {
    return new LoseLivesUseCase(
      this.sessionStore,
      this.achievementStore,
    )
  }

  createVisitBubbleUseCase(): VisitBubbleUseCase {
    return new VisitBubbleUseCase(this.sessionStore)
  }

  createUpdateCurrentYearUseCase(): UpdateCurrentYearUseCase {
    return new UpdateCurrentYearUseCase(this.sessionStore)
  }

  createStartSessionUseCase(): StartSessionUseCase {
    return new StartSessionUseCase(
      this.sessionStore,
      this.achievementStore,
      this.bonusStore,
      this.canvasRepository,
      this.memoirStore
    )
  }

  createSavePhilosophyAnswerUseCase(): SavePhilosophyAnswerUseCase {
    return new SavePhilosophyAnswerUseCase(this.sessionStore)
  }
} 