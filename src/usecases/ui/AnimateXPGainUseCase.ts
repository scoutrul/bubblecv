import type { AnimateXPGainParams, AnimateXPGainResult } from './types'
import { GAME_CONFIG } from '@/config'

export class AnimateXPGainUseCase {
  async execute(params: AnimateXPGainParams): Promise<AnimateXPGainResult> {
    const { oldXP, newXP } = params

    // Проверяем, что XP действительно увеличился
    if (newXP <= oldXP) {
      return {
        success: false,
        animationDuration: 0
      }
    }

    // Возвращаем успех с длительностью анимации из конфига
    return {
      success: true,
      animationDuration: GAME_CONFIG.animations.xpGain
    }
  }
} 