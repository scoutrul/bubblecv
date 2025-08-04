import type { UiUiEventStore } from './types'
import { AnimateXPGainUseCase } from './AnimateXPGainUseCase'
import { ProcessShakeQueueUseCase } from './ProcessShakeQueueUseCase'

export class UiUseCaseFactory {
  constructor(
    private uiEventStore: UiUiEventStore,
  ) {}

  createAnimateXPGainUseCase(): AnimateXPGainUseCase {
    return new AnimateXPGainUseCase()
  }

  createProcessShakeQueueUseCase(): ProcessShakeQueueUseCase {
    return new ProcessShakeQueueUseCase(this.uiEventStore)
  }
} 