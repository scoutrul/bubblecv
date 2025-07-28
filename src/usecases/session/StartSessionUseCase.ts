import type { 
  StartSessionParams, 
  StartSessionResult, 
  SessionSessionStore, 
  SessionAchievementStore, 
  SessionBonusStore, 
  SessionCanvasRepository 
} from './types'
import { SessionRepository } from './SessionRepository'
import { GAME_CONFIG } from '@/config'

export class StartSessionUseCase {
  constructor(
    private sessionStore: SessionSessionStore,
    private achievementStore: SessionAchievementStore,
    private bonusStore: SessionBonusStore,
    private canvasRepository: SessionCanvasRepository
  ) {}

  async execute(params: StartSessionParams): Promise<StartSessionResult> {
    const { lives = GAME_CONFIG.maxLives } = params

    const sessionRepository = new SessionRepository()
    
    const sessionData = sessionRepository.createSession({
      lives: lives ?? GAME_CONFIG.initialLives
    })

    this.sessionStore.createSession(sessionData)

    // Сбрасываем состояние игры
    this.achievementStore.resetAchievements()
    this.bonusStore.resetBonuses()
    this.canvasRepository.resetCanvas()

    return {
      success: true,
      sessionId: sessionData.id
    }
  }
} 