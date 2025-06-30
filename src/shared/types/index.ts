// Импорты типов
import type { SkillLevel, BubbleSize } from '../constants/skill-levels'

// Базовые типы для бизнес-логики
export interface Bubble {
  id: string
  name: string
  skillLevel: SkillLevel
  yearStarted: number
  yearEnded?: number
  isActive: boolean
  isEasterEgg: boolean
  isHidden: boolean
  description: string
  projects: string[]
  isPopped: boolean
  isVisited: boolean
  size: BubbleSize
  color: string
  bubbleType?: 'hidden' | 'philosophy' | 'regular'
  isTough: boolean
  toughClicks: number
  currentClicks: number
  link?: string
  x?: number
  y?: number
}

// Импортируем типы из констант
export type { SkillLevel, BubbleSize }

export interface Position {
  x: number
  y: number
}

// Игровые системы
export interface UserSession {
  id: string
  currentXP: number
  currentLevel: number
  lives: number
  unlockedContent: number[]
  visitedBubbles: string[]
  agreementScore: number
  gameCompleted: boolean
  hasDestroyedToughBubble?: boolean
  startTime: Date
  lastActivity: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
  isUnlocked: boolean
  xpReward: number
}

export interface PhilosophyQuestion {
  id: string
  question: string
  context: string
  agreeText: string
  disagreeText: string
  options: string[]
  correctAnswer: string
  explanation: string
  points: number
}

export interface ContentLevel {
  level: number
  xpRequired: number
  title: string
  description: string
  content: {
    name?: string
    title?: string
    location?: string
    photo?: string
    biography?: string
    contact?: {
      email: string
      phone: string
      availability: string
    }
    telegram?: string
    exclusiveContent?: string[]
  }
}

// UI компоненты
export interface ModalProps {
  isOpen: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

// События
export interface BubbleClickEvent {
  bubble: Bubble
  position: Position
}

export interface XPGainEvent {
  amount: number
  source: 'bubble' | 'easter-egg' | 'achievement'
  bubbleId?: string
}

export interface LevelUpEvent {
  newLevel: number
  previousLevel: number
  unlockedContent: ContentLevel
}

// API
export interface ApiResponse {
  success: boolean
  error?: string
  data?: any
}

export interface BubbleData {
  bubbles: Bubble[]
  philosophyQuestions: PhilosophyQuestion[]
  contentLevels: ContentLevel[]
}

// Типы для игровой механики
export interface GameState {
  score: number
  level: number
  lives: number
  isGameOver: boolean
  isPaused: boolean
}

// Типы для модальных окон
export type ModalType = 'welcome' | 'bubble' | 'achievement' | 'gameOver' | 'levelUp' | 'philosophy'

export interface ModalState {
  isOpen: boolean
  type: ModalType | null
  data?: any
} 