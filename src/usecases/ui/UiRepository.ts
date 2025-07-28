import type { UiRepository } from './types'

export class UiRepositoryImpl implements UiRepository {
  async resetCanvas(): Promise<void> {
    // Импортируем getEventBridge динамически чтобы избежать циклических зависимостей
    const { getEventBridge } = await import('@/composables/useUi')
    const bridge = getEventBridge()
    
    if (bridge) {
      await bridge.resetCanvas()
    }
  }
} 