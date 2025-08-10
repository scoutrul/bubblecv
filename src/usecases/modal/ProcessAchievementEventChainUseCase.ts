import type {
  ProcessAchievementEventChainParams,
  ProcessAchievementEventChainResult,
  ModalAchievementStore,
  ModalModalStore,
} from './types'
import type { NormalizedAchievement } from '@/types/normalized'
import type { PendingAchievement, EventChain, LevelUpData } from '@/types/modals'
import type { GainXPResult } from '@/usecases/session'

// Тип для возвращаемого значения gainXP из composable
type GainXPComposableResult = {
  leveledUp: boolean
  newLevel?: number
  levelData?: GainXPResult['levelData']
}

// Простая функция для генерации уникального ID
const generateId = (): string => Date.now().toString() + Math.random().toString(36).substr(2, 9)

export class ProcessAchievementEventChainUseCase {
  constructor(
    private achievementStore: ModalAchievementStore,
    private modalStore: ModalModalStore,
  ) {}

  private createPendingAchievement(achievement: NormalizedAchievement): PendingAchievement {
    return {
      title: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      xpReward: achievement.xpReward
    }
  }

  private createEventChainConfig(
    type: EventChain['type'],
    achievements: PendingAchievement[],
    levelAchievements: PendingAchievement[],
    xpResult: GainXPComposableResult,
    context: Record<string, unknown> = {}
  ): EventChain {
    // Создаем LevelUpData если есть данные для level up
    // Убираем условие levelAchievements.length === 0, так как level up может произойти от любой ачивки

    const pendingLevelUp = (xpResult?.leveledUp && xpResult.levelData) ? {
      level: xpResult.newLevel!,
      data: {
        level: xpResult.levelData.level,
        title: xpResult.levelData.title || `Уровень ${xpResult.newLevel}`,
        description: xpResult.levelData.description || `Поздравляем! Вы достигли ${xpResult.newLevel} уровня!`,
        icon: xpResult.levelData.icon,
        currentXP: xpResult.levelData.currentXP,
        xpGained: xpResult.levelData.xpGained,
        xpRequired: 0, // Добавляем недостающее поле
        isProjectTransition: xpResult.levelData.isProjectTransition
      } as LevelUpData
    } : null

    // Определяем начальный шаг
    let initialStep: EventChain['currentStep'] = 'bubble'
    
    if (achievements.length > 0) {
      initialStep = 'achievement'
    } else if (pendingLevelUp) {
      initialStep = 'levelUp'
    } else if (levelAchievements.length > 0) {
      initialStep = 'levelAchievement'
    }

    return {
      id: generateId(),
      type,
      currentStep: initialStep,
      pendingAchievements: achievements,
      pendingLevelUp,
      pendingLevelAchievements: levelAchievements,
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

      // Создаем массив level ачивок (не используется сейчас)
      const levelAchievements: PendingAchievement[] = []

      // Запускаем Event Chain
      const eventChainConfig = this.createEventChainConfig(
        chainType,
        achievements,
        levelAchievements,
        xpResult
      )

      this.modalStore.startEventChain(eventChainConfig)

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
    const { useSession } = await import('@/composables/useSession')
    const { gainXP } = useSession()
    return await gainXP(amount)
  }
} 