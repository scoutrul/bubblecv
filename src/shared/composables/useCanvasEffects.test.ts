import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCanvasEffects } from './useCanvasEffects'
import { createCustomBubble } from '../../test/fixtures/bubbles'
import type { SimulationNode } from './types'

vi.mock('./canvasUtils', () => ({
  hexToRgb: vi.fn((hex: string) => ({ r: 255, g: 255, b: 255 }))
}))

const createMockContext = () => ({
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  setLineDash: vi.fn(),
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
})

describe('💥 useCanvasEffects', () => {
  let effects: ReturnType<typeof useCanvasEffects>
  let mockContext: ReturnType<typeof createMockContext>

  const createTestNode = (overrides: Partial<SimulationNode>): SimulationNode => ({
    ...(createCustomBubble({}) as SimulationNode),
    ...overrides,
  })

  beforeEach(() => {
    effects = useCanvasEffects()
    mockContext = createMockContext()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    effects.clearAllEffects()
  })

  describe('Effect Creation', () => {
    it('should create and store an explosion effect', () => {
      effects.createExplosionEffect(100, 100, 50)
      const explosion = effects.getExplosionEffects()[0]
      expect(explosion).toBeDefined()
      expect(explosion.x).toBe(100)
    })

    it('should create and store an XP floating text', () => {
      effects.createXPFloatingText(100, 100, 50)
      const text = effects.getFloatingTexts()[0]
      expect(text).toBeDefined()
      expect(text.text).toContain('+50 XP')
      expect(text.type).toBe('xp')
    })
    
    it('should create and store a life loss floating text', () => {
        effects.createLifeLossFloatingText(100, 100)
        const text = effects.getFloatingTexts()[0]
        expect(text).toBeDefined()
        expect(text.text).toBe('-❤️')
        expect(text.type).toBe('life')
      })
  })
  
  describe('Screen Shake', () => {
      it('should start shake and return offset', () => {
          effects.startShake()
          const offset = effects.calculateShakeOffset()
          expect(offset.x).not.toBe(0)
          expect(offset.y).not.toBe(0)
      })

      it('should stop shake after duration', () => {
          effects.startShake()
          vi.advanceTimersByTime(1000) // advance past duration
          const offset = effects.calculateShakeOffset()
          expect(offset.x).toBe(0)
          expect(offset.y).toBe(0)
      })
  })

  describe('Effect Drawing', () => {
    it('should draw active explosion effects', () => {
      effects.createExplosionEffect(100, 100, 50)
      effects.drawExplosionEffects(mockContext as any)
      expect(mockContext.stroke).toHaveBeenCalledTimes(2) // two rings
      expect(mockContext.fill).toHaveBeenCalledTimes(1) // flash
    })

    it('should draw floating texts and handle different types', () => {
      effects.createXPFloatingText(100, 100, 50)
      effects.createLifeLossFloatingText(200, 200)
      effects.drawFloatingTexts(mockContext as any)
      
      expect(mockContext.fillText).toHaveBeenCalledTimes(2)
      expect(mockContext.strokeText).toHaveBeenCalledTimes(1) // Only for life loss
    })
    
    it('should draw hover effect', () => {
        const node = createTestNode({ x: 100, y: 100 })
        effects.drawHoverEffect(mockContext as any, node)
        expect(mockContext.createRadialGradient).toHaveBeenCalled()
        expect(mockContext.fill).toHaveBeenCalled()
    })
  })
  
  describe('Effect Management', () => {
      it('should explode a bubble', () => {
        // Создаем узел с явными координатами и радиусом
        const node = createTestNode({ 
          x: 100, 
          y: 100, 
          currentRadius: 50,
          isPopped: false 
        })
        
        // Проверяем начальное состояние
        expect(effects.getExplosionEffects().length).toBe(0)
        
        // Вызываем метод
        effects.explodeBubble(node)

        // Проверяем результаты
        expect(node.isPopped).toBe(true)
        
        // Проверяем, что эффект взрыва был создан
        const explosions = effects.getExplosionEffects()
        expect(explosions.length).toBe(1)
        expect(explosions[0].x).toBe(100)
        expect(explosions[0].y).toBe(100)
        expect(explosions[0].maxRadius).toBe(50 * 2)
      })

      it('should clear all effects', () => {
        effects.createExplosionEffect(100, 100, 50)
        effects.createXPFloatingText(100, 100, 50)
        effects.startShake()

        effects.clearAllEffects()

        expect(effects.getExplosionEffects().length).toBe(0)
        expect(effects.getFloatingTexts().length).toBe(0)
        expect(effects.calculateShakeOffset()).toEqual({x: 0, y: 0})
      })
  })
}) 