import type { AskQuestionUseCase as IAskQuestionUseCase, ChatRepository } from '@/types/chat'

export class AskQuestionUseCase implements IAskQuestionUseCase {
  constructor(private chatRepository: ChatRepository) {}

  async execute(params: { question: string }): Promise<{ answer: string }> {
    const { question } = params
    
    if (!question || question.trim().length === 0) {
      throw new Error('Question is required')
    }

    if (question.trim().length > 1000) {
      throw new Error('Question is too long (max 1000 characters)')
    }

    const answer = await this.chatRepository.ask(question)
    
    return { answer }
  }
}
