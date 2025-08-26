export type ChatTranscriptItem = {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export type ChatTranscriptPayload = {
  sessionId: string
  items: ChatTranscriptItem[]
  url?: string
}

function makeText(payload: ChatTranscriptPayload): string {
  const header = `BubbleMe Chat Session: ${payload.sessionId}`
  const lines = payload.items.map(item => {
    const prefix = item.role === 'user' ? '👤 Пользователь' : '🤖 Бот'
    const time = new Date(item.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    return `${prefix} (${time}):\n${item.content}`
  })
  const urlLine = payload.url ? `\n\nURL: ${payload.url}` : ''
  return [header, ...lines].join('\n\n') + urlLine
}

export async function sendChatTranscript(payload: ChatTranscriptPayload): Promise<void> {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID

  const text = makeText(payload)

  if (!botToken || !chatId) return

  const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
  try {
    await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    })
  } catch (e) {
    // silent
  }
}
