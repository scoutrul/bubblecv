# BubbleMe Server

Сервер для обработки сообщений из формы обратной связи и отправки их в Telegram.

## Установка

1. Перейдите в директорию сервера:
```bash
cd server
```

2. Установите зависимости:
```bash
npm install
```

## Настройка

1. Создайте файл `.env` в папке `server/` на основе `../env.example.server`:
```bash
cp ../env.example.server .env
```

2. Отредактируйте `.env` файл, указав ваши реальные данные:
```env
PORT=3001
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id
```

### Как получить данные для Telegram:

1. **TELEGRAM_BOT_TOKEN**: 
   - Создайте бота через [@BotFather](https://t.me/botfather)
   - Отправьте команду `/newbot` и следуйте инструкциям
   - Скопируйте полученный токен

2. **TELEGRAM_CHAT_ID**:
   - Начните диалог с вашим ботом
   - Отправьте любое сообщение боту
   - Перейдите по ссылке: `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
   - Найдите в ответе `"chat":{"id":123456789}` - это ваш chat_id

## Запуск

### Режим разработки (с автоперезагрузкой):
```bash
npm run dev
```

### Обычный запуск:
```bash
npm start
```

Сервер будет доступен по адресу: `http://localhost:3001`

## API Endpoints

### POST /api/send-message

Отправляет сообщение в Telegram.

**Body:**
```json
{
  "name": "Имя отправителя",
  "email": "email@example.com",
  "message": "Текст сообщения"
}
```

**Response:**
```json
{
  "success": true
}
```

## Зависимости

- `express` - веб-фреймворк
- `axios` - HTTP клиент для отправки запросов в Telegram API
- `cors` - middleware для обработки CORS запросов 