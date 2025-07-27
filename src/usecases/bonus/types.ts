import type { NormalizedBonus } from '@/types/normalized'

export interface UnlockBonusParams {
  level: number
}

export interface UnlockBonusResult {
  success: boolean
  bonus?: NormalizedBonus
  error?: string
}

export interface OpenBonusModalParams {
  bonus: NormalizedBonus
}

export interface OpenBonusModalResult {
  success: boolean
  error?: string
}

export interface GetBonusByLevelParams {
  level: number
}

export interface GetBonusByLevelResult {
  success: boolean
  bonus?: NormalizedBonus
  error?: string
}

export interface BonusStore {
  bonuses: NormalizedBonus[]
  unlockedBonuses: NormalizedBonus[]
  isLoading: boolean
  loadBonuses(): Promise<void>
  getBonusByLevel(level: number): NormalizedBonus | undefined
  unlockBonusForLevel(level: number): void
  updateUnlockedBonuses(): void
  resetBonuses(): void
}

export interface ModalStore {
  currentEventChain: any
  setCurrentBonus(bonus: NormalizedBonus | null): void
  openModal(modalType: string): void
  closeModal(modalType: string): void
  completeEventChain(): void
}

export interface UiEventStore {
  bonusesActive: boolean
  toggleBonusPanel(): void
  closeBonusPanel(): void
}

export interface BonusUseCase {
  unlockBonus(params: UnlockBonusParams): Promise<UnlockBonusResult>
  openBonusModal(params: OpenBonusModalParams): Promise<OpenBonusModalResult>
  getBonusByLevel(params: GetBonusByLevelParams): GetBonusByLevelResult
  resetBonuses(): void
  getUnlockedBonuses(): NormalizedBonus[]
  getUnlockedCount(): number
} 