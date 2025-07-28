import type {
  GetGameStateParams,
  GetGameStateResult,
  AppSessionStore,
  AppBubbleStore,
  AppLevelStore,
  AppRepository
} from './types'
import { GAME_CONFIG } from '@/config'

export class GetGameStateUseCase {
  constructor(
    private sessionStore: AppSessionStore,
    private bubbleStore: AppBubbleStore,
    private levelStore: AppLevelStore,
    private repository: AppRepository
  ) {}

  async execute(params: GetGameStateParams): Promise<GetGameStateResult> {
    try {
      if (!this.sessionStore.session) {
        const firstLevelData = this.repository.getFirstLevelData()
        
        return {
          success: false,
          gameState: {
            currentLevel: 1,
            currentLevelTitle: firstLevelData.title,
            currentLevelIcon: firstLevelData.icon,
            currentXP: 0,
            currentLives: GAME_CONFIG.initialLives,
            xpProgress: 0,
            nextLevelXP: GAME_CONFIG.levelRequirements[2],
            visitedBubbles: [],
            currentYear: GAME_CONFIG.initialYear,
            startYear: GAME_CONFIG.initialYear,
            endYear: GAME_CONFIG.initialYear,
            maxLives: GAME_CONFIG.maxLives
          },
          error: 'Сессия не инициализирована'
        }
      }

      const session = this.sessionStore.session
      const levelData = this.levelStore.getLevelByNumber(session.currentLevel)
      const yearRange = this.repository.getYearRange(this.bubbleStore.bubbles)
      const firstLevelData = this.repository.getFirstLevelData()

      return {
        success: true,
        gameState: {
          currentLevel: session.currentLevel,
          currentLevelTitle: levelData?.title || firstLevelData.title,
          currentLevelIcon: levelData?.icon || firstLevelData.icon,
          currentXP: session.currentXP,
          currentLives: session.lives,
          xpProgress: this.sessionStore.xpProgress,
          nextLevelXP: this.sessionStore.nextLevelXP,
          visitedBubbles: session.visitedBubbles,
          currentYear: session.currentYear,
          startYear: yearRange.startYear,
          endYear: yearRange.endYear,
          maxLives: GAME_CONFIG.maxLives
        }
      }
    } catch (error) {
      const firstLevelData = this.repository.getFirstLevelData()
      
      return {
        success: false,
        gameState: {
          currentLevel: 1,
          currentLevelTitle: firstLevelData.title,
          currentLevelIcon: firstLevelData.icon,
          currentXP: 0,
          currentLives: GAME_CONFIG.initialLives,
          xpProgress: 0,
          nextLevelXP: GAME_CONFIG.levelRequirements[2],
          visitedBubbles: [],
          currentYear: GAME_CONFIG.initialYear,
          startYear: GAME_CONFIG.initialYear,
          endYear: GAME_CONFIG.initialYear,
          maxLives: GAME_CONFIG.maxLives
        },
        error: `Ошибка получения состояния игры: ${error}`
      }
    }
  }
} 