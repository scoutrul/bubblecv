import { ref, type Ref } from 'vue'
import * as d3 from 'd3'
import type { Bubble } from '../../../shared/types'
import type { BubbleNode, SimulationNode, ExplosionEffect, BubbleContinueEvent } from './types/bubble.types'
import { useSessionStore } from '../../../entities/user-session/model/session-store'
import { useModalStore } from '../../../shared/stores/modal-store'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import { getExpertiseConfig } from './useBubbleConfig'
import { wrapText } from './useBubbleUtils'

export interface BubbleSimulationBase {
  initSimulation(width: number, height: number): void
  updateBubbles(bubbles: Bubble[]): void
  destroySimulation(): void
  handleBubbleContinue(event: BubbleContinueEvent): Promise<void>
  readonly initialized: boolean
}

export abstract class BubbleSimulationBaseImpl implements BubbleSimulationBase {
  protected isInitialized = false
  protected sessionStore = useSessionStore()
  protected modalStore = useModalStore()
  protected simulation: d3.Simulation<SimulationNode, undefined> | null = null
  protected nodes: SimulationNode[] = []
  protected width = 0
  protected height = 0
  protected animationId = 0
  protected hoveredBubble: SimulationNode | null = null
  protected restartInterval = 0
  protected explosionEffects: ExplosionEffect[] = []
  protected savedPositions = new Map<string, { x: number, y: number, vx: number, vy: number }>()
  protected screenShake = { x: 0, y: 0, intensity: 0 }

  constructor() {
    // Привязка методов будет происходить в конкретных реализациях
  }

  // Абстрактные методы для реализации в подклассах
  protected abstract render(): void
  protected abstract initRenderer(width: number, height: number): void
  protected abstract destroyRenderer(): void
  protected abstract drawBubble(bubble: SimulationNode): void
  protected abstract drawText(bubble: SimulationNode): void
  protected abstract getContainerRect(): DOMRect | null
  protected abstract setCursor(cursor: string): void
  protected abstract handleMouseLeave(): void
  protected abstract handleClick(event: MouseEvent): Promise<void>
  protected abstract pushNeighbors(centerBubble: SimulationNode, pushRadius: number, pushStrength: number): void

  // Публичные методы интерфейса
  public abstract handleBubbleContinue(event: BubbleContinueEvent): Promise<void>

  // Общие методы
  protected isWindows(): boolean {
    return typeof window !== 'undefined' && /Win/.test(window.navigator.platform)
  }

  protected handleMouseMove(event: MouseEvent): void {
    const rect = this.getContainerRect()
    if (!rect) return

    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const newHoveredBubble = this.findBubbleUnderCursor(mouseX, mouseY)

    if (newHoveredBubble !== this.hoveredBubble) {
      if (this.hoveredBubble) {
        this.hoveredBubble.targetRadius = this.hoveredBubble.baseRadius
        this.hoveredBubble.isHovered = false
      }

      this.hoveredBubble = newHoveredBubble

      if (this.hoveredBubble) {
        this.hoveredBubble.targetRadius = this.hoveredBubble.baseRadius * 1.2
        this.hoveredBubble.isHovered = true
        this.setCursor('pointer')
        
        const pushRadius = this.hoveredBubble.baseRadius * 4
        const pushStrength = 8
        this.pushNeighbors(this.hoveredBubble, pushRadius, pushStrength)
      } else {
        this.setCursor('default')
      }
    }
  }

  protected findBubbleUnderCursor(mouseX: number, mouseY: number): SimulationNode | null {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const bubble = this.nodes[i]
      const dx = mouseX - bubble.x
      const dy = mouseY - bubble.y
      if (Math.sqrt(dx * dx + dy * dy) <= bubble.currentRadius) {
        return bubble
      }
    }
    return null
  }

  // Публичные методы для управления симуляцией
  public initSimulation(width: number, height: number): void {
    this.width = width
    this.height = height
    
    this.initRenderer(width, height)
    
    this.simulation = d3.forceSimulation<SimulationNode>()
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.005))
      .force('collision', d3.forceCollide<SimulationNode>().radius(d => d.currentRadius + 8).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-12))
      .force('attract', d3.forceRadial(0, width / 2, height / 2).strength(0.003))
      .alpha(0.3)
      .alphaDecay(0)
      .velocityDecay(0.75)

    this.restartInterval = window.setInterval(() => {
      if (this.simulation && this.simulation.alpha() < 0.1) {
        this.simulation.alpha(0.3).restart()
      }
    }, 3000)

    this.animate()
    window.addEventListener('bubble-continue', this.handleBubbleContinue as unknown as EventListener)
    this.isInitialized = true
  }

  protected animate(): void {
    this.updateBubbleStates()
    this.render()
    this.animationId = requestAnimationFrame(() => this.animate())
  }

  public updateBubbles(bubbles: Bubble[]): void {
    if (!this.simulation) return

    this.nodes.forEach(node => {
      this.savedPositions.set(node.id, {
        x: node.x,
        y: node.y,
        vx: node.vx || 0,
        vy: node.vy || 0
      })
    })

    this.nodes = this.createNodes(bubbles)
    this.simulation.nodes(this.nodes)
    this.simulation.alpha(0.5).restart()
  }

  public destroySimulation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = 0
    }
    
    if (this.restartInterval) {
      clearInterval(this.restartInterval)
      this.restartInterval = 0
    }
    
    if (this.simulation) {
      this.simulation.stop()
      this.simulation = null
    }
    
    window.removeEventListener('bubble-continue', this.handleBubbleContinue as unknown as EventListener)
    this.destroyRenderer()
    
    this.nodes = []
    this.savedPositions.clear()
    this.isInitialized = false
  }

  protected createNodes(bubbles: Bubble[]): SimulationNode[] {
    const sizes = this.calculateAdaptiveSizes(bubbles.length)
    
    return bubbles.map((bubble) => {
      const expertiseConfig = getExpertiseConfig(bubble.skillLevel)
      const skillLevels = ['novice', 'intermediate', 'confident', 'expert', 'master']
      const skillIndex = skillLevels.indexOf(bubble.skillLevel)
      const sizeRatio = (skillIndex + 1) / skillLevels.length
      
      const calculatedRadius = sizes.min + (sizes.max - sizes.min) * sizeRatio
      const baseRadius = calculatedRadius * expertiseConfig.sizeMultiplier
      
      const savedPos = this.savedPositions.get(bubble.id)
      
      return {
        ...bubble,
        radius: baseRadius,
        baseRadius,
        color: expertiseConfig.color,
        oscillationPhase: Math.random() * Math.PI * 2,
        targetRadius: baseRadius,
        currentRadius: baseRadius,
        x: savedPos?.x ?? Math.random() * this.width,
        y: savedPos?.y ?? Math.random() * this.height,
        vx: savedPos?.vx ?? 0,
        vy: savedPos?.vy ?? 0,
        isHovered: false,
        isVisited: this.sessionStore.visitedBubbles.includes(bubble.id),
        textLines: wrapText(bubble.name, baseRadius)
      }
    })
  }

  protected calculateAdaptiveSizes(bubbleCount: number): { min: number, max: number } {
    const screenArea = this.width * this.height * 0.75
    const averageAreaPerBubble = screenArea / bubbleCount
    const averageRadius = Math.sqrt(averageAreaPerBubble / Math.PI)
    
    const aspectRatio = this.width / this.height
    const aspectFactor = Math.min(1.2, Math.max(0.8, aspectRatio / 1.5))
    
    const baseMinRadius = Math.max(20, averageRadius * 0.5 * aspectFactor)
    const baseMaxRadius = Math.min(100, averageRadius * 1.5 * aspectFactor)
    
    const maxAllowedRadius = Math.min(this.width, this.height) / 8
    const minRadius = Math.min(baseMinRadius, maxAllowedRadius * 0.3)
    const maxRadius = Math.min(baseMaxRadius, maxAllowedRadius)
    
    return { min: minRadius, max: maxRadius }
  }

  protected updateBubbleStates(): void {
    // Update screen shake
    if (this.screenShake.intensity > 0) {
      this.screenShake.intensity *= 0.9
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity
    }

    // Update bubble states
    this.nodes.forEach(bubble => {
      // Breathing animation
      bubble.oscillationPhase += 0.05
      const breathingEffect = Math.sin(bubble.oscillationPhase) * 2

      // Apply screen shake to bubble position
      const shakeX = this.screenShake.intensity > 0.1 ? this.screenShake.x : 0
      const shakeY = this.screenShake.intensity > 0.1 ? this.screenShake.y : 0

      // Update bubble radius with breathing and screen shake
      bubble.currentRadius += (bubble.targetRadius - bubble.currentRadius) * 0.1
      bubble.x += shakeX
      bubble.y += shakeY

      // Keep bubbles within bounds
      bubble.x = Math.max(bubble.currentRadius, Math.min(this.width - bubble.currentRadius, bubble.x))
      bubble.y = Math.max(bubble.currentRadius, Math.min(this.height - bubble.currentRadius, bubble.y))
    })
  }

  protected explodeBubble(bubble: SimulationNode) {
    // Add screen shake based on bubble size
    const shakeIntensity = bubble.baseRadius * 0.2
    this.screenShake.intensity = Math.min(20, shakeIntensity) // Cap at 20px

    // Create explosion effect
    this.explosionEffects.push({
      x: bubble.x,
      y: bubble.y,
      radius: bubble.currentRadius * 2,
      alpha: 1,
      color: bubble.color
    })

    // Push away neighboring bubbles
    const pushRadius = bubble.currentRadius * 4
    const pushStrength = bubble.currentRadius * 0.5
    this.pushNeighbors(bubble, pushRadius, pushStrength)

    // Remove the exploded bubble
    this.removeBubble(bubble.id)
  }

  protected removeBubble(bubbleId: string) {
    const index = this.nodes.findIndex(node => node.id === bubbleId)
    if (index !== -1) {
      this.nodes.splice(index, 1)
      if (this.simulation) {
        this.simulation.nodes(this.nodes)
        this.simulation.alpha(0.3).restart()
      }
    }
  }

  public get initialized(): boolean {
    return this.isInitialized
  }
} 