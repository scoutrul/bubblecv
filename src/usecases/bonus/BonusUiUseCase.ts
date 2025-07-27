import type { UiEventStore } from './types'

export class BonusUiUseCase {
  constructor(private uiEventStore: UiEventStore) {}

  toggleBonusPanel(): void {
    this.uiEventStore.toggleBonusPanel()
  }

  closeBonusPanel(): void {
    this.uiEventStore.closeBonusPanel()
  }

  isBonusPanelActive(): boolean {
    return this.uiEventStore.bonusesActive
  }
} 