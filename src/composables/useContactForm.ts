import { ref } from 'vue'

interface ContactMessage {
    name: string
    email: string
    message: string
}

export function useContactForm() {
    const isSubmitting = ref(false)
    const error = ref<string | null>(null)
    const success = ref(false)

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

            const text = `
📬 <b>Новое сообщение с сайта:</b>

👤 <b>Имя:</b> ${data.name || 'Не указано'}
✉️ <b>Email:</b> ${data.email || 'Не указано'}
📝 <b>Сообщение:</b>
${data.message}
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