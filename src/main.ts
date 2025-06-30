import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useSessionStore } from '@entities/user-session/model/session-store'
import { useModalStore } from '@shared/stores/modal-store'
import './shared/ui/styles/index.css'

// Асинхронная инициализация приложения
const initApp = async () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  // Инициализируем сессию пользователя при запуске приложения
  const sessionStore = useSessionStore()
  await sessionStore.loadSession()

  // Проверяем нужно ли показать welcome модалку
  const modalStore = useModalStore()
  if (modalStore.shouldShowWelcome()) {
    // Небольшая задержка для лучшего UX
    setTimeout(() => {
      modalStore.openWelcome()
    }, 500)
  }

  app.mount('#app')
  console.log('✅ Приложение запущено!')
}

// Запускаем приложение
initApp().catch(error => {
  console.error('❌ Ошибка инициализации приложения:', error)
}) 