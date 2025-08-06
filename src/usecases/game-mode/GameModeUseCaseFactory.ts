import { GetGameModeUseCase } from './GetGameModeUseCase'
import { ShouldShowProjectTransitionModalUseCase } from './ShouldShowProjectTransitionModalUseCase'
import type { SessionSessionStore } from '@/usecases/session/types'

export class GameModeUseCaseFactory {
  constructor(private sessionStore: SessionSessionStore) {}

  createGetGameModeUseCase(): GetGameModeUseCase {
    return new GetGameModeUseCase(this.sessionStore)
  }

  createShouldShowProjectTransitionModalUseCase(): ShouldShowProjectTransitionModalUseCase {
    return new ShouldShowProjectTransitionModalUseCase(this.sessionStore)
  }
} 