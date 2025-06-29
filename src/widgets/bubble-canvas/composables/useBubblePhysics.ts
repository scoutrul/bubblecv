import * as d3 from 'd3'
import type { Ref } from 'vue'
import type { Bubble } from '../../../shared/types'
import { GAME_CONFIG } from '../../../shared/config/game-config'

export function createSimulation(nodes: any[], width: number, height: number) {
  return d3.forceSimulation(nodes)
    .force('center', d3.forceCenter(width / 2, height / 2).strength(GAME_CONFIG.SIMULATION.CENTER_STRENGTH))
    .force('collision', d3.forceCollide().radius((d: any) => d.currentRadius + 8).strength(GAME_CONFIG.SIMULATION.COLLISION_RADIUS_MULTIPLIER))
    .force('charge', d3.forceManyBody().strength(GAME_CONFIG.SIMULATION.FORCE_STRENGTH))
    .force('attract', d3.forceRadial(0, width / 2, height / 2).strength(GAME_CONFIG.SIMULATION.CENTER_STRENGTH))
    .alpha(0.3)
    .alphaDecay(0)
    .velocityDecay(GAME_CONFIG.SIMULATION.VELOCITY_DECAY)
}

export function updateBubblePhysics(nodes: any[], width: number, height: number) {
  // Броуновское движение и границы
  const time = Date.now() * 0.0008
  nodes.forEach((bubble: any, index: number) => {
    const phase = index * 1.3
    const oscillationX = Math.sin(time * 0.4 + phase) * 0.3
    const oscillationY = Math.cos(time * 0.6 + phase) * 0.2
    const randomX = (Math.random() - 0.5) * 0.05
    const randomY = (Math.random() - 0.5) * 0.05
    bubble.x += oscillationX + randomX
    bubble.y += oscillationY + randomY
    const padding = bubble.currentRadius + 5
    bubble.x = Math.max(padding, Math.min(width - padding, bubble.x))
    bubble.y = Math.max(padding, Math.min(height - padding, bubble.y))
  })
}

// Импульсы, взрывы и т.д. можно вынести аналогично 