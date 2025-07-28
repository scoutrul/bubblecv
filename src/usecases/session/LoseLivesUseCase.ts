import type { 
  LoseLivesParams, 
  LoseLivesResult, 
  SessionSessionStore, 
  SessionAchievementStore, 
  SessionUiEventStore 
} from './types'

export class LoseLivesUseCase {
  constructor(
    private sessionStore: SessionSessionStore,
    private achievementStore: SessionAchievementStore,
    private uiEventStore: SessionUiEventStore
  ) {}

  async execute(params: LoseLivesParams): Promise<LoseLivesResult> {
    const { amount = 1 } = params

    if (!this.sessionStore.session.value) {
      return { 
        success: false, 
        livesRemaining: 0, 
        gameCompleted: false, 
        error: 'Сессия не найдена' 
      }
    }

    const currentLives = this.sessionStore.session.value.lives

    // Если теряем больше жизней, чем есть
    if (amount >= currentLives) {
      this.sessionStore.setLives(0)
      this.sessionStore.setGameCompleted(true)
      this.uiEventStore.queueShake('lives')
      
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

    this.uiEventStore.queueShake('lives')

    // Проверяем достижение "на грани"
    if (newLives === 1) {
      const achievement = await this.achievementStore.unlockAchievement('on-the-edge')
      if (achievement) {
        // Здесь можно было бы вызвать GainXPUseCase, но пока просто добавляем XP
        this.sessionStore.addXP(achievement.xpReward)
      }
    }

    return {
      success: true,
      livesRemaining: newLives,
      gameCompleted: newLives === 0
    }
  }
} 