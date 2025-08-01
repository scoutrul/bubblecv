import type { SkillLevel } from './skill-levels'

export interface Bubble {
  name: string
  year: number
  skillLevel: SkillLevel
  description: string
  insight?: string
  category?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  isUnlocked: boolean
  xpReward: number
  isShown: boolean
  points?: number 
}

export interface Question {
  id: string
  type: string
  question: string
  options: QuestionOption[]
  insight: string
}

export interface QuestionOption {
  id: string | number
  text: string
  response: string
  agreementLevel: number
  livesLost: number
}

export interface Bonus {
  level: number
  title: string
  icon: string
  type: 'text' | 'form' 
  content: string
}