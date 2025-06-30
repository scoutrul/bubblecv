import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useSessionStore } from '@entities/user-session/model/session-store'
import { useModalStore } from '@shared/stores/modal-store'
import './shared/ui/styles/index.css'

// Блокировка навигации по истории браузера
const preventHistoryNavigation = () => {
  // Добавляем фиктивную запись в историю
  history.pushState(null, '', window.location.href)
  
  // Блокируем попытки навигации
  window.addEventListener('popstate', (event) => {
    // Предотвращаем навигацию назад
    history.pushState(null, '', window.location.href)
    event.preventDefault()
    event.stopPropagation()
    return false
  })
  
  // Блокируем клавиатурные сочетания для навигации
  window.addEventListener('keydown', (event) => {
    // Блокируем Alt + Left/Right (Back/Forward)
    if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
    
    // Блокируем Cmd + Left/Right на Mac
    if (event.metaKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
    
    // Блокируем Backspace вне полей ввода
    if (event.key === 'Backspace') {
      const target = event.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      const isInput = tagName === 'input' || tagName === 'textarea' || target.isContentEditable
      
      if (!isInput) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }
  })
  
  console.log('🔒 Навигация по истории браузера заблокирована')
}

// Асинхронная инициализация приложения
const initApp = async () => {
  // Сразу блокируем навигацию
  preventHistoryNavigation()
  
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