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

    if (!this.sessionStore.session) {
      console.log('❌ LoseLivesUseCase: Сессия не найдена')
      return { 
        success: false, 
        livesRemaining: 0, 
        gameCompleted: false, 
        error: 'Сессия не найдена' 
      }
    }

    const currentLives = this.sessionStore.session.lives
    console.log(`🔍 LoseLivesUseCase: Текущие жизни: ${currentLives}, отнимаем: ${amount}`)

    // Если теряем больше жизней, чем есть
    if (amount >= currentLives) {
      console.log('💀 LoseLivesUseCase: Игра окончена - все жизни потеряны')
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
    console.log(`💔 LoseLivesUseCase: Устанавливаем жизни: ${newLives}`)
    this.sessionStore.setLives(newLives)

    // Проверяем, закончилась ли игра
    if (newLives === 0) {
      console.log('💀 LoseLivesUseCase: Игра окончена - жизни = 0')
      this.sessionStore.setGameCompleted(true)
    }

    this.uiEventStore.queueShake('lives')

    // Проверяем достижение "на грани"
    if (newLives === 1) {
      console.log('⚠️ LoseLivesUseCase: Осталась 1 жизнь - проверяем достижение "на краю"')
      const achievement = await this.achievementStore.unlockAchievement('on-the-edge', true)
      if (achievement) {
        console.log('🏆 LoseLivesUseCase: Разблокировано достижение "на краю":', achievement)
        console.log(`🏆 LoseLivesUseCase: Награда за достижение: ${achievement.xpReward} XP`)
        // Здесь можно было бы вызвать GainXPUseCase, но пока просто добавляем XP
        this.sessionStore.addXP(achievement.xpReward)
      } else {
        console.log('❌ LoseLivesUseCase: Достижение "на краю" не разблокировано')
      }
    }

    console.log(`✅ LoseLivesUseCase: Успешно обновлены жизни. Осталось: ${newLives}`)
    return {
      success: true,
      livesRemaining: newLives,
      gameCompleted: newLives === 0
    }
  }
} 