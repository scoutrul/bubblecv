import type { BubbleNode } from '@/types/canvas'
import type { ModalStates, PendingBubbleRemoval, CanvasBridge, PendingAchievement, EventChain, LevelUpData, XPResult, ModalDataUnion } from '@/types/modals'
import type { NormalizedAchievement, NormalizedBonus, NormalizedMemoir } from '@/types/normalized'
import type { Question } from '@/types/data'

// === ПАРАМЕТРЫ И РЕЗУЛЬТАТЫ USE CASES ===

// ProcessAchievementEventChain
export interface ProcessAchievementEventChainParams {
  achievementId: string
  chainType: EventChain['type']
}

export interface ProcessAchievementEventChainResult {
  success: boolean
  eventChainStarted: boolean
  error?: string
}

// StartBubbleEventChain
export interface StartBubbleEventChainParams {
  bubble: BubbleNode
}

export interface StartBubbleEventChainResult {
  success: boolean
  eventChainStarted: boolean
  error?: string
}

// OpenModal
export interface OpenModalParams {
  type: keyof ModalStates
  data?: ModalDataUnion['data']
  priority?: number
}

export interface OpenModalResult {
  success: boolean
  modalOpened: boolean
  error?: string
}

// CloseModal
export interface CloseModalParams {
  key: keyof ModalStates
}

export interface CloseModalResult {
  success: boolean
  modalClosed: boolean
  error?: string
}

// HandlePhilosophyResponse
export interface HandlePhilosophyResponseParams {
  response: { type: 'selected', optionId: string } | { type: 'custom', answer: string }
}

export interface HandlePhilosophyResponseResult {
  success: boolean
  xpGained: number
  isNegative: boolean
  gameOver: boolean
  eventChainStarted: boolean
  error?: string
}

// RestartGame
export interface RestartGameParams {
  // Пустые параметры
}

export interface RestartGameResult {
  success: boolean
  gameRestarted: boolean
  error?: string
}

// AddPendingBubbleRemoval
export interface AddPendingBubbleRemovalParams {
  removal: PendingBubbleRemoval
}

export interface AddPendingBubbleRemovalResult {
  success: boolean
  added: boolean
  error?: string
}

// ProcessPendingBubbleRemovals
export interface ProcessPendingBubbleRemovalsParams {
  // Пустые параметры
}

export interface ProcessPendingBubbleRemovalsResult {
  success: boolean
  processed: number
  error?: string
}

// HandleSpecialBubbleDestroyed
export interface HandleSpecialBubbleDestroyedParams {
  type: 'secret' | 'tough'
}

export interface HandleSpecialBubbleDestroyedResult {
  success: boolean
  eventChainStarted: boolean
  error?: string
}

// === ИНТЕРФЕЙСЫ ДЛЯ STORES ===

export interface ModalSessionStore {
  session: {
    currentXP: number
    currentLevel: number
    visitedBubbles: number[]
  } | null
}

export interface ModalLevelStore {
  getLevelByNumber(level: number): {
    title: string
    description: string
    icon: string
  } | undefined
}

export interface ModalAchievementStore {
  unlockAchievement(id: string, showModal?: boolean): Promise<NormalizedAchievement | null | undefined>
}

export interface ModalModalStore {
  modals: ModalStates
  data: ModalDataUnion['data']
  currentEventChain: EventChain | null
  currentModal: string | null
  pendingAchievements: PendingAchievement[]
  pendingLevelAchievements: PendingAchievement[]
  
  // Actions
  enqueueModal(modal: { type: keyof ModalStates; data: ModalDataUnion['data']; priority: number }): void
  closeModal(key: keyof ModalStates): void
  closeCurrentModal(): void
  startEventChain(chain: EventChain): void
  processEventChain(): void
  clearQueue(): void
  setAchievement(achievement: PendingAchievement | null): void
  getNextPendingAchievement(): PendingAchievement | null
  setCurrentBonus(bonus: NormalizedBonus): void
}

// === ИНТЕРФЕЙСЫ ДЛЯ РЕПОЗИТОРИЯ ===

export interface ModalRepository {
  // Bridge operations
  getCanvasBridge(): CanvasBridge | null
  getEventBridge(): { resetCanvas: () => Promise<void> } | null
  
  // Session operations
  visitBubble(bubbleId: number): Promise<void>
  gainXP(amount: number): Promise<{
    success: boolean
    leveledUp: boolean
    newLevel?: number
    levelData?: LevelUpData
    error?: string
  }>
  losePhilosophyLife(): Promise<boolean>
  saveSelectedPhilosophyAnswer(questionId: string, answer: string, question: string): Promise<void>
  saveCustomPhilosophyAnswer(questionId: string, answer: string, question: string): Promise<void>
  
  // App operations
  resetGame(): Promise<void>
  
  // Bubble removal
  removeBubble(bubbleId: number, xpAmount: number, isPhilosophyNegative: boolean): void
}

// === ИНТЕРФЕЙСЫ ДЛЯ USE CASES ===

export interface ProcessAchievementEventChainUseCase {
  execute(params: ProcessAchievementEventChainParams): Promise<ProcessAchievementEventChainResult>
}

export interface StartBubbleEventChainUseCase {
  execute(params: StartBubbleEventChainParams): Promise<StartBubbleEventChainResult>
}

export interface OpenModalUseCase {
  execute(params: OpenModalParams): Promise<OpenModalResult>
}

export interface CloseModalUseCase {
  execute(params: CloseModalParams): Promise<CloseModalResult>
}

export interface HandlePhilosophyResponseUseCase {
  execute(params: HandlePhilosophyResponseParams): Promise<HandlePhilosophyResponseResult>
}

export interface RestartGameUseCase {
  execute(params: RestartGameParams): Promise<RestartGameResult>
}

export interface AddPendingBubbleRemovalUseCase {
  execute(params: AddPendingBubbleRemovalParams): Promise<AddPendingBubbleRemovalResult>
}

export interface ProcessPendingBubbleRemovalsUseCase {
  execute(params: ProcessPendingBubbleRemovalsParams): Promise<ProcessPendingBubbleRemovalsResult>
}

export interface HandleSpecialBubbleDestroyedUseCase {
  execute(params: HandleSpecialBubbleDestroyedParams): Promise<HandleSpecialBubbleDestroyedResult>
}

// === УТИЛИТЫ ===

export interface ModalUtils {
  createPendingAchievement(achievement: NormalizedAchievement): PendingAchievement
  checkAndAddLevelAchievement(
    xpResult: XPResult,
    levelAchievements: PendingAchievement[],
    achievementStore: ModalAchievementStore
  ): Promise<void>
  createEventChainConfig(
    type: EventChain['type'],
    achievements: PendingAchievement[],
    levelAchievements: PendingAchievement[],
    xpResult: XPResult,
    context?: {
      bubble?: BubbleNode
      question?: Question
      bubbleId?: number
    }
  ): EventChain
} 