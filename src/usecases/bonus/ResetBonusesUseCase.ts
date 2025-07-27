import type { BonusStore } from './types'

export class ResetBonusesUseCase {
  constructor(private bonusStore: BonusStore) {}

  execute(): void {
    this.bonusStore.resetBonuses()
  }
} 