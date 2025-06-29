import type { Bubble } from '../../../../shared/types'

export interface BubbleNode extends Bubble {
  radius: number
  color: string
  oscillationPhase: number
  targetRadius: number
  currentRadius: number
  baseRadius: number
  isHovered?: boolean
  isVisited?: boolean
  textLines?: string[]
}

export interface SimulationNode extends BubbleNode {
  x: number
  y: number
  vx?: number
  vy?: number
}

export interface ExplosionEffect {
  x: number
  y: number
  radius: number
  alpha: number
  color: string
}

export interface BubbleContinueEvent extends CustomEvent {
  detail: {
    bubbleId: string
  }
}

declare global {
  interface WindowEventMap {
    'bubble-continue': BubbleContinueEvent
  }
} 