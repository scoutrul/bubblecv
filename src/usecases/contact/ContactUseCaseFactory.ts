import { SendMessageUseCase } from './SendMessageUseCase'
import { ResetContactFormUseCase } from './ResetContactFormUseCase'
import { ContactRepository } from './ContactRepository'
import type { ContactFormStore, ContactSessionStore } from './types'

export class ContactUseCaseFactory {
  constructor(
    private contactFormStore: ContactFormStore,
    private sessionStore: ContactSessionStore
  ) {}

  private createContactRepository(): ContactRepository {
    return new ContactRepository()
  }

  createSendMessageUseCase(): SendMessageUseCase {
    const contactRepository = this.createContactRepository()
    return new SendMessageUseCase(
      contactRepository,
      this.contactFormStore,
      this.sessionStore
    )
  }

  createResetContactFormUseCase(): ResetContactFormUseCase {
    return new ResetContactFormUseCase(this.contactFormStore)
  }
} 