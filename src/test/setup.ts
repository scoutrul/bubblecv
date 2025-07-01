import { beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Setup Pinia для каждого теста
beforeEach(() => {
  setActivePinia(createPinia())
})

// Мокирование Canvas API (расширенное)
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  })),
})

// Мокирование Canvas element свойств
Object.defineProperty(HTMLCanvasElement.prototype, 'clientWidth', {
  value: 800,
  writable: true
})

Object.defineProperty(HTMLCanvasElement.prototype, 'clientHeight', {
  value: 600,
  writable: true
})

Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  value: 800,
  writable: true
})

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  value: 600,
  writable: true
})

// Мокирование GSAP для unit тестов
vi.mock('gsap', () => ({
  gsap: {
    // Основные методы GSAP с instant completion
    to: vi.fn((target, options) => ({
      kill: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
      reverse: vi.fn(),
      restart: vi.fn(),
      progress: vi.fn(() => 1),
      duration: vi.fn(() => options.duration || 1),
      // Мгновенно применяем финальные значения для unit тестов
      then: vi.fn((callback) => {
        if (typeof callback === 'function') {
          callback()
        }
        return Promise.resolve()
      })
    })),
    from: vi.fn((target, options) => ({
      kill: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
      reverse: vi.fn(),
      restart: vi.fn(),
    })),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn(),
      from: vi.fn(),
      set: vi.fn(),
      add: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
      kill: vi.fn(),
      progress: vi.fn(() => 1),
    })),
    registerPlugin: vi.fn(),
    // Утилиты
    utils: {
      random: vi.fn((min, max) => (min + max) / 2), // Предсказуемые значения для тестов
      clamp: vi.fn((value, min, max) => Math.max(min, Math.min(max, value))),
      mapRange: vi.fn((inputMin, inputMax, outputMin, outputMax, value) => 
        outputMin + (outputMax - outputMin) * ((value - inputMin) / (inputMax - inputMin))
      ),
    },
  },
  // Экспорт плагинов если они используются
  ScrollTrigger: {
    create: vi.fn(),
    refresh: vi.fn(),
    kill: vi.fn(),
  }
}))

// Мокирование requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  callback(0)
  return 0
})

global.cancelAnimationFrame = vi.fn()

// Мокирование резайза окна
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
})

// Мокирование getBoundingClientRect для DOM элементов
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  top: 0,
  right: 800,
  bottom: 600,
  left: 0,
  toJSON: vi.fn(),
}))

// Настройка MSW server для API мокирования
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// Консольные предупреждения для dev режима
console.log('🧪 Test environment setup completed')
console.log('📦 Mocks enabled: Canvas, GSAP, requestAnimationFrame')
console.log('🏪 Pinia testing environment ready')
console.log('🌐 MSW API mocking server configured') 