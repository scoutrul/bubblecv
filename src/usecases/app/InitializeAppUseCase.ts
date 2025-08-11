import type {
  InitializeAppParams,
  InitializeAppResult,
  AppSessionStore,
  AppBubbleStore,
  AppLevelStore,
  AppAchievementStore,
  AppBonusStore,
  AppModalStore,
  AppMemoirStore
} from './types'

export class InitializeAppUseCase {
  constructor(
    private sessionStore: AppSessionStore,
    private bubbleStore: AppBubbleStore,
    private levelStore: AppLevelStore,
    private achievementStore: AppAchievementStore,
    private bonusStore: AppBonusStore,
    private modalStore: AppModalStore,
    private memoirStore: AppMemoirStore
  ) {}

  async execute(params: InitializeAppParams): Promise<InitializeAppResult> {
    try {
      const { lives = 3 } = params

      const loadPromises = [
        this.levelStore.loadLevels(),
        this.bubbleStore.loadBubbles(),
        this.achievementStore.loadAchievements(),
        this.bonusStore.loadBonuses(),
        this.memoirStore.loadMemoirs()
      ]
      
      await Promise.all(loadPromises)

      await this.sessionStore.startSession({ lives })

      // Открываем Welcome только не в dev-режиме
      if (typeof import.meta !== 'undefined' && !import.meta.env.DEV) {
        this.modalStore.openWelcome()
      }

      return {
        success: true,
        initialized: true
      }
    } catch (error) {
      return {
        success: false,
        initialized: false,
        error: `Ошибка инициализации приложения: ${error}`
      }
    }
  }
} 