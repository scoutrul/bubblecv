#!/bin/bash

echo "🚀 Запуск BubbleMe проекта..."

# Функция для остановки всех процессов при завершении скрипта
cleanup() {
    echo "🛑 Остановка серверов..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Устанавливаем обработчик сигналов
trap cleanup SIGINT SIGTERM

# Запускаем сервер в фоне
echo "📡 Запуск бэкенд сервера (порт 3001)..."
(cd server && npm start) &
SERVER_PID=$!

# Ждем немного, чтобы сервер успел запуститься
sleep 2

# Запускаем фронтенд
echo "🎨 Запуск фронтенд приложения (порт 3000)..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Проект запущен!"
echo "📱 Фронтенд: http://localhost:3000"
echo "🖥️  Бэкенд: http://localhost:3001"
echo "💡 Для остановки нажмите Ctrl+C"

# Ждем завершения процессов
wait 