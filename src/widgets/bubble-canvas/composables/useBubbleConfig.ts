import { GAME_CONFIG } from '../../../shared/config/game-config'
import type { Bubble } from '../../../shared/types'

type ExpertiseConfig = typeof GAME_CONFIG.EXPERTISE_LEVELS[keyof typeof GAME_CONFIG.EXPERTISE_LEVELS]

export function getExpertiseConfig(skillLevel: string): ExpertiseConfig {
  return GAME_CONFIG.EXPERTISE_LEVELS[skillLevel as keyof typeof GAME_CONFIG.EXPERTISE_LEVELS]
}

export function getBubbleXP(skillLevel: string) {
  return GAME_CONFIG.XP_PER_EXPERTISE_LEVEL[skillLevel as keyof typeof GAME_CONFIG.XP_PER_EXPERTISE_LEVEL] || 1
}

export function getBubbleSizeMultiplier(skillLevel: string) {
  return getExpertiseConfig(skillLevel)?.sizeMultiplier || 1
}

function hasGradient(config: ExpertiseConfig): config is ExpertiseConfig & { hasGradient: true, gradientColors: string[] } {
  return (config as any).hasGradient && Array.isArray((config as any).gradientColors)
}

export function getBubbleGradient(skillLevel: string) {
  const config = getExpertiseConfig(skillLevel)
  return hasGradient(config) ? config.gradientColors : null
}

// ...другие утилиты по необходимости 