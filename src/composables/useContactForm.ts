import { ref } from 'vue'
import { useSessionStore } from '@/stores'

interface ContactMessage {
    name: string
    email: string
    message: string
}

export function useContactForm() {
    const isSubmitting = ref(false)
    const error = ref<string | null>(null)
    const success = ref(false)
    const sessionStore = useSessionStore()

    const sendMessage = async (data: ContactMessage) => {
        if (!data.message) {
            error.value = 'Сообщение обязательно для заполнения'
            return false
        }

        isSubmitting.value = true
        error.value = null
        success.value = false

        try {
            const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
            const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

            if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
                throw new Error('Telegram конфигурация не настроена')
            }

                  // Получаем все философские ответы (выбранные + кастомные)
      const allAnswers = sessionStore.session?.allPhilosophyAnswers || {}
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

            const text = `
📬 <b>Новое сообщение с сайта:</b>

👤 <b>Имя:</b> ${data.name || 'Не указано'}
✉️ <b>Email:</b> ${data.email || 'Не указано'}
📝 <b>Сообщение:</b>
${data.message}${philosophyAnswersText}
      `.trim()

            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text,
                    parse_mode: 'HTML'
                })
            })

            const result = await response.json()

            if (result.ok) {
                success.value = true
                return true
            } else {
                error.value = result.description || 'Ошибка отправки в Telegram'
                return false
            }
        } catch (err) {
            console.error('Ошибка при отправке сообщения:', err)
            error.value = 'Произошла ошибка при отправке сообщения'
            return false
        } finally {
            isSubmitting.value = false
        }
    }

    const resetState = () => {
        error.value = null
        success.value = false
    }

    return {
        isSubmitting,
        error,
        success,
        sendMessage,
        resetState
    }
} 