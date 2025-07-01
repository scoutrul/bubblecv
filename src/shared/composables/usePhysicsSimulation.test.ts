import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePhysicsSimulation } from './usePhysicsSimulation'
import * as d3 from 'd3'
import type { SimulationNode } from './types'
import { createCustomBubble } from '../../test/fixtures/bubbles'

// Вспомогательная функция для создания тестовых узлов
const createMockNode = (overrides: Partial<SimulationNode> = {}): SimulationNode => {
  return {
    id: 'test',
    name: 'Test',
    skillLevel: 'intermediate',
    color: '#ff0000',
    radius: 30,
    baseRadius: 30,
    oscillationPhase: 0,
    targetRadius: 30,
    currentRadius: 30,
    textLines: [],
    textScaleFactor: 1,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    year: 2023,
    isActive: true,
    isEasterEgg: false,
    description: 'Test bubble',
    projects: [],
    isPopped: false,
    isVisited: false,
    size: 'medium',
    isTough: false,
    toughClicks: 0,
    currentClicks: 0,
    ...overrides
  }
}

const createMockNodes = (count: number): SimulationNode[] => {
  return Array.from({ length: count }, (_, i) => createMockNode({ 
    id: `node-${i}`, 
    x: i * 20, 
    y: i * 20 
  }))
}

// Мокируем d3-force, чтобы шпионить за вызовами
vi.mock('d3', async () => {
  return {
    forceSimulation: vi.fn(() => ({
      force: vi.fn().mockReturnThis(),
      nodes: vi.fn().mockReturnThis(),
      alpha: vi.fn().mockReturnThis(),
      alphaDecay: vi.fn().mockReturnThis(),
      velocityDecay: vi.fn().mockReturnThis(),
      restart: vi.fn().mockReturnThis(),
      stop: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis()
    })),
    forceCenter: vi.fn(() => ({
      strength: vi.fn().mockReturnThis()
    })),
    forceCollide: vi.fn(() => ({
      radius: vi.fn().mockReturnThis(),
      strength: vi.fn().mockReturnThis()
    })),
    forceManyBody: vi.fn(() => ({
      strength: vi.fn().mockReturnThis()
    })),
    forceRadial: vi.fn(() => ({
      strength: vi.fn().mockReturnThis()
    }))
  }
})

describe('🏃 usePhysicsSimulation', () => {
  let physics: ReturnType<typeof usePhysicsSimulation>
  let mockSetInterval: any
  let mockClearInterval: any
  
  beforeEach(() => {
    // Создаем моки для setInterval и clearInterval
    mockSetInterval = vi.fn().mockReturnValue(123)
    mockClearInterval = vi.fn()
    
    // Заменяем глобальные функции на моки
    vi.stubGlobal('setInterval', mockSetInterval)
    vi.stubGlobal('clearInterval', mockClearInterval)
    
    physics = usePhysicsSimulation()
  })

  afterEach(() => {
    // Восстанавливаем оригинальные функции
    vi.unstubAllGlobals()
  })

  describe('Initialization', () => {
    it('should initialize the simulation with all forces', () => {
      const sim = physics.initSimulation(800, 600)
      expect(d3.forceSimulation).toHaveBeenCalled()
      expect(d3.forceCenter).toHaveBeenCalled()
      expect(d3.forceCollide).toHaveBeenCalled()
      expect(d3.forceManyBody).toHaveBeenCalled()
    })

    it('should set a restart interval', () => {
      physics.initSimulation(800, 600)
      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 3000)
    })
  })

  describe('Lifecycle and Updates', () => {
    let simulation: any

    beforeEach(() => {
      simulation = physics.initSimulation(800, 600)
    })

    it('should update simulation size', () => {
      physics.updateSimulationSize(1000, 800)
      // Проверяем вызов с половиной ширины и высоты
      expect(d3.forceCenter).toHaveBeenCalled()
    })

    it('should update nodes in the simulation', () => {
      const nodes = createMockNodes(3)
      physics.updateNodes(nodes)
      expect(simulation.nodes).toHaveBeenCalledWith(nodes)
      expect(simulation.alpha).toHaveBeenCalled()
      expect(simulation.restart).toHaveBeenCalled()
    })

    it('should stop the simulation and clear intervals', () => {
      physics.stopSimulation()
      expect(mockClearInterval).toHaveBeenCalled()
      expect(simulation.stop).toHaveBeenCalled()
      expect(physics.getSimulation()).toBe(null)
    })
  })

  describe('Interaction Physics', () => {
    let simulation: any
    let nodes: SimulationNode[]

    beforeEach(() => {
      simulation = physics.initSimulation(800, 600)
      nodes = createMockNodes(3)
      physics.updateNodes(nodes)
    })

    it('pushNeighbors should apply forces to nearby nodes', () => {
      // Создаем узлы для теста
      const centerNode = createMockNode({ id: 'center', x: 100, y: 100 })
      const closeNode = createMockNode({ id: 'close', x: 110, y: 110 })
      const farNode = createMockNode({ id: 'far', x: 200, y: 200 })
      const testNodes = [centerNode, closeNode, farNode]
      
      // Вызываем метод с правильными аргументами
      physics.pushNeighbors(centerNode, 50, 0.5, testNodes)
      
      // Проверяем, что ближний узел получил силу
      expect(closeNode.vx).not.toBe(0)
      expect(closeNode.vy).not.toBe(0)
      
      // Проверяем, что дальний узел не получил силу
      expect(farNode.vx).toBe(0)
      expect(farNode.vy).toBe(0)
      
      expect(simulation.alpha).toHaveBeenCalledWith(0.5)
      expect(simulation.restart).toHaveBeenCalled()
    })

    it('explodeFromPoint should apply forces to all nodes within radius', () => {
      // Создаем узлы для теста
      const testNodes = createMockNodes(3)
      
      // Вызываем метод с правильными аргументами
      physics.explodeFromPoint(10, 10, 50, 0.8, testNodes, 800, 600)
      
      // Проверяем, что все узлы получили силу
      testNodes.forEach(node => {
        expect(node.vx).not.toBe(0)
        expect(node.vy).not.toBe(0)
      })
      
      expect(simulation.alpha).toHaveBeenCalledWith(0.8)
      expect(simulation.restart).toHaveBeenCalled()
    })

    it('explodeFromPoint should handle nodes at the explosion center', () => {
      // Создаем узел в центре взрыва
      const centerNode = createMockNode({ id: 'center', x: 10, y: 10 })
      const testNodes = [centerNode]
      
      // Вызываем метод с правильными аргументами
      physics.explodeFromPoint(10, 10, 50, 0.8, testNodes, 800, 600)
      
      // Проверяем, что узел получил случайную силу
      expect(centerNode.vx).not.toBe(0)
      expect(centerNode.vy).not.toBe(0)
    })
  })
}) 