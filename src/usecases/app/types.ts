import type { Ref, ComputedRef } from 'vue'
import type { BubbleNode } from '@/types/canvas'
import type { Level } from '@/types/levels'
import type { NormalizedAchievement as Achievement, NormalizedBubble } from '@/types/normalized'
import type { NormalizedBonus as Bonus } from '@/types/normalized'

// === ПАРАМЕТРЫ И РЕЗУЛЬТАТЫ USE CASES ===

// InitializeApp
export interface InitializeAppParams {
  lives?: number
}

export interface InitializeAppResult {
  success: boolean
  initialized: boolean
  error?: string
}

// ResetGame
export interface ResetGameParams {
  // Пустые параметры
}

export interface ResetGameResult {
  success: boolean
  gameReset: boolean
  error?: string
}

// LoadOldBubbles
export interface LoadOldBubblesParams {
  currentLevel: number
}

export interface LoadOldBubblesResult {
  success: boolean
  bubblesLoaded: boolean
  bubblesCount: number
  error?: string
}

// GetGameState
export interface GetGameStateParams {
  // Пустые параметры
}

export interface GetGameStateResult {
  success: boolean
  gameState: {
    currentLevel: number
    currentLevelTitle: string
    currentLevelIcon: string
    currentXP: number
    currentLives: number
    xpProgress: number
    nextLevelXP: number
    visitedBubbles: number[]
    currentYear: number
    startYear: number
    endYear: number
    maxLives: number
  }
  error?: string
}

// === ИНТЕРФЕЙСЫ ДЛЯ STORES ===

export interface AppSessionStore {
  session: {
    currentLevel: number
    currentXP: number
    lives: number
    currentYear: number
    visitedBubbles: number[]
  } | null
  xpProgress: number
  nextLevelXP: number
  startSession(params: { lives: number }): Promise<void>
  updateCurrentYear(year: number, triggerAnimation?: boolean): void
  yearTransitionTrigger: Ref<boolean>
}

export interface AppBubbleStore {
  bubbles: BubbleNode[]
  loadBubbles(): Promise<void>
  addBubbles(bubbles: NormalizedBubble[]): void
}

export interface AppLevelStore {
  levels: Level[]
  loadLevels(): Promise<void>
  getLevelByNumber(level: number): Level | undefined
}

export interface AppAchievementStore {
  achievements: Achievement[]
  unlockedCount: number
  unlockedAchievements: Achievement[]
  loadAchievements(): Promise<void>
  showAchievements(): void
  closeAchievements(): void
  toggleAchievements(): void
}

export interface AppBonusStore {
  bonuses: Bonus[]
  unlockedBonusesCount: number
  unlockedBonuses: Bonus[]
  loadBonuses(): Promise<void>
  showBonusPanel(): void
  closeBonusPanel(): void
  toggleBonusPanel(): void
}

export interface AppModalStore {
  openWelcome(): void
}

// === ИНТЕРФЕЙСЫ ДЛЯ РЕПОЗИТОРИЯ ===

export interface AppRepository {
  getOldBubbles(): Promise<NormalizedBubble[]>
  getYearRange(bubbles: NormalizedBubble[]): { startYear: number; endYear: number }
  getFirstLevelData(): { title: string; icon: string }
}

// === ИНТЕРФЕЙСЫ ДЛЯ USE CASES ===

export interface InitializeAppUseCase {
  execute(params: InitializeAppParams): Promise<InitializeAppResult>
}

export interface ResetGameUseCase {
  execute(params: ResetGameParams): Promise<ResetGameResult>
}

export interface LoadOldBubblesUseCase {
  execute(params: LoadOldBubblesParams): Promise<LoadOldBubblesResult>
}

export interface GetGameStateUseCase {
  execute(params: GetGameStateParams): Promise<GetGameStateResult>
} 