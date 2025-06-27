import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useSessionStore } from '@entities/user-session/model/session-store'
import './shared/ui/styles/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Инициализируем сессию пользователя при запуске приложения
const sessionStore = useSessionStore()
sessionStore.loadSession()

app.mount('#app') 