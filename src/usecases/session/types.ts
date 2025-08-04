import type { UserSession } from '@/types/session'
import type { NormalizedBubble } from '@/types/normalized'
import type { Achievement } from '@/types/data'
import { Ref } from 'vue'

// Параметры и результаты для GainXP
export interface GainXPParams {
  amount: number
}

export interface GainXPResult {
  success: boolean
  leveledUp: boolean
  newLevel?: number
  levelData?: {
    level: number
    title?: string
    description?: string
    currentXP: number
    xpGained: number
    icon: string
  }
  error?: string
}

// Параметры и результаты для LoseLives
export interface LoseLivesParams {
  amount?: number
}

export interface LoseLivesResult {
  success: boolean
  livesRemaining: number
  gameCompleted: boolean
  error?: string
}

// Параметры и результаты для VisitBubble
export interface VisitBubbleParams {
  bubbleId: NormalizedBubble['id']
}

export interface VisitBubbleResult {
  success: boolean
  wasNewVisit: boolean
  error?: string
}

// Параметры и результаты для UpdateCurrentYear
export interface UpdateCurrentYearParams {
  year: number
  triggerAnimation?: boolean
}

export interface UpdateCurrentYearResult {
  success: boolean
  error?: string
}

// Параметры и результаты для StartSession
export interface StartSessionParams {
  lives?: number
}

export interface StartSessionResult {
  success: boolean
  sessionId: string
  error?: string
}

// Параметры и результаты для SavePhilosophyAnswer
export interface SaveCustomPhilosophyAnswerParams {
  questionId: string
  answer: string
  questionText: string
}

export interface SaveSelectedPhilosophyAnswerParams {
  questionId: string
  selectedOptionText: string
  questionText: string
}

export interface SavePhilosophyAnswerResult {
  success: boolean
  error?: string
}

// Интерфейсы для stores
export interface SessionSessionStore {
  session: UserSession | null
  currentXP: number
  createSession(sessionData: UserSession): void
  addXP(amount: number): void
  setLevel(level: number): void
  setLives(lives: number): void
  setGameCompleted(completed: boolean): void
  addVisitedBubble(bubbleId: number): void
  setCurrentYear(year: number): void
}

export interface SessionLevelStore {
  getLevelByNumber(level: number): {
    title?: string
    description?: string
    icon?: string
  } | undefined
}

export interface SessionAchievementStore {
  unlockAchievement(id: string, showModal?: boolean): Promise<Achievement | null | undefined>
  resetAchievements(): void
}

export interface SessionBonusStore {
  unlockBonusForLevel(level: number): void
  resetBonuses(): void
}

export interface SessionModalStore {
  openAchievementModal(achievement: {
    title: string
    description: string
    icon: string
    xpReward: number
  }): void
}

export interface SessionCanvasRepository {
  resetCanvas(): void
}

export interface SessionMemoirStore {
  resetReadMemoirs(): void
}

// Интерфейс для SessionUseCase
export interface SessionUseCase {
  gainXP(params: GainXPParams): Promise<GainXPResult>
  loseLives(params: LoseLivesParams): Promise<LoseLivesResult>
  visitBubble(params: VisitBubbleParams): Promise<VisitBubbleResult>
  updateCurrentYear(params: UpdateCurrentYearParams): Promise<UpdateCurrentYearResult>
  startSession(params: StartSessionParams): Promise<StartSessionResult>
  saveCustomPhilosophyAnswer(params: SaveCustomPhilosophyAnswerParams): Promise<SavePhilosophyAnswerResult>
  saveSelectedPhilosophyAnswer(params: SaveSelectedPhilosophyAnswerParams): Promise<SavePhilosophyAnswerResult>
} 