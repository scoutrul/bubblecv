import type { NormalizedBubble } from '@/types/normalized'

export interface PositionData {
  x: number
  y: number
  vx: number
  vy: number
}

export interface BubbleNode extends NormalizedBubble, PositionData {
  radius: number
  baseRadius: number
  targetRadius: number
  currentRadius: number
  isHovered?: boolean
  isActive: boolean
  isVisited?: boolean
  isReady?: boolean
  oscillationPhase: number
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
