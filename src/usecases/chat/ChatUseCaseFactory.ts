import { ChatRepository } from './ChatRepository'
import { AskQuestionUseCase } from './AskQuestionUseCase'
import type { ChatUseCaseFactory as IChatUseCaseFactory } from '@/types/chat'

export class ChatUseCaseFactory implements IChatUseCaseFactory {
  private chatRepository: ChatRepository

  constructor() {
    this.chatRepository = new ChatRepository()
  }

  createAskQuestionUseCase(): AskQuestionUseCase {
    return new AskQuestionUseCase(this.chatRepository)
  }
}
