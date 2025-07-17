require('dotenv').config()
const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

// Настройки Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('❌ Ошибка: TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID должны быть установлены в переменных окружения')
  process.exit(1)
}

// Middleware
app.use(cors())
app.use(express.json())

// Эндпоинт для получения сообщений с фронта
app.post('/api/send-message', async (req, res) => {
  const { name, email, message } = req.body

  if (!message) {
    return res.status(400).send({ success: false, error: 'Message is required' })
  }

  const text = `
📬 <b>Новое сообщение с сайта:</b>

👤 <b>Имя:</b> ${name || 'Не указано'}
✉️ <b>Email:</b> ${email || 'Не указано'}
📝 <b>Сообщение:</b>
${message}
  `.trim()

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML'
    })

    res.send({ success: true })
  } catch (err) {
    console.error('Ошибка при отправке сообщения в Telegram:', err.message)
    res.status(500).send({ success: false, error: 'Ошибка отправки' })
  }
})

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`)
}) 