import { UnlockBonusUseCase } from './UnlockBonusUseCase'
import { OpenBonusModalUseCase } from './OpenBonusModalUseCase'
import { GetBonusUseCase } from './GetBonusUseCase'
import { ResetBonusesUseCase } from './ResetBonusesUseCase'
import { BonusUiUseCase } from './BonusUiUseCase'
import type { BonusStore, ModalStore, UiEventStore } from './types'

export class BonusUseCaseFactory {
  constructor(
    private bonusStore: BonusStore,
    private modalStore: ModalStore,
    private uiEventStore: UiEventStore
  ) {}

  createUnlockBonusUseCase(): UnlockBonusUseCase {
    return new UnlockBonusUseCase(this.bonusStore)
  }

  createOpenBonusModalUseCase(): OpenBonusModalUseCase {
    return new OpenBonusModalUseCase(this.modalStore)
  }

  createGetBonusUseCase(): GetBonusUseCase {
    return new GetBonusUseCase(this.bonusStore)
  }

  createResetBonusesUseCase(): ResetBonusesUseCase {
    return new ResetBonusesUseCase(this.bonusStore)
  }

  createBonusUiUseCase(): BonusUiUseCase {
    return new BonusUiUseCase(this.uiEventStore)
  }
} 