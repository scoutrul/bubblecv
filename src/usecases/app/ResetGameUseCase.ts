import type {
  ResetGameParams,
  ResetGameResult,
  AppSessionStore,
  AppModalStore
} from './types'

export class ResetGameUseCase {
  constructor(
    private sessionStore: AppSessionStore,
    private modalStore: AppModalStore
  ) {}

  async execute(params: ResetGameParams): Promise<ResetGameResult> {
    try {
      // Создаем новую сессию
      await this.sessionStore.startSession({ lives: 3 })

      // Открываем welcome модалку
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