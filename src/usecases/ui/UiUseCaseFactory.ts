import type { UiSessionStore, UiUiEventStore, UiRepository } from './types'
import { AnimateXPGainUseCase } from './AnimateXPGainUseCase'
import { ProcessShakeQueueUseCase } from './ProcessShakeQueueUseCase'

export class UiUseCaseFactory {
  constructor(
    private sessionStore: UiSessionStore,
    private uiEventStore: UiUiEventStore,
    private uiRepository: UiRepository
  ) {}

  createAnimateXPGainUseCase(): AnimateXPGainUseCase {
    return new AnimateXPGainUseCase()
  }

  createProcessShakeQueueUseCase(): ProcessShakeQueueUseCase {
    return new ProcessShakeQueueUseCase(this.uiEventStore)
  }
} 