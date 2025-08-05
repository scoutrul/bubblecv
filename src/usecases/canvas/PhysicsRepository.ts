import * as d3 from 'd3'
import type { PhysicsRepository as IPhysicsRepository, PushNeighborsParams, ExplodeFromPointParams } from './types'
import type { BubbleNode } from '@/types/canvas'

export class PhysicsRepository implements IPhysicsRepository {
  private simulation: d3.Simulation<BubbleNode, undefined> | null = null
  private restartInterval: number = 0
  private physicsCalculator: any = null

  async initSimulation(width: number, height: number, level: number = 1): Promise<d3.Simulation<BubbleNode, undefined>> {
    // Высота HUD панели (примерно 80px с отступами)
    const hudHeight = 80
    const effectiveHeight = height - hudHeight
    const centerY = (effectiveHeight / 2) + hudHeight

    // Инициализируем PHYSICS_CALCULATOR один раз
    if (!this.physicsCalculator) {
      const { PHYSICS_CALCULATOR } = await import('@/config')
      this.physicsCalculator = PHYSICS_CALCULATOR
    }
    const simulationPhysics = this.physicsCalculator.getSimulationPhysics(level)

    // Инициализируем симуляцию с улучшенной физикой для импульсов
    this.simulation = d3.forceSimulation<BubbleNode>()
      .force('center', d3.forceCenter(width / 2, centerY).strength(simulationPhysics.centerForceStrength))
      .force('collision', d3.forceCollide<BubbleNode>().radius(d => (d.currentRadius || d.baseRadius || 20) + 5).strength(simulationPhysics.collisionForceStrength))
      .force('charge', d3.forceManyBody().strength(simulationPhysics.chargeForceStrength))
      .force('attract', d3.forceRadial(0, width / 2, centerY).strength(simulationPhysics.attractForceStrength))
      .alpha(simulationPhysics.alphaBase)
      .alphaDecay(0.02) // Добавляем небольшое затухание для стабилизации
      .velocityDecay(simulationPhysics.velocityDecay)

    // Принудительно поддерживаем симуляцию
    this.restartInterval = window.setInterval(() => {
      if (this.simulation && this.simulation.alpha() < 0.1) {
        this.simulation.alpha(simulationPhysics.alphaBase).restart()
      }
    }, simulationPhysics.restartInterval)

    // Запускаем начальную симуляцию с высокой энергией для правильного размещения
    setTimeout(() => {
      if (this.simulation) {
        this.simulation.alpha(0.8).restart()
      }
    }, 100)

    return this.simulation
  }

  updateSimulationSize(width: number, height: number): void {
    if (!this.simulation) return

    this.simulation
      .force('center', d3.forceCenter(width / 2, height / 2))
      .alpha(0.5)
      .restart()
  }

  updateNodes(nodes: BubbleNode[]): void {
    if (!this.simulation) return
    this.simulation.nodes(nodes)
    
    // Если это первое обновление узлов, запускаем с высокой энергией
    const isFirstUpdate = this.simulation.alpha() === 0
    const alpha = isFirstUpdate ? 0.9 : 0.7
    
    this.simulation.alpha(alpha).restart()
  }

  pushNeighbors(params: PushNeighborsParams, level: number = 1): void {
    const { centerBubble, pushRadius, pushStrength, nodes } = params
    let affectedCount = 0

    // Используем кэшированный PHYSICS_CALCULATOR
    if (!this.physicsCalculator) {
      // Если PHYSICS_CALCULATOR еще не загружен, пропускаем операцию
      return
    }
    const explosionPhysics = this.physicsCalculator.getExplosionPhysics(level)

    nodes.forEach(bubble => {
      if (!bubble || bubble.id === centerBubble.id) return
      if (typeof bubble.x !== 'number' || typeof bubble.y !== 'number') return

      const dx = bubble.x - centerBubble.x
      const dy = bubble.y - centerBubble.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < pushRadius && distance > 0) {
        const normalizedDx = dx / distance
        const normalizedDy = dy / distance
        const force = pushStrength * (1 - distance / pushRadius) * explosionPhysics.pushForceMultiplier

        const currentVx = bubble.vx || 0
        const currentVy = bubble.vy || 0

        bubble.vx = currentVx + normalizedDx * force
        bubble.vy = currentVy + normalizedDy * force

        bubble.x += normalizedDx * force * 0.5
        bubble.y += normalizedDy * force * 0.5

        const maxVelocity = explosionPhysics.pushMaxVelocity
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
      // Откладываем перезапуск симуляции на следующий кадр
      requestAnimationFrame(() => {
        const simulationPhysics = this.physicsCalculator.getSimulationPhysics(level)
        this.simulation?.alpha(simulationPhysics.alphaBase).restart()
      })
    }
  }

  explodeFromPoint(params: ExplodeFromPointParams, level: number = 1): void {
    const { clickX, clickY, explosionRadius, explosionStrength, nodes, width, height } = params
    let affectedCount = 0

    // Используем кэшированный PHYSICS_CALCULATOR
    if (!this.physicsCalculator) {
      // Если PHYSICS_CALCULATOR еще не загружен, пропускаем операцию
      return
    }
    const explosionPhysics = this.physicsCalculator.getExplosionPhysics(level)

    nodes.forEach(bubble => {
      if (!bubble || typeof bubble.x !== 'number' || typeof bubble.y !== 'number') return
      
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

        const force = explosionStrength * (1 - distance / explosionRadius) * explosionPhysics.explosionForceMultiplier

        bubble.vx = (bubble.vx || 0) + normalizedDx * force
        bubble.vy = (bubble.vy || 0) + normalizedDy * force

        bubble.x += normalizedDx * force * 0.8
        bubble.y += normalizedDy * force * 0.8

        const maxVelocity = explosionPhysics.explosionMaxVelocity
        const currentVelocity = Math.sqrt((bubble.vx || 0) ** 2 + (bubble.vy || 0) ** 2)
        if (currentVelocity > maxVelocity) {
          const scale = maxVelocity / currentVelocity
          bubble.vx = (bubble.vx || 0) * scale
          bubble.vy = (bubble.vy || 0) * scale
        }

        const padding = (bubble.currentRadius || 20) + 5
        bubble.x = Math.max(padding, Math.min(width - padding, bubble.x))
        bubble.y = Math.max(padding, Math.min(height - padding, bubble.y))

        affectedCount++
      }
    })

    if (this.simulation && affectedCount > 0) {
      // Откладываем перезапуск симуляции на следующий кадр
      requestAnimationFrame(() => {
        const simulationPhysics = this.physicsCalculator.getSimulationPhysics(level)
        this.simulation?.alpha(simulationPhysics.alphaBase).restart()
      })
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