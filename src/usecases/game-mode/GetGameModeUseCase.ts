import { GAME_CONFIG } from '@/config'
import { GameMode } from './types'
import type { SessionSessionStore } from '@/usecases/session/types'

export interface GetGameModeUseCaseRequest {
  currentLevel: number
}

export interface GetGameModeUseCaseResponse {
  mode: GameMode
  isProjectMode: boolean
  isCareerMode: boolean
}

export class GetGameModeUseCase {
  constructor(private sessionStore: SessionSessionStore) {}

  execute(request: GetGameModeUseCaseRequest): GetGameModeUseCaseResponse {
    const { currentLevel } = request
    const isProjectMode = currentLevel >= GAME_CONFIG.LEVEL_SWITCH_THRESHOLD
    const mode = isProjectMode ? GameMode.PROJECT : GameMode.CAREER

    return {
      mode,
      isProjectMode,
      isCareerMode: !isProjectMode
    }
  }
} 