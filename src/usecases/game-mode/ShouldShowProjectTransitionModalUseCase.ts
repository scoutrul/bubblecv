import { GAME_CONFIG } from '@/config'
import type { SessionSessionStore } from '@/usecases/session/types'

export interface ShouldShowProjectTransitionModalUseCaseRequest {
  currentLevel: number
  previousLevel?: number
}

export interface ShouldShowProjectTransitionModalUseCaseResponse {
  shouldShow: boolean
  reason?: string
}

export class ShouldShowProjectTransitionModalUseCase {
  constructor(private sessionStore: SessionSessionStore) {}

  execute(request: ShouldShowProjectTransitionModalUseCaseRequest): ShouldShowProjectTransitionModalUseCaseResponse {
    const { currentLevel, previousLevel } = request
    
    if (currentLevel === GAME_CONFIG.LEVEL_SWITCH_THRESHOLD && 
        (!previousLevel || previousLevel < GAME_CONFIG.LEVEL_SWITCH_THRESHOLD)) {
      return {
        shouldShow: true,
        reason: `Переход на уровень ${currentLevel} - начало режима технологий проекта`
      }
    }

    return {
      shouldShow: false
    }
  }
} 