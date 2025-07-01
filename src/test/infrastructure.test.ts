import { describe, it, expect, vi } from 'vitest'
import { createTestPinia, getStoreSnapshot } from './helpers/pinia-helpers'
import { createMockCanvasElement, createMockCanvas2DContext } from './helpers/canvas-helpers'
import { createGSAPMock } from './helpers/gsap-helpers'
import { server, http, HttpResponse } from './mocks/server'

describe('🧪 Тестовая инфраструктура', () => {
  describe('Pinia Testing', () => {
    it('должен создавать тестовый Pinia instance', () => {
      const pinia = createTestPinia()
      expect(pinia).toBeDefined()
    })

    it('должен создавать snapshot состояния', () => {
      const mockStore = {
        $state: { count: 0, name: 'test' },
        increment: vi.fn(),
        getName: 'test'
      }
      
      const snapshot = getStoreSnapshot(mockStore)
      expect(snapshot.state).toEqual({ count: 0, name: 'test' })
      expect(snapshot.actions).toContain('increment')
    })
  })

  describe('Canvas Mocking', () => {
    it('должен создавать мок Canvas element', () => {
      const canvas = createMockCanvasElement(800, 600)
      expect(canvas.width).toBe(800)
      expect(canvas.height).toBe(600)
      expect(canvas.getContext).toBeDefined()
    })

    it('должен создавать мок Canvas 2D context', () => {
      const context = createMockCanvas2DContext()
      expect(context.fillRect).toBeDefined()
      expect(context.clearRect).toBeDefined()
      expect(context.arc).toBeDefined()
      expect(typeof context.fillStyle).toBe('string')
    })

    it('должен отслеживать вызовы Canvas методов', () => {
      const context = createMockCanvas2DContext()
      
      context.fillRect(10, 10, 50, 50)
      expect(context.fillRect).toHaveBeenCalledWith(10, 10, 50, 50)
      expect(context.fillRect).toHaveBeenCalledTimes(1)
    })
  })

  describe('GSAP Mocking', () => {
    it('должен создавать мок GSAP', () => {
      const gsapMock = createGSAPMock()
      expect(gsapMock.to).toBeDefined()
      expect(gsapMock.from).toBeDefined()
      expect(gsapMock.timeline).toBeDefined()
      expect(gsapMock.utils).toBeDefined()
    })

    it('должен отслеживать GSAP анимации', () => {
      const gsapMock = createGSAPMock()
      const target = { x: 0, y: 0 }
      
      gsapMock.to(target, { x: 100, duration: 1 })
      
      const animations = gsapMock.getAllAnimations()
      expect(animations).toHaveLength(1)
      expect(animations[0].target).toBe(target)
      expect(animations[0].options.x).toBe(100)
    })
  })

  describe('MSW API Mocking', () => {
    it('должен мокировать API endpoints', async () => {
      // Тестируем что MSW server запущен и работает
      const response = await fetch('/api/bubbles')
      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('должен обрабатывать кастомные handlers', async () => {
      // Создаем кастомный handler для теста
      server.use(
        http.get('/api/test', () => {
          return HttpResponse.json({ message: 'Custom test handler' })
        })
      )

      const response = await fetch('/api/test')
      const data = await response.json()
      
      expect(data.message).toBe('Custom test handler')
    })
  })

  describe('Global Mocks', () => {
    it('должен мокировать requestAnimationFrame', () => {
      const callback = vi.fn()
      requestAnimationFrame(callback)
      
      expect(callback).toHaveBeenCalled()
    })

    it('должен мокировать window размеры', () => {
      expect(window.innerWidth).toBe(1024)
      expect(window.innerHeight).toBe(768)
    })

    it('должен мокировать getBoundingClientRect', () => {
      const element = document.createElement('div')
      const rect = element.getBoundingClientRect()
      
      expect(rect.width).toBe(800)
      expect(rect.height).toBe(600)
      expect(rect.top).toBe(0)
      expect(rect.left).toBe(0)
    })
  })

  describe('Test Fixtures', () => {
    it('должен загружать фикстуры пузырей', async () => {
      const { mockBubbles } = await import('./fixtures/bubbles')
      expect(Array.isArray(mockBubbles)).toBe(true)
      expect(mockBubbles.length).toBeGreaterThan(0)
      expect(mockBubbles[0]).toHaveProperty('id')
      expect(mockBubbles[0]).toHaveProperty('name')
    })

    it('должен загружать фикстуры философских вопросов', async () => {
      const { mockPhilosophyQuestions } = await import('./fixtures/philosophy-questions')
      expect(Array.isArray(mockPhilosophyQuestions)).toBe(true)
      expect(mockPhilosophyQuestions.length).toBeGreaterThan(0)
      expect(mockPhilosophyQuestions[0]).toHaveProperty('question')
      expect(mockPhilosophyQuestions[0]).toHaveProperty('options')
    })

    it('должен загружать фикстуры достижений', async () => {
      const { mockAchievements } = await import('./fixtures/achievements')
      expect(Array.isArray(mockAchievements)).toBe(true)
      expect(mockAchievements.length).toBeGreaterThan(0)
      expect(mockAchievements[0]).toHaveProperty('name')
      expect(mockAchievements[0]).toHaveProperty('points')
    })
  })
}) 