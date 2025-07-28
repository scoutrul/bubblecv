import type { 
  GainXPParams, 
  GainXPResult, 
  SessionSessionStore, 
  SessionLevelStore, 
  SessionAchievementStore, 
  SessionBonusStore, 
  SessionUiEventStore 
} from './types'
import { GAME_CONFIG, maxGameLevel } from '@/config'

export class GainXPUseCase {
  constructor(
    private sessionStore: SessionSessionStore,
    private levelStore: SessionLevelStore,
    private achievementStore: SessionAchievementStore,
    private bonusStore: SessionBonusStore,
    private uiEventStore: SessionUiEventStore
  ) {}

  async execute(params: GainXPParams): Promise<GainXPResult> {
    const { amount } = params

    if (!this.sessionStore.session) {
      return { success: false, leveledUp: false, error: 'Сессия не найдена' }
    }

    // Добавляем XP
    this.sessionStore.addXP(amount)
    this.uiEventStore.queueShake('xp')

    let leveledUp = false
    let newLevel = this.sessionStore.session.currentLevel

    // Проверяем возможность повышения уровня
    while (this.canLevelUp()) {
      newLevel = this.sessionStore.session.currentLevel + 1
      this.sessionStore.setLevel(newLevel)
      this.uiEventStore.queueShake('level')

      // Разблокируем бонус для нового уровня
      this.bonusStore.unlockBonusForLevel(newLevel)

      // Получаем данные уровня
      const levelData = this.levelStore.getLevelByNumber(newLevel)
      const icon = levelData?.icon || '👋'

      // Проверяем достижение финального уровня
      if (newLevel >= maxGameLevel) {
        const achievement = await this.achievementStore.unlockAchievement('final_level', true)
        if (achievement) {
          this.uiEventStore.queueShake('achievement')
        }
      }

      leveledUp = true
    }

    if (leveledUp) {
      const levelData = this.levelStore.getLevelByNumber(newLevel)
      const icon = levelData?.icon || '👋'
      
      return {
        success: true,
        leveledUp: true,
        newLevel,
        levelData: {
          level: newLevel,
          title: levelData?.title,
          description: levelData?.description,
          currentXP: this.sessionStore.session.currentXP,
          xpGained: amount,
          icon
        }
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