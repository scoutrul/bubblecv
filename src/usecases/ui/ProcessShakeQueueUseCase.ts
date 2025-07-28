import type { ProcessShakeQueueParams, ProcessShakeQueueResult, UiUiEventStore } from './types'
import { GAME_CONFIG } from '@/config'

export class ProcessShakeQueueUseCase {
  constructor(private uiEventStore: UiUiEventStore) {}

  async execute(params: ProcessShakeQueueParams): Promise<ProcessShakeQueueResult> {
    const componentsToShake = this.uiEventStore.consumeShakeQueue()

    if (componentsToShake.size === 0) {
      return {
        success: false,
        componentsShaken: new Set(),
        shakeDuration: 0
      }
    }

    return {
      success: true,
      componentsShaken: componentsToShake,
      shakeDuration: GAME_CONFIG.animations.shake
    }
  }
} 