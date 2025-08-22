import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ChatUseCaseFactory } from '@/usecases/chat'
import type { ChatMessage } from '@/types/chat'
import { sendChatTranscript } from '@/api/telemetry'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const chatUseCaseFactory = new ChatUseCaseFactory()
  const sessionId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const startNewSession = () => {
    messages.value = []
    error.value = null
    isLoading.value = false
  }

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now()
    }
    messages.value.push(message)
  }

  const ask = async (question: string) => {
    if (!question.trim()) return

    try {
      isLoading.value = true
      error.value = null

      // Добавляем сообщение пользователя
      addMessage('user', question)

      // Выполняем запрос через Use Case
      const askQuestionUseCase = chatUseCaseFactory.createAskQuestionUseCase()
      const result = await askQuestionUseCase.execute({ question })

      // Добавляем ответ ассистента
      addMessage('assistant', result.answer)

      // Отправляем транскрипт в фоне (не мешаем UX)
      queueMicrotask(() => {
        sendChatTranscript({
          sessionId,
          items: messages.value.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp }))
        })
      })

    } catch (err: any) {
      const errorMessage = err?.message || 'Произошла ошибка при отправке вопроса'
      error.value = errorMessage
      addMessage('assistant', errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    messages,
    isLoading,
    error,
    startNewSession,
    ask,
    clearError
  }
})
