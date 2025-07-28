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
  SessionUiEventStore, 
  SessionModalStore, 
  SessionCanvasRepository 
} from './types'

export class SessionUseCaseFactory {
  constructor(
    private sessionStore: SessionSessionStore,
    private levelStore: SessionLevelStore,
    private achievementStore: SessionAchievementStore,
    private bonusStore: SessionBonusStore,
    private uiEventStore: SessionUiEventStore,
    private modalStore: SessionModalStore,
    private canvasRepository: SessionCanvasRepository
  ) {}

  createGainXPUseCase(): GainXPUseCase {
    return new GainXPUseCase(
      this.sessionStore,
      this.levelStore,
      this.achievementStore,
      this.bonusStore,
      this.uiEventStore
    )
  }

  createLoseLivesUseCase(): LoseLivesUseCase {
    return new LoseLivesUseCase(
      this.sessionStore,
      this.achievementStore,
      this.uiEventStore
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
      this.canvasRepository
    )
  }

  createSavePhilosophyAnswerUseCase(): SavePhilosophyAnswerUseCase {
    return new SavePhilosophyAnswerUseCase(this.sessionStore)
  }
} 