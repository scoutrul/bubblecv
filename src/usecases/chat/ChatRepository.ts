import { askOpenAI } from '@/api/openai'
import type { ChatRepository as IChatRepository } from '@/types/chat'

export class ChatRepository implements IChatRepository {
  async ask(question: string): Promise<string> {
    if (!question.trim()) {
      throw new Error('Question cannot be empty')
    }
    
    return await askOpenAI(question.trim())
  }
}
