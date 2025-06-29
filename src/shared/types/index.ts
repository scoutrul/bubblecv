// Базовые типы для бизнес-логики
export interface Bubble {
  id: string
  name: string
  skillLevel: SkillLevel
  yearStarted: number
  yearEnded?: number
  isActive: boolean
  isEasterEgg: boolean
  isHidden?: boolean
  isTough?: boolean         // Крепкий пузырь - требует несколько кликов
  toughClicks?: number      // Сколько кликов нужно для активации
  currentClicks?: number    // Сколько кликов уже сделано
  description: string
  projects: string[]
  link?: string
  size: BubbleSize
  color: string
  position?: Position
}

export type SkillLevel = 
  | 'novice'
  | 'intermediate'
  | 'confident'
  | 'expert'
  | 'master'

export type BubbleSize = 
  | 'bubble-novice'
  | 'bubble-intermediate'
  | 'bubble-confident'
  | 'bubble-expert'
  | 'bubble-master'

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
  hasDestroyedToughBubble?: boolean  // Флаг для достижения за первый крепкий пузырь
  startTime: Date
  lastActivity: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  isUnlocked: boolean
  unlockedAt?: Date
  xpReward: number
}

export interface PhilosophyQuestion {
  id: string
  question: string
  context: string
  agreeText: string
  disagreeText: string
  livePenalty: number
  isEasterEgg: boolean
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
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface BubbleData {
  bubbles: Bubble[]
  philosophyQuestions: PhilosophyQuestion[]
  contentLevels: ContentLevel[]
} 