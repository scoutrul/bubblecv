import type { Ref } from 'vue'
import type { BubbleNode, ExplosionEffect, FloatingText, DebrisParticle } from '@/types/canvas'
import type { Simulation } from 'd3-force'
import type { NormalizedBubble } from '@/types/normalized'
import type { UserSession } from '@/types/session'
import type { Level } from '@/types/levels'
import type { Question } from '@/types/data'

// Domain Entities
export interface CanvasDomain {
  width: number
  height: number
  isInitialized: boolean
  nodes: BubbleNode[]
  animationId: number
}

export interface PhysicsDomain {
  simulation: Simulation<BubbleNode, undefined> | null
  restartInterval: number
}

export interface EffectsDomain {
  explosionEffects: ExplosionEffect[]
  floatingTexts: FloatingText[]
  debrisParticles: DebrisParticle[]
  shakeConfig: {
    duration: number
    intensity: number
    startTime: number
    isShaking: boolean
  }
}

// Use Case Parameters
export interface InitCanvasParams {
  width: number
  height: number
  canvasRef: Ref<HTMLCanvasElement | null>
}

export interface UpdateCanvasSizeParams {
  width: number
  height: number
}

export interface UpdateBubblesParams {
  bubbles: BubbleNode[]
}

export interface HandleMouseMoveParams {
  event: MouseEvent
  nodes: BubbleNode[]
}

export interface HandleClickParams {
  event: MouseEvent
  nodes: BubbleNode[]
  width: number
  height: number
}

export interface ExplodeBubbleParams {
  bubble: BubbleNode
  nodes: BubbleNode[]
  width: number
  height: number
}

export interface CreateFloatingTextParams {
  x: number
  y: number
  text: string
  type: 'xp' | 'life'
  color?: string
}

export interface PushNeighborsParams {
  centerBubble: BubbleNode
  pushRadius: number
  pushStrength: number
  nodes: BubbleNode[]
}

export interface ExplodeFromPointParams {
  clickX: number
  clickY: number
  explosionRadius: number
  explosionStrength: number
  nodes: BubbleNode[]
  width: number
  height: number
}

// Use Case Results
export interface InitCanvasResult {
  success: boolean
  error?: string
}

export interface HandleClickResult {
  success: boolean
  bubblePopped?: boolean
  error?: string
}

export interface ExplodeBubbleResult {
  success: boolean
  remainingNodes: BubbleNode[]
  error?: string
}

// Store Interfaces
export interface BubbleStore {
  bubbles: NormalizedBubble[]
  isLoading: boolean
  incrementToughBubbleClicks(bubbleId: number): { isReady: boolean; clicks: number; required: number }
  incrementHiddenBubbleClicks(bubbleId: number): { isReady: boolean; clicks: number; required: number }
  addHiddenBubbles(years: number[]): void
}

export interface SessionStore {
  visitedBubbles: number[]
  currentYear: number
  session: UserSession | null
}

export interface CanvasModalStore {
  openLevelUpModal(level: number, payload?: {
    level: number
    title?: string
    description?: string
    icon?: string
    currentXP: number
    xpGained: number
    xpRequired: number
    isProjectTransition?: boolean
  }): void
  openBubbleModal(bubble: NormalizedBubble): void
  openPhilosophyModal(question: Question, bubbleId: number): void
  handleSecretBubbleDestroyed(): Promise<void>
}

// Repository Interfaces
export interface CanvasRepository {
  getContext(): CanvasRenderingContext2D | null
  clearCanvas(): void
  drawStarfield(): void
  drawBubble(bubble: BubbleNode): void
  drawText(bubble: BubbleNode): void
  drawFloatingTexts(): void
  drawDebrisEffects(): void
  drawHoverEffect(bubble: BubbleNode): void
  applyShakeOffset(offset: { x: number, y: number }): void
  initStarfield(width: number, height: number): void
  updateStarfieldSize(width: number, height: number): void
  updateCanvasSize(width: number, height: number): void
  getPerformanceInfo(): { fps: number; performanceLevel: number; starCount: number; activeNodes: number }
  getStarCounts(): { deepBg: number; center: number; bg: number; fg: number }
}

export interface PhysicsRepository {
  initSimulation(width: number, height: number, level?: number): Promise<Simulation<BubbleNode, undefined>>
  updateSimulationSize(width: number, height: number): void
  updateNodes(nodes: BubbleNode[]): void
  pushNeighbors(params: PushNeighborsParams, level?: number): void
  explodeFromPoint(params: ExplodeFromPointParams, level?: number): void
  stopSimulation(): void
  getSimulation(): Simulation<BubbleNode, undefined> | null
}

export interface EffectsRepository {
  addExplosionEffect(x: number, y: number, radius: number): void
  addDebrisEffect(x: number, y: number, radius: number, color: string): void
  createFloatingText(params: CreateFloatingTextParams): void
  startShake(): void
  calculateShakeOffset(): { x: number, y: number }
  clearAllEffects(): void
  explodeBubble(bubble: BubbleNode): void
  drawFloatingTexts(context: CanvasRenderingContext2D): void
  drawDebrisEffects(context: CanvasRenderingContext2D, bubbles?: BubbleNode[]): void
  drawHoverEffect(context: CanvasRenderingContext2D, bubble: BubbleNode): void
  animateToughBubbleHit(bubble: BubbleNode): void
  calculateBubbleJump(mouseX: number, mouseY: number, bubble: BubbleNode, clicks?: number, level?: number): Promise<{ vx: number, vy: number, x: number, y: number }>
}

export interface BubbleManagerRepository {
  createNodes(bubbles: BubbleNode[], width: number, height: number): BubbleNode[]
  updateBubbleStates(nodes: BubbleNode[], width: number, height: number, level?: number): Promise<void>
  savePositions(nodes: BubbleNode[]): void
  removeBubble(bubbleId: number, nodes: BubbleNode[]): BubbleNode[]
  findBubbleUnderCursor(mouseX: number, mouseY: number, nodes: BubbleNode[]): BubbleNode | null
  clearSavedPositions(): void
}

// Main Use Case Interface
export interface CanvasUseCase {
  initCanvas(params: InitCanvasParams): Promise<InitCanvasResult>
  updateCanvasSize(params: UpdateCanvasSizeParams): void
  updateBubbles(params: UpdateBubblesParams): void
  handleMouseMove(params: HandleMouseMoveParams): Promise<void>
  handleClick(params: HandleClickParams): Promise<HandleClickResult>
  explodeBubble(params: ExplodeBubbleParams): Promise<ExplodeBubbleResult>
  removePhilosophyBubble(bubbleId: number): Promise<void>
  findBubbleById(bubbleId: number): BubbleNode | undefined
  createFloatingText(params: { x: number; y: number; text: string; type: 'xp' | 'life'; color?: string }): void
  destroyCanvas(): void
  render(): void
  animate(): void
  getCurrentBubbles(): BubbleNode[]
} 