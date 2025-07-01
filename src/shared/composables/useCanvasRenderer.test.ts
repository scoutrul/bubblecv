import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useCanvasRenderer } from './useCanvasRenderer'
import { createCustomBubble } from '../../test/fixtures/bubbles'
import type { SimulationNode } from './types'

// Глобальный мок для GSAP
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn()
  }
}))

// Создаем полный мок для CanvasRenderingContext2D
const createMockContext = () => {
  const mockGradient = {
    addColorStop: vi.fn(),
  }
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    clearRect: vi.fn(),
    translate: vi.fn(),
    createRadialGradient: vi.fn(() => mockGradient),
    fillStyle: '',
    globalAlpha: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  }
}

describe('🎨 useCanvasRenderer', () => {
  const createTestNode = (overrides: Partial<SimulationNode>): SimulationNode => ({
    ...(createCustomBubble({}) as SimulationNode),
    x: 100,
    y: 100,
    radius: 50,
    currentRadius: 50,
    baseRadius: 50,
    color: '#fff',
    textLines: ['Test'],
    ...overrides,
  })

  it('should execute the full render pipeline in order', () => {
    const mockContext = createMockContext()
    const canvasRef = ref(document.createElement('canvas'))
    vi.spyOn(canvasRef.value, 'getContext').mockReturnValue(mockContext as any)
    
    const renderer = useCanvasRenderer(canvasRef)
    const nodes = [
      createTestNode({ id: 'node1' }),
      createTestNode({ id: 'node2', isEasterEgg: true })
    ]
    const drawFloatingTexts = vi.fn()

    renderer.initStarfield(800, 600)
    renderer.render(
      nodes, 800, 600,
      { x: 5, y: 5 }, { x: 10, y: 10 },
      drawFloatingTexts
    )

    // 1. Clear rect
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600)
    
    // 2. Main translate for shake
    expect(mockContext.translate).toHaveBeenCalledWith(5, 5)

    // 3. Starfield is drawn (we check for its translate call and arc calls)
    expect(mockContext.translate).toHaveBeenCalledWith(10, 10)
    
    // 4. Bubbles and stars are drawn
    expect(mockContext.arc).toHaveBeenCalledTimes(100 + 2) // 70 bg, 30 fg stars + 2 bubbles

    // 5. Text is drawn only for the non-easter-egg bubble
    expect(mockContext.fillText).toHaveBeenCalledTimes(1)

    // 6. Floating texts callback is invoked
    expect(drawFloatingTexts).toHaveBeenCalledWith(mockContext)
  })
}) 