import { UiRepositoryImpl } from './UiRepository'
import { AnimateXPGainUseCase } from './AnimateXPGainUseCase'
import type { UiUiEventStore } from './types'

export class UiUseCaseFactory {
  constructor(private uiEventStore: UiUiEventStore) {}

  createUiRepository(): UiRepositoryImpl {
    return new UiRepositoryImpl()
  }

  createAnimateXPGainUseCase(): AnimateXPGainUseCase {
    return new AnimateXPGainUseCase()
  }
} 