import type { Ref } from 'vue'

// Параметры и результаты для AnimateXPGain
export interface AnimateXPGainParams {
  oldXP: number
  newXP: number
}

export interface AnimateXPGainResult {
  success: boolean
  animationDuration: number
  error?: string
}

// Интерфейс для UI Event Store
export interface UiUiEventStore {
  // Методы для работы с UI событиями
}

// Интерфейс для репозитория UI
export interface UiRepository {
  resetCanvas(): Promise<void>
}

// Интерфейс для UI use case
export interface UiUseCase {
  animateXPGain(params: AnimateXPGainParams): Promise<AnimateXPGainResult>
} 