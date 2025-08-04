import type { 
  LoseLivesParams, 
  LoseLivesResult, 
  SessionSessionStore, 
  SessionAchievementStore, 
} from './types'

export class LoseLivesUseCase {
  constructor(
    private sessionStore: SessionSessionStore,
    private achievementStore: SessionAchievementStore,
  ) {}

  async execute(params: LoseLivesParams): Promise<LoseLivesResult> {
    const { amount = 1 } = params

    if (!this.sessionStore.session) {
      return { 
        success: false, 
        livesRemaining: 0, 
        gameCompleted: false, 
        error: 'Сессия не найдена' 
      }
    }

    const currentLives = this.sessionStore.session.lives

    // Если теряем больше жизней, чем есть
    if (amount >= currentLives) {
      this.sessionStore.setLives(0)
      this.sessionStore.setGameCompleted(true)
      
      return {
        success: true,
        livesRemaining: 0,
        gameCompleted: true
      }
    }

    // Уменьшаем жизни
    const newLives = Math.max(0, currentLives - amount)
    this.sessionStore.setLives(newLives)

    // Проверяем, закончилась ли игра
    if (newLives === 0) {
      this.sessionStore.setGameCompleted(true)
    }

    // Проверяем достижение "на грани"
    if (newLives === 1) {
      const achievement = await this.achievementStore.unlockAchievement('on-the-edge', false)
      if (achievement) {
        // Показываем модалку через Event Chain систему с задержкой
        const { createPendingAchievement } = await import('@/composables/useModals')
        
        // Создаем Event Chain для ачивки с задержкой
        setTimeout(async () => {
          const { useModalStore } = await import('@/stores/modal.store')
          const store = useModalStore()
          
          store.startEventChain({
            type: 'manual',
            pendingAchievements: [createPendingAchievement(achievement)],
            pendingLevelAchievements: [],
            pendingLevelUp: null,
            currentStep: 'achievement',
            context: {}
          })
        }, 100) // Небольшая задержка для завершения других модалок
      } else {
        console.log('❌ LoseLivesUseCase: Достижение "на краю" не разблокировано')
      }
    }

   return {
      success: true,
      livesRemaining: newLives,
      gameCompleted: newLives === 0
    }
  }
} 