import type { SendMessageParams, SendMessageResult, ContactFormStore, ContactSessionStore } from './types'
import { ContactRepository } from './ContactRepository'

export class SendMessageUseCase {
  constructor(
    private contactRepository: ContactRepository,
    private contactFormStore: ContactFormStore,
    private sessionStore: ContactSessionStore
  ) {}

  async execute(params: SendMessageParams): Promise<SendMessageResult> {
    const { message } = params

    // Валидация
    if (!message.message) {
      return { success: false, error: 'Сообщение обязательно для заполнения' }
    }

    // Устанавливаем состояние загрузки
    this.contactFormStore.setSubmitting(true)
    this.contactFormStore.setError(null)
    this.contactFormStore.setSuccess(false)

    try {
      // Формируем текст сообщения
      const text = this.formatMessageText(message)
      
      // Отправляем сообщение
      await this.contactRepository.sendMessage(text)
      
      // Устанавливаем успешное состояние
      this.contactFormStore.setSuccess(true)
      this.contactFormStore.setSubmitting(false)
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err)
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при отправке сообщения'
      
      this.contactFormStore.setError(errorMessage)
      this.contactFormStore.setSubmitting(false)
      
      return { success: false, error: errorMessage }
    }
  }

  private formatMessageText(message: { name: string; contact: string; message: string }): string {
    // Получаем все философские ответы (выбранные + кастомные)
    const allAnswers = this.sessionStore.session.value?.allPhilosophyAnswers || {}
    const hasAnswers = Object.keys(allAnswers).length > 0

    // Формируем секцию со всеми философскими ответами
    let philosophyAnswersText = ''
    if (hasAnswers) {
      philosophyAnswersText = '\n\n🤔 <b>Философские ответы пользователя:</b>\n'
      Object.entries(allAnswers).forEach(([questionId, answerData], index) => {
        const icon = answerData.type === 'custom' ? '💭' : '✅'
        const typeText = answerData.type === 'custom' ? 'Свой ответ' : 'Выбрал'
        
        philosophyAnswersText += `\n<b>${index + 1}.</b> <i>${answerData.questionText}</i>\n${icon} <b>${typeText}:</b> "${answerData.answer}"\n`
      })
    }

    return `
📬 <b>Новое сообщение с сайта:</b>

👤 <b>Имя:</b> ${message.name || 'Не указано'}
📞 <b>Контакт:</b> ${message.contact || 'Не указано'}
📝 <b>Сообщение:</b>
${message.message}${philosophyAnswersText}
    `.trim()
  }
} 