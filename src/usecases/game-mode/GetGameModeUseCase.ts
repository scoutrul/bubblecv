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

    let mode: GameMode = GameMode.CAREER
    if (currentLevel >= GAME_CONFIG.RETRO_SWITCH_LEVEL) {
      mode = GameMode.RETRO
    } else if (currentLevel >= GAME_CONFIG.LEVEL_SWITCH_THRESHOLD) {
      mode = GameMode.PROJECT
    }

    return {
      mode,
      isProjectMode: mode === GameMode.PROJECT,
      isCareerMode: mode === GameMode.CAREER
    }
  }
} 