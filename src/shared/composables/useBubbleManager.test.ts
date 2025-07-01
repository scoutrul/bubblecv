import { describe, it, expect, vi } from 'vitest'
import { useBubbleManager } from './useBubbleManager'
import { mockBubbles } from '../../test/fixtures/bubbles'
import { GAME_CONFIG } from '@shared/config/game-config'
import type { SimulationNode } from './types'

// Мокируем canvasUtils, чтобы контролировать их в тестах
vi.mock('./canvasUtils', () => ({
  calculateAdaptiveSizes: vi.fn(() => ({ min: 50, max: 100 })),
  wrapText: vi.fn(() => ({ lines: ['Test', 'Line'], scaleFactor: 1 })),
  isWindows: vi.fn(() => false)
}))

describe('🫧 useBubbleManager', () => {
  const manager = useBubbleManager()

  // Helper to create a base node for tests
  const createTestNode = (id: string, x: number, y: number, radius: number): SimulationNode => ({
    ...mockBubbles[0],
    id,
    x,
    y,
    currentRadius: radius,
    radius,
    color: '#fff',
    oscillationPhase: 0,
    targetRadius: radius,
    baseRadius: radius,
  })

  describe('createNodes', () => {
    it('should convert raw bubbles to simulation nodes', () => {
      const nodes = manager.createNodes(mockBubbles.slice(0, 2), 800, 600)
      expect(nodes.length).toBe(2)
      expect(nodes[0]).toHaveProperty('x')
      expect(nodes[0]).toHaveProperty('y')
      expect(nodes[0]).toHaveProperty('radius')
      expect(nodes[0]).toHaveProperty('color')
    })

    it('should use saved positions if available', () => {
      // Создаем тестовый пузырь
      const testBubble = mockBubbles[0]
      
      // Напрямую добавляем сохраненную позицию через внутренний метод
      const pos = { x: 123, y: 456, vx: 5, vy: 5 }
      manager.savePositions([{ ...createTestNode(testBubble.id, 0, 0, 0), ...pos }])
      
      // Создаем узлы
      const nodes = manager.createNodes([testBubble], 800, 600)
      
      // Проверяем, что сохраненные позиции были использованы
      expect(nodes[0].x).toBe(123)
      expect(nodes[0].y).toBe(456)
      expect(nodes[0].vx).toBe(5)
      expect(nodes[0].vy).toBe(5)
    })

    it('should handle fallback for unknown skill levels', () => {
        const bubbleWithUnknownSkill = [{ ...mockBubbles[0], skillLevel: 'unknown' }]
        const nodes = manager.createNodes(bubbleWithUnknownSkill as any, 800, 600)
        
        const defaultConfig = GAME_CONFIG.expertiseLevels.intermediate
        expect(nodes[0].color).toBe(defaultConfig.color)
    })
  })

  describe('updateBubbleStates', () => {
    it('should update bubble radius for oscillation effect', () => {
      const nodes = [createTestNode('node1', 100, 100, 50)]
      const originalRadius = nodes[0].currentRadius
      
      manager.updateBubbleStates(nodes, 800, 600)
      
      expect(nodes[0].currentRadius).not.toBe(originalRadius)
    })

    it('should not oscillate on Windows', async () => {
      const { isWindows } = vi.mocked(await import('./canvasUtils'))
      isWindows.mockReturnValue(true)

      const nodes = [createTestNode('node1', 100, 100, 50)]
      const originalRadius = nodes[0].currentRadius

      manager.updateBubbleStates(nodes, 800, 600)
      expect(nodes[0].currentRadius).toBe(originalRadius)

      isWindows.mockReturnValue(false) // Reset mock
    })

    it('should keep bubbles within boundaries', () => {
      const nodes = [createTestNode('node1', -100, -100, 50)]
      manager.updateBubbleStates(nodes, 800, 600)
      expect(nodes[0].x).toBeGreaterThanOrEqual(20) // 50 (radius) - 30 (overlap)
      expect(nodes[0].y).toBeGreaterThanOrEqual(20)
    })
  })

  describe('findBubbleUnderCursor', () => {
    const nodes = [
      createTestNode('node1', 100, 100, 50),
      createTestNode('node2', 120, 120, 40) // Overlaps with node1
    ]

    it('should find a bubble under the cursor', () => {
      const found = manager.findBubbleUnderCursor(105, 105, nodes)
      expect(found).not.toBeNull()
      expect(found?.id).toBe('node2')
    })
    
    it('should return the top-most bubble if overlapping', () => {
        // 125, 125 is inside both node1 and node2
        const found = manager.findBubbleUnderCursor(125, 125, nodes)
        expect(found).not.toBeNull()
        expect(found?.id).toBe('node2') // node2 is last in array, so it's "on top"
    })

    it('should return null if no bubble is under the cursor', () => {
      const found = manager.findBubbleUnderCursor(500, 500, nodes)
      expect(found).toBeNull()
    })
  })

  describe('removeBubble', () => {
    it('should remove a bubble by its ID', () => {
      const nodes = [createTestNode('node1', 0, 0, 0), createTestNode('node2', 0, 0, 0)]
      const newNodes = manager.removeBubble('node1', nodes)
      expect(newNodes.length).toBe(1)
      expect(newNodes[0].id).toBe('node2')
    })

    it('should not change the array if bubble ID is not found', () => {
      const nodes = [createTestNode('node1', 0, 0, 0)]
      const newNodes = manager.removeBubble('nonexistent', nodes)
      expect(newNodes.length).toBe(1)
      expect(newNodes).toEqual(nodes)
    })
  })
}) 