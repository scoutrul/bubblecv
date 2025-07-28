import type {
  ProcessAchievementEventChainParams,
  ProcessAchievementEventChainResult,
  ModalSessionStore,
  ModalAchievementStore,
  ModalModalStore,
  ModalLevelStore
} from './types'

export class ProcessAchievementEventChainUseCase {
  constructor(
    private sessionStore: ModalSessionStore,
    private achievementStore: ModalAchievementStore,
    private modalStore: ModalModalStore,
    private levelStore: ModalLevelStore
  ) {}

  private createPendingAchievement(achievement: any) {
    return {
      title: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      xpReward: achievement.xpReward
    }
  }

  private async checkAndAddLevelAchievement(
    xpResult: any,
    levelAchievements: any[]
  ): Promise<void> {
    if (xpResult?.leveledUp && xpResult.newLevel === 2) {
      const levelAchievement = await this.achievementStore.unlockAchievement('first-level-master')
      if (levelAchievement) {
        levelAchievements.push(this.createPendingAchievement(levelAchievement))
      }
    }
  }

  private createEventChainConfig(
    type: any,
    achievements: any[],
    levelAchievements: any[],
    xpResult: any,
    context: any = {}
  ) {
    return {
      id: Date.now().toString(), // Уникальный ID для EventChain
      type,
      pendingAchievements: achievements,
      pendingLevelAchievements: levelAchievements,
      pendingLevelUp: (xpResult?.leveledUp && levelAchievements.length === 0) ? {
        level: xpResult.newLevel!,
        data: xpResult.levelData
      } : null,
      currentStep: (type === 'manual') ? 'achievement' as const : 'bubble' as const,
      context
    }
  }

  async execute(params: ProcessAchievementEventChainParams): Promise<ProcessAchievementEventChainResult> {
    try {
      const { achievementId, chainType } = params

      const achievement = await this.achievementStore.unlockAchievement(achievementId)

      if (!achievement) {
        return {
          success: false,
          eventChainStarted: false,
          error: 'Достижение не найдено'
        }
      }

      // Получаем XP от основной ачивки
      const xpResult = await this.gainXP(achievement.xpReward)

      // Создаем массив основных ачивок
      const achievements = [this.createPendingAchievement(achievement)]

      // Создаем массив level ачивок
      const levelAchievements: any[] = []

      // Проверяем level achievement
      await this.checkAndAddLevelAchievement(xpResult, levelAchievements)

      // Запускаем Event Chain
      this.modalStore.startEventChain(this.createEventChainConfig(
        chainType,
        achievements,
        levelAchievements,
        xpResult
      ))

      return {
        success: true,
        eventChainStarted: true
      }
    } catch (error) {
      return {
        success: false,
        eventChainStarted: false,
        error: `Ошибка обработки цепочки ачивок: ${error}`
      }
    }
  }

  private async gainXP(amount: number) {
    // Динамический импорт для избежания циклических зависимостей
    const { useSession } = await import('@/composables/useSession')
    const { gainXP } = useSession()
    return await gainXP(amount)
  }
} 