import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
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
}

// Асинхронная инициализация приложения
const initApp = async () => {
  // Сразу блокируем навигацию
  preventHistoryNavigation()
  
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  app.mount('#app')
}

initApp() 