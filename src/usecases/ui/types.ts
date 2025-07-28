import type { Ref } from 'vue'

// Параметры и результаты для AnimateXPGain
export interface AnimateXPGainParams {
  oldXP: number
  newXP: number
}

export interface AnimateXPGainResult {
  success: boolean
  animationDuration: number
}

// Параметры и результаты для ProcessShakeQueue
export interface ProcessShakeQueueParams {
  // Пустые параметры, так как обработка происходит автоматически
}

export interface ProcessShakeQueueResult {
  success: boolean
  componentsShaken: Set<string>
  shakeDuration: number
}

// Интерфейсы для stores
export interface UiSessionStore {
  currentXP: Ref<number>
}

export interface UiUiEventStore {
  consumeShakeQueue(): Set<string>
}

// Интерфейс для репозитория UI
export interface UiRepository {
  resetCanvas(): Promise<void>
}

// Интерфейс для UI use case
export interface UiUseCase {
  animateXPGain(params: AnimateXPGainParams): Promise<AnimateXPGainResult>
  processShakeQueue(params: ProcessShakeQueueParams): Promise<ProcessShakeQueueResult>
} 