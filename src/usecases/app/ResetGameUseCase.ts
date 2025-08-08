import { GAME_CONFIG } from '@/config'
import type {
  ResetGameResult,
  AppSessionStore,
  AppModalStore
} from './types'

export class ResetGameUseCase {
  constructor(
    private sessionStore: AppSessionStore,
    private modalStore: AppModalStore
  ) {}

  async execute(): Promise<ResetGameResult> {
    try {
      await this.sessionStore.startSession({ lives: GAME_CONFIG.maxLives })

      this.modalStore.openWelcome()

      return {
        success: true,
        gameReset: true
      }
    } catch (error) {
      return {
        success: false,
        gameReset: false,
        error: `Ошибка сброса игры: ${error}`
      }
    }
  }
} 