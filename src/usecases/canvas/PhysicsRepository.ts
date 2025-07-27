import * as d3 from 'd3'
import type { PhysicsRepository as IPhysicsRepository, PushNeighborsParams, ExplodeFromPointParams } from './types'
import type { BubbleNode } from '@/types/canvas'

export class PhysicsRepository implements IPhysicsRepository {
  private simulation: d3.Simulation<BubbleNode, undefined> | null = null
  private restartInterval: number = 0

  initSimulation(width: number, height: number): d3.Simulation<BubbleNode, undefined> {
    // Высота HUD панели (примерно 80px с отступами)
    const hudHeight = 80
    const effectiveHeight = height - hudHeight
    const centerY = (effectiveHeight / 2) + hudHeight

    // Инициализируем симуляцию с улучшенной физикой для импульсов
    this.simulation = d3.forceSimulation<BubbleNode>()
      .force('center', d3.forceCenter(width / 2, centerY).strength(0.003))
      .force('collision', d3.forceCollide<BubbleNode>().radius(d => d.currentRadius + 3).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-8))
      .force('attract', d3.forceRadial(0, width / 2, centerY).strength(0.002))
      .alpha(0.3)
      .alphaDecay(0)
      .velocityDecay(0.85)

    // Принудительно поддерживаем симуляцию
    this.restartInterval = window.setInterval(() => {
      if (this.simulation && this.simulation.alpha() < 0.1) {
        this.simulation.alpha(0.3).restart()
      }
    }, 3000)

    return this.simulation
  }

  updateSimulationSize(width: number, height: number): void {
    if (!this.simulation) return

    const hudHeight = 80
    const effectiveHeight = height - hudHeight

    this.simulation
      .force('center', d3.forceCenter(width / 2, (effectiveHeight / 2) + hudHeight))
      .alpha(0.3)
      .restart()
  }

  updateNodes(nodes: BubbleNode[]): void {
    if (!this.simulation) return
    this.simulation.nodes(nodes)
    this.simulation.alpha(0.5).restart()
  }

  pushNeighbors(params: PushNeighborsParams): void {
    const { centerBubble, pushRadius, pushStrength, nodes } = params
    let affectedCount = 0

    nodes.forEach(bubble => {
      if (bubble.id === centerBubble.id) return

      const dx = bubble.x - centerBubble.x
      const dy = bubble.y - centerBubble.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < pushRadius && distance > 0) {
        const normalizedDx = dx / distance
        const normalizedDy = dy / distance
        const force = pushStrength * (1 - distance / pushRadius) * 3

        const currentVx = bubble.vx || 0
        const currentVy = bubble.vy || 0

        bubble.vx = currentVx + normalizedDx * force
        bubble.vy = currentVy + normalizedDy * force

        bubble.x += normalizedDx * force * 0.5
        bubble.y += normalizedDy * force * 0.5

        const maxVelocity = 15
        const currentVelocity = Math.sqrt(bubble.vx ** 2 + bubble.vy ** 2)
        if (currentVelocity > maxVelocity) {
          const scale = maxVelocity / currentVelocity
          bubble.vx = bubble.vx * scale
          bubble.vy = bubble.vy * scale
        }

        affectedCount++
      }
    })

    if (this.simulation && affectedCount > 0) {
      this.simulation.alpha(0.5).restart()
    }
  }

  explodeFromPoint(params: ExplodeFromPointParams): void {
    const { clickX, clickY, explosionRadius, explosionStrength, nodes, width, height } = params
    let affectedCount = 0

    nodes.forEach(bubble => {
      const dx = bubble.x - clickX
      const dy = bubble.y - clickY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < explosionRadius) {
        let normalizedDx, normalizedDy
        if (distance < 5) {
          const randomAngle = Math.random() * Math.PI * 2
          normalizedDx = Math.cos(randomAngle)
          normalizedDy = Math.sin(randomAngle)
        } else {
          normalizedDx = dx / distance
          normalizedDy = dy / distance
        }

        const force = explosionStrength * (1 - distance / explosionRadius) * 4

        bubble.vx = (bubble.vx || 0) + normalizedDx * force
        bubble.vy = (bubble.vy || 0) + normalizedDy * force

        bubble.x += normalizedDx * force * 0.8
        bubble.y += normalizedDy * force * 0.8

        const maxVelocity = 20
        const currentVelocity = Math.sqrt((bubble.vx || 0) ** 2 + (bubble.vy || 0) ** 2)
        if (currentVelocity > maxVelocity) {
          const scale = maxVelocity / currentVelocity
          bubble.vx = (bubble.vx || 0) * scale
          bubble.vy = (bubble.vy || 0) * scale
        }

        const padding = bubble.currentRadius + 5
        bubble.x = Math.max(padding, Math.min(width - padding, bubble.x))
        bubble.y = Math.max(padding, Math.min(height - padding, bubble.y))

        affectedCount++
      }
    })

    if (this.simulation && affectedCount > 0) {
      this.simulation.alpha(0.8).restart()
    }
  }

  stopSimulation(): void {
    if (this.restartInterval) {
      clearInterval(this.restartInterval)
      this.restartInterval = 0
    }

    if (this.simulation) {
      this.simulation.stop()
      this.simulation = null
    }
  }

  getSimulation(): d3.Simulation<BubbleNode, undefined> | null {
    return this.simulation
  }
} 