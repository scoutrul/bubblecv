import type { UnlockBonusParams, UnlockBonusResult, BonusStore } from './types'

export class UnlockBonusUseCase {
  constructor(private bonusStore: BonusStore) {}

  async execute(params: UnlockBonusParams): Promise<UnlockBonusResult> {
    const { level } = params

    const bonus = this.bonusStore.getBonusByLevel(level)
    if (!bonus) {
      return { success: false, error: 'Bonus not found for this level' }
    }

    if (bonus.isUnlocked) {
      return { success: false, error: 'Bonus already unlocked' }
    }

    this.bonusStore.unlockBonusForLevel(level)
    this.bonusStore.updateUnlockedBonuses()

    return { success: true, bonus }
  }
} 