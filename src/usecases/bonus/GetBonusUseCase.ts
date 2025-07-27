import type { GetBonusByLevelParams, GetBonusByLevelResult, BonusStore } from './types'
import type { NormalizedBonus } from '@/types/normalized'

export class GetBonusUseCase {
  constructor(private bonusStore: BonusStore) {}

  getBonusByLevel(params: GetBonusByLevelParams): GetBonusByLevelResult {
    const { level } = params

    const bonus = this.bonusStore.getBonusByLevel(level)
    if (!bonus) {
      return { success: false, error: 'Bonus not found for this level' }
    }

    return { success: true, bonus }
  }

  getUnlockedBonuses(): NormalizedBonus[] {
    return this.bonusStore.unlockedBonuses
  }

  getUnlockedCount(): number {
    return this.bonusStore.unlockedBonuses.length
  }

  getAllBonuses(): NormalizedBonus[] {
    return this.bonusStore.bonuses
  }

  getUnlockedBonusForLevel(level: number): NormalizedBonus | null {
    const bonus = this.bonusStore.getBonusByLevel(level)
    return bonus?.isUnlocked ? bonus : null
  }
} 