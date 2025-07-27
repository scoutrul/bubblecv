import type { OpenBonusModalParams, OpenBonusModalResult, ModalStore } from './types'

export class OpenBonusModalUseCase {
  constructor(private modalStore: ModalStore) {}

  async execute(params: OpenBonusModalParams): Promise<OpenBonusModalResult> {
    const { bonus } = params

    if (!bonus.isUnlocked) {
      return { success: false, error: 'Bonus is not unlocked' }
    }

    // Приостанавливаем Event Chain если он активен
    const currentChain = this.modalStore.currentEventChain
    if (currentChain) {
      // Сохраняем состояние Event Chain для восстановления после закрытия бонуса
      sessionStorage.setItem('pausedEventChain', JSON.stringify(currentChain))
      this.modalStore.completeEventChain()
    }

    this.modalStore.setCurrentBonus(bonus)
    this.modalStore.openModal('bonus')

    return { success: true }
  }
} 