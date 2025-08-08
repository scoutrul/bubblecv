import type { 
  GainXPParams, 
  GainXPResult, 
  SessionSessionStore, 
  SessionLevelStore, 
  SessionAchievementStore, 
  SessionBonusStore,
  SessionModalStore,
} from './types'
import { GAME_CONFIG, maxGameLevel } from '@/config'
import { ShouldShowProjectTransitionModalUseCase } from '@/usecases/game-mode'

export class GainXPUseCase {
  constructor(
    private sessionStore: SessionSessionStore,
    private levelStore: SessionLevelStore,
    private achievementStore: SessionAchievementStore,
    private bonusStore: SessionBonusStore,
    private modalStore: SessionModalStore
  ) {}

  async execute(params: GainXPParams): Promise<GainXPResult> {
    const { amount } = params

    if (!this.sessionStore.session) {
      return { success: false, leveledUp: false, error: 'Сессия не найдена' }
    }

    // Добавляем XP
    this.sessionStore.addXP(amount)

    let leveledUp = false
    let newLevel = this.sessionStore.session.currentLevel

    // Проверяем возможность повышения уровня
    while (this.canLevelUp()) {
      newLevel = this.sessionStore.session.currentLevel + 1
      this.sessionStore.setLevel(newLevel)

      // Разблокируем бонус для нового уровня
      this.bonusStore.unlockBonusForLevel(newLevel)

      // Получаем данные уровня
      const levelData = this.levelStore.getLevelByNumber(newLevel)
      const icon = levelData?.icon || '👋'

      // Проверяем достижение финального уровня
      if (newLevel >= maxGameLevel) {
        const achievement = await this.achievementStore.unlockAchievement('final_level', true)
        if (achievement) {
          // Ачивка разблокирована
        }
      }

      leveledUp = true
    }

    if (leveledUp) {
      const levelData = this.levelStore.getLevelByNumber(newLevel)
      const icon = levelData?.icon || '👋'
      
      // Проверяем, нужно ли показать специальный режим для перехода на режим проекта
      const shouldShowProjectTransitionModalUseCase = new ShouldShowProjectTransitionModalUseCase(this.sessionStore)
      const shouldShowResult = shouldShowProjectTransitionModalUseCase.execute({
        currentLevel: newLevel,
        previousLevel: newLevel - 1
      })
      

      
      const levelDataResult = {
        level: newLevel,
        title: levelData?.title,
        description: levelData?.description,
        currentXP: this.sessionStore.session.currentXP,
        xpGained: amount,
        icon,
        isProjectTransition: shouldShowResult.shouldShow
      }
      
      return {
        success: true,
        leveledUp: true,
        newLevel,
        levelData: levelDataResult
      }
    }

    return {
      success: true,
      leveledUp: false
    }
  }

  private canLevelUp(): boolean {
    if (!this.sessionStore.session) return false
    
    const level = this.sessionStore.session.currentLevel
    if (level >= maxGameLevel) return false

    const requiredXPForNextLevel = this.getRequiredXPForLevel(level + 1)
    return this.sessionStore.session.currentXP >= requiredXPForNextLevel
  }

  private getRequiredXPForLevel(level: number): number {
    return GAME_CONFIG.levelRequirements[level as keyof typeof GAME_CONFIG.levelRequirements] || 0
  }
} 