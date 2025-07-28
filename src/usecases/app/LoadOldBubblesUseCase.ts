import type {
  LoadOldBubblesParams,
  LoadOldBubblesResult,
  AppSessionStore,
  AppBubbleStore,
  AppRepository
} from './types'

export class LoadOldBubblesUseCase {
  constructor(
    private sessionStore: AppSessionStore,
    private bubbleStore: AppBubbleStore,
    private repository: AppRepository
  ) {}

  async execute(params: LoadOldBubblesParams): Promise<LoadOldBubblesResult> {
    try {
      const { currentLevel } = params

      // Проверяем, нужно ли загружать старые пузыри
      if (currentLevel < 4) {
        return {
          success: true,
          bubblesLoaded: false,
          bubblesCount: 0
        }
      }

      // Загружаем старые пузыри
      const oldBubbles = await this.repository.getOldBubbles()
      
      if (oldBubbles.length > 0) {
        this.bubbleStore.addBubbles(oldBubbles)
        console.log('✅ Загружены пузыри из прошлого')
        
        return {
          success: true,
          bubblesLoaded: true,
          bubblesCount: oldBubbles.length
        }
      }

      return {
        success: true,
        bubblesLoaded: false,
        bubblesCount: 0
      }
    } catch (error) {
      return {
        success: false,
        bubblesLoaded: false,
        bubblesCount: 0,
        error: `Ошибка загрузки старых пузырей: ${error}`
      }
    }
  }
} 