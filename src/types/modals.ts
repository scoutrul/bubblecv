import type { BubbleNode } from './canvas'
import type { Question } from './data'
import type { NormalizedBonus } from './normalized'

export interface PendingAchievement {
  title: string
  description: string
  icon: string
  xpReward: number
}

export interface PendingBubbleRemoval {
  bubbleId: number
  xpAmount: number
  isPhilosophyNegative: boolean
}

export interface CanvasBridge {
  removeBubble: (bubbleId: number, xpAmount?: number, isPhilosophyNegative?: boolean) => void
}

export interface LevelUpData {
  level: number
  title: string
  description: string
  icon: string
  currentXP: number
  xpGained: number
  xpRequired: number
}

// Новые интерфейсы для системы очередей
export type ModalType = 'welcome' | 'bubble' | 'levelUp' | 'philosophy' | 'gameOver' | 'achievement' | 'bonus'

export interface QueuedModal {
  id: string
  type: ModalType
  data: any
  priority: number
}

export const MODAL_PRIORITIES = {
  welcome: 100,
  gameOver: 90,
  levelUp: 80,
  achievement: 70,
  philosophy: 60,
  bubble: 50,
  bonus: 40
} as const

// Обновленные интерфейсы для Event Chains
export type EventChainStep = 'bubble' | 'achievement' | 'levelUp' | 'levelAchievement' | 'complete'

export interface EventChain {
  id: string
  type: 'bubble' | 'philosophy' | 'manual'
  pendingAchievements: PendingAchievement[]      // Обычные ачивки (bubble, philosophy, tough)
  pendingLevelAchievements: PendingAchievement[] // Ачивки за уровень (first-level-master)
  pendingLevelUp: { level: number; data: any } | null
  currentStep: EventChainStep
  context: {
    bubble?: BubbleNode
    question?: Question
    bubbleId?: number
    xpResult?: any
  }
}

export interface ModalData {
  currentBubble: BubbleNode | null
  currentQuestion: Question | null
  philosophyBubbleId: BubbleNode['id'] | null
  achievement: PendingAchievement | null
  gameOverStats: { currentXP: number; currentLevel: number } | null
  levelUpData: LevelUpData
  currentBonus: NormalizedBonus | null
}

export interface ModalStates {
  welcome: boolean
  bubble: boolean
  levelUp: boolean
  philosophy: boolean
  gameOver: boolean
  achievement: boolean
  bonus: boolean
}
