import type { BubbleManagerRepository as IBubbleManagerRepository } from './types'
import type { BubbleNode, PositionData } from '@/types/canvas'
import { isWindows } from '@/utils/ui'
import { calculateAdaptiveSizes, calcBubbleRadius } from '@/utils/bubble'
import { GAME_CONFIG } from '@/config'

export class BubbleManagerRepository implements IBubbleManagerRepository {
  private savedPositions = new Map<number, PositionData>()

  createNodes(bubbles: BubbleNode[], width: number, height: number): BubbleNode[] {
    const sizes = calculateAdaptiveSizes()
    const nodes: BubbleNode[] = []
    
    bubbles.forEach((bubble, index) => {
      const baseRadius = calcBubbleRadius(bubble.skillLevel, sizes, bubble)
      const savedPos = this.savedPositions.get(bubble.id)
      
      let x: number, y: number
      
      if (savedPos?.x !== undefined && savedPos?.y !== undefined) {
        // Используем сохраненную позицию
        x = savedPos.x
        y = savedPos.y
      } else {
        // Генерируем новую позицию с учетом размера баббла
        const position = this.findNonOverlappingPosition(nodes, baseRadius, width, height)
        x = position.x
        y = position.y
      }
      
      const node = {
        ...bubble,
        radius: baseRadius,
        baseRadius,
        oscillationPhase: Math.random() * Math.PI * 2,
        targetRadius: baseRadius,
        currentRadius: baseRadius,
        x,
        y,
        vx: savedPos?.vx ?? 0,
        vy: savedPos?.vy ?? 0
      }
      
      nodes.push(node)
    })
    
    return nodes
  }

  // Функция для поиска позиции без наложений
  private findNonOverlappingPosition(existingNodes: BubbleNode[], radius: number, width: number, height: number): { x: number, y: number } {
    const maxAttempts = 100
    const minDistance = radius * 2.5 // Минимальное расстояние между центрами бабблов
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Генерируем случайную позицию с отступами от краев
      const padding = radius + 20
      const x = padding + Math.random() * (width - 2 * padding)
      const y = padding + Math.random() * (height - 2 * padding)
      
      // Проверяем, не накладывается ли на существующие бабблы
      let hasOverlap = false
      for (const existingNode of existingNodes) {
        const dx = x - existingNode.x
        const dy = y - existingNode.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < minDistance) {
          hasOverlap = true
          break
        }
      }
      
      if (!hasOverlap) {
        return { x, y }
      }
    }
    
    // Если не удалось найти позицию без наложений, возвращаем случайную с большим отступом
    const padding = radius + 50
    return {
      x: padding + Math.random() * (width - 2 * padding),
      y: padding + Math.random() * (height - 2 * padding)
    }
  }

  async updateBubbleStates(nodes: BubbleNode[], width: number, height: number, level: number = 1): Promise<void> {
    const time = Date.now() * 0.0008
    const canvasCenter = { x: width / 2, y: height / 2 }
    
    // Получаем параметры физики для текущего уровня
    const { PHYSICS_CALCULATOR } = await import('@/config')
    const physics = PHYSICS_CALCULATOR.getBubblePhysics(level)

    nodes.forEach((bubble, index) => {
      // Проверяем, что у баббла есть необходимые свойства
      if (!bubble || typeof bubble.x !== 'number' || typeof bubble.y !== 'number') {
        return
      }
      
      if (!isWindows()) {
        const oscillation = Math.sin(time * 2 + (bubble.oscillationPhase || 0)) * 0.05
        bubble.currentRadius = (bubble.targetRadius || bubble.baseRadius || 20) * (1 + oscillation)
      } else {
        bubble.currentRadius = bubble.targetRadius || bubble.baseRadius || 20
      }

      // Существующее колебательное движение
      const phase = index * 1.3
      const oscillationX = Math.sin(time * 0.4 + phase) * physics.oscillationStrength
      const oscillationY = Math.cos(time * 0.6 + phase) * physics.oscillationStrength * 0.67
      const randomX = (Math.random() - 0.5) * physics.randomStrength
      const randomY = (Math.random() - 0.5) * physics.randomStrength

      // Гравитационная сила к центру
      const dx = canvasCenter.x - bubble.x
      const dy = canvasCenter.y - bubble.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const gravityX = (dx / distance) * physics.gravityStrength * distance
      const gravityY = (dy / distance) * physics.gravityStrength * distance

      // Круговое движение (воронка)
      const vortexRadius = Math.sqrt(dx * dx + dy * dy)
      const vortexAngle = Math.atan2(dy, dx) + Math.PI / 2 // Перпендикулярно радиусу
      const vortexX = Math.cos(vortexAngle) * physics.vortexStrength * vortexRadius
      const vortexY = Math.sin(vortexAngle) * physics.vortexStrength * vortexRadius

      // Применяем все силы к позиции
      bubble.x += oscillationX + randomX + gravityX + vortexX
      bubble.y += oscillationY + randomY + gravityY + vortexY

      // Применяем существующую скорость от отталкивания
      if (bubble.vx !== undefined && bubble.vy !== undefined) {
        bubble.x += bubble.vx * physics.velocityMultiplier
        bubble.y += bubble.vy * physics.velocityMultiplier
        bubble.vx *= physics.dampingFactor
        bubble.vy *= physics.dampingFactor
        if (Math.abs(bubble.vx) < 0.01) bubble.vx = 0
        if (Math.abs(bubble.vy) < 0.01) bubble.vy = 0
      }

      // Ограничиваем позицию в пределах Canvas с учетом размера баббла
      const padding = Math.max(bubble.currentRadius + 10, 50)
      bubble.x = Math.max(padding, Math.min(width - padding, bubble.x))
      bubble.y = Math.max(padding, Math.min(height - padding, bubble.y))
      
      // Дополнительная проверка на наложения с другими бабблами
      for (let i = 0; i < nodes.length; i++) {
        const otherBubble = nodes[i]
        if (otherBubble.id === bubble.id) continue
        
        const dx = bubble.x - otherBubble.x
        const dy = bubble.y - otherBubble.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = bubble.currentRadius + otherBubble.currentRadius + 5
        
        if (distance < minDistance && distance > 0) {
          // Отталкиваем бабблы друг от друга
          const pushForce = (minDistance - distance) / distance
          const pushX = dx * pushForce * 0.5
          const pushY = dy * pushForce * 0.5
          
          bubble.x += pushX
          bubble.y += pushY
          otherBubble.x -= pushX
          otherBubble.y -= pushY
        }
      }
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
      if (!bubble || typeof bubble.x !== 'number' || typeof bubble.y !== 'number' || !bubble.currentRadius) {
        continue
      }
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