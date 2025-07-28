import type { ContactFormStore } from './types'

export class ResetContactFormUseCase {
  constructor(private contactFormStore: ContactFormStore) {}

  execute(): void {
    this.contactFormStore.resetState()
  }
} 