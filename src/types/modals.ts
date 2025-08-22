import type { BubbleNode } from './canvas'
import type { Question } from './data'
import type { NormalizedBonus, NormalizedMemoir } from './normalized'

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
  bubble?: BubbleNode // Optional snapshot for reliable effects (x, y, radius)
}

export interface CanvasBridge {
  removeBubble: (bubbleId: number, xpAmount?: number, isPhilosophyNegative?: boolean) => Promise<void>
  removeBubbleWithEffects: (params: { bubble: BubbleNode; xpAmount?: number; isPhilosophyNegative?: boolean; skipFloatingText?: boolean }) => Promise<void>
  findBubbleById: (bubbleId: number) => BubbleNode | undefined
  createFloatingText: (params: { x: number; y: number; text: string; type: 'xp' | 'life'; color?: string }) => void
  updateCanvasBubbles?: () => void
  // Optional bridge for clicker to add/replace nodes directly
  addBubblesToCanvas?: (newBubbles: BubbleNode[]) => void
  setBubblesOnCanvas?: (newBubbles: BubbleNode[]) => void
}

export interface LevelUpData {
  level: number
  title: string
  description: string
  icon: string
  currentXP: number
  xpGained: number
  xpRequired: number
  isProjectTransition?: boolean
}

export interface XPResult {
  xpGained: number
  livesLost: number
  agreementChange: number
  isPhilosophyNegative: boolean
}

export interface BubbleModalData {
  bubble: BubbleNode
  xpResult?: XPResult
}

export interface PhilosophyModalData {
  question: Question
  bubbleId: number
  xpResult?: XPResult
}

export interface AchievementModalData {
  achievement: PendingAchievement
}

export interface BonusModalData {
  bonus: NormalizedBonus
}

export interface MemoirModalData {
  memoir: NormalizedMemoir
}

export interface GameOverModalData {
  currentXP: number
  currentLevel: number
  finalScore: number
}

export interface ClickerResultsData {
  score: number
  clicked: number
  total: number
  timeLeftMs: number
  bonus: number
  totalScore: number
}

// New: Final congrats modal data
export interface FinalCongratsData {
  totalBubbles: number
  byType: { normal: number; tough: number; hidden: number; philosophy: number }
  totalXP: number
  bonusesUnlocked: number
  achievementsUnlocked: number
  memoirsUnlocked: number
}

// Chat modal data
export interface ChatModalData {
  // No specific data needed for chat modal
}

// Новые интерфейсы для системы очередей
export type ModalType = 'welcome' | 'bubble' | 'levelUp' | 'philosophy' | 'gameOver' | 'achievement' | 'bonus' | 'memoir' | 'clickerRules' | 'clickerResults' | 'finalCongrats' | 'chat'

export type ModalDataUnion = 
  | { type: 'welcome'; data: null }
  | { type: 'bubble'; data: BubbleModalData }
  | { type: 'philosophy'; data: PhilosophyModalData }
  | { type: 'achievement'; data: AchievementModalData }
  | { type: 'bonus'; data: BonusModalData }
  | { type: 'memoir'; data: MemoirModalData }
  | { type: 'levelUp'; data: LevelUpData }
  | { type: 'gameOver'; data: GameOverModalData }
  | { type: 'clickerRules'; data: null }
  | { type: 'clickerResults'; data: ClickerResultsData }
  | { type: 'finalCongrats'; data: FinalCongratsData }
  | { type: 'chat'; data: ChatModalData }

export interface QueuedModal {
  id: string
  type: ModalType
  data: ModalDataUnion['data']
  priority: number
}

export const MODAL_PRIORITIES = {
  welcome: 100,
  gameOver: 90,
  levelUp: 80,
  achievement: 70,
  philosophy: 60,
  bubble: 50,
  bonus: 40,
  memoir: 30,
  clickerRules: 60,
  clickerResults: 65,
  finalCongrats: 85,
  chat: 20
} as const

// Обновленные интерфейсы для Event Chains
export type EventChainStep = 'bubble' | 'achievement' | 'levelUp' | 'levelAchievement' | 'complete'

export interface EventChain {
  id: string
  type: 'bubble' | 'philosophy' | 'manual'
  pendingAchievements: PendingAchievement[]      // Обычные ачивки (bubble, philosophy, tough)
  pendingLevelAchievements: PendingAchievement[] // Ачивки за уровень
  pendingLevelUp: { level: number; data: LevelUpData } | null
  currentStep: EventChainStep
  context: {
    bubble?: BubbleNode
    question?: Question
    bubbleId?: number
    xpResult?: XPResult
  }
}

export interface ModalData {
  currentBubble: BubbleNode | null
  currentQuestion: Question | null
  philosophyBubbleId: BubbleNode['id'] | null
  achievement: PendingAchievement | null
  gameOverStats: GameOverModalData | null
  levelUpData: LevelUpData
  currentBonus: NormalizedBonus | null
  currentMemoir: NormalizedMemoir | null
  clickerResults: ClickerResultsData | null
  finalCongrats: FinalCongratsData | null
}

export interface ModalStates {
  welcome: boolean
  bubble: boolean
  levelUp: boolean
  philosophy: boolean
  gameOver: boolean
  achievement: boolean
  bonus: boolean
  memoir: boolean
  clickerRules: boolean
  clickerResults: boolean
  finalCongrats: boolean
  chat: boolean
}
