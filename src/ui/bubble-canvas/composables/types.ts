import type { Bubble } from '@shared/types'

export interface CanvasBubble extends Bubble {
  radius: number
  color: string
  oscillationPhase: number
  targetRadius: number
  currentRadius: number
  baseRadius: number
  isHovered?: boolean
  textLines?: string[]
  textScaleFactor?: number
  bubbleType?: 'regular' | 'philosophy' | 'hidden'
}

export interface SimulationNode extends CanvasBubble {
  x: number
  y: number
  vx?: number
  vy?: number
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