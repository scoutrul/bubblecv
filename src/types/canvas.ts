import type { NormalizedSkillBubble } from '@/types/normalized'

export interface CanvasBubble extends NormalizedSkillBubble {
  radius: number
  oscillationPhase: number
  targetRadius: number
  currentRadius: number
  baseRadius: number
  isHovered?: boolean
  textLines?: string[]
  textScaleFactor?: number
  bubbleType?: 'regular' | 'philosophy' | 'hidden'
}

export interface SimulationNode extends NormalizedSkillBubble, PositionData {
  radius: number
  baseRadius: number
  targetRadius: number
  currentRadius: number
  isHovered?: boolean
  isActive?: boolean
  isVisited?: boolean
  isReady?: boolean
  oscillationPhase: number
  textLines?: string[]
  textScaleFactor?: number
}

export interface ExplosionEffect {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  startTime: number
}

export interface FloatingText {
  x: number
  y: number
  text: string
  opacity: number
  startTime: number
  duration: number
  color: string
  type: 'xp' | 'life'
  id: number
}

export interface ShakeConfig {
  duration: number
  intensity: number
  startTime: number
  isShaking: boolean
}

export interface PositionData {
  x: number
  y: number
  vx: number
  vy: number
}