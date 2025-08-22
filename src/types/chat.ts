export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
}

export interface ChatRepository {
  ask(question: string): Promise<string>
}

export interface AskQuestionUseCase {
  execute(params: { question: string }): Promise<{ answer: string }>
}

export interface ChatUseCaseFactory {
  createAskQuestionUseCase(): AskQuestionUseCase
}
