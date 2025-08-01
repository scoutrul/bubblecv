import type { BubbleManagerRepository as IBubbleManagerRepository } from './types'
import type { BubbleNode, PositionData } from '@/types/canvas'
import { isWindows } from '@/utils/ui'
import { calculateAdaptiveSizes, calcBubbleRadius } from '@/utils/bubble'

export class BubbleManagerRepository implements IBubbleManagerRepository {
  private savedPositions = new Map<number, PositionData>()

  createNodes(bubbles: BubbleNode[], width: number, height: number): BubbleNode[] {
    const sizes = calculateAdaptiveSizes()
    return bubbles.map((bubble, index) => {
      const baseRadius = calcBubbleRadius(bubble.skillLevel, sizes, bubble)
      const savedPos = this.savedPositions.get(bubble.id)
      
      const node = {
        ...bubble,
        radius: baseRadius,
        baseRadius,
        oscillationPhase: Math.random() * Math.PI * 2,
        targetRadius: baseRadius,
        currentRadius: baseRadius,
        x: savedPos?.x ?? Math.random() * width,
        y: savedPos?.y ?? Math.random() * height,
        vx: savedPos?.vx ?? 0,
        vy: savedPos?.vy ?? 0
      }
      
      return node
    })
  }

  updateBubbleStates(nodes: BubbleNode[], width: number, height: number): void {
    const time = Date.now() * 0.0008

    nodes.forEach((bubble, index) => {
      if (!isWindows()) {
        const oscillation = Math.sin(time * 2 + bubble.oscillationPhase) * 0.05
        bubble.currentRadius = bubble.targetRadius * (1 + oscillation)
      } else {
        bubble.currentRadius = bubble.targetRadius
      }

      const phase = index * 1.3
      const oscillationX = Math.sin(time * 0.4 + phase) * 0.3
      const oscillationY = Math.cos(time * 0.6 + phase) * 0.2
      const randomX = (Math.random() - 0.5) * 0.05
      const randomY = (Math.random() - 0.5) * 0.05

      const oldX = bubble.x
      const oldY = bubble.y

      bubble.x += oscillationX + randomX
      bubble.y += oscillationY + randomY

      if (bubble.vx !== undefined && bubble.vy !== undefined) {
        bubble.x += bubble.vx * 0.1
        bubble.y += bubble.vy * 0.1
        const dampingFactor = 0.92
        bubble.vx *= dampingFactor
        bubble.vy *= dampingFactor
        if (Math.abs(bubble.vx) < 0.01) bubble.vx = 0
        if (Math.abs(bubble.vy) < 0.01) bubble.vy = 0
      }

      const overlap = 30
      const minPadding = 20
      const padding = Math.max(minPadding, bubble.currentRadius - overlap)
      bubble.x = Math.max(padding, Math.min(width - padding, bubble.x))
      bubble.y = Math.max(padding, Math.min(height - padding, bubble.y))

    })
  }

  savePositions(nodes: BubbleNode[]): void {
    nodes.forEach(node => {
      this.savedPositions.set(node.id, {
        x: node.x,
        y: node.y,
        vx: node.vx ?? 0,
        vy: node.vy ?? 0
      })
    })
  }

  removeBubble(bubbleId: number, nodes: BubbleNode[]): BubbleNode[] {
    const index = nodes.findIndex(node => node.id === bubbleId)
    if (index !== -1) {
      const newNodes = [...nodes]
      newNodes.splice(index, 1)
      return newNodes
    }
    return nodes
  }

  findBubbleUnderCursor(mouseX: number, mouseY: number, nodes: BubbleNode[]): BubbleNode | null {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const bubble = nodes[i]
      const dx = mouseX - bubble.x
      const dy = mouseY - bubble.y
      if (Math.sqrt(dx * dx + dy * dy) <= bubble.currentRadius) {
        return bubble
      }
    }
    return null
  }

  clearSavedPositions(): void {
    this.savedPositions.clear()
  }
} 