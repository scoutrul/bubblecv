import type {
  InitializeAppParams,
  InitializeAppResult,
  AppSessionStore,
  AppBubbleStore,
  AppLevelStore,
  AppAchievementStore,
  AppBonusStore,
  AppModalStore,
  AppRepository,
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
    private repository: AppRepository,
    private memoirStore: AppMemoirStore
  ) {}

  async execute(params: InitializeAppParams): Promise<InitializeAppResult> {
    try {
      const { lives = 3 } = params

      // Загружаем все данные параллельно
      const loadPromises = [
        this.levelStore.loadLevels(),
        this.bubbleStore.loadBubbles(),
        this.achievementStore.loadAchievements(),
        this.bonusStore.loadBonuses(),
        this.memoirStore.loadMemoirs()
      ]
      
      await Promise.all(loadPromises)

      // Создаем сессию
      await this.sessionStore.startSession({ lives })

      // Проверяем нужно ли загрузить старые пузыри
      if (this.sessionStore.session && this.sessionStore.session.currentLevel >= 4) {
        const oldBubbles = await this.repository.getOldBubbles()
        if (oldBubbles.length > 0) {
          this.bubbleStore.addBubbles(oldBubbles)
          console.log('✅ Загружены пузыри из прошлого')
        }
      }

      // Открываем welcome модалку
      this.modalStore.openWelcome()

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