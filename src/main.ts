import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import '@/styles/index.css'
import { preventHistoryNavigation } from '@/utils/navigation'

const initApp = () => {
  preventHistoryNavigation()
  
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.mount('#app')
}

initApp() 