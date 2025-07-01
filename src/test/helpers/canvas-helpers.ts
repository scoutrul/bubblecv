import { vi, expect } from 'vitest'

/**
 * Создает расширенный мок Canvas 2D context с отслеживанием вызовов
 */
export function createMockCanvas2DContext() {
  const context = {
    // Рендеринг методы
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    rect: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    
    // Пути
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    
    // Трансформации
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    
    // Стили
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    lineDashOffset: 0,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    direction: 'ltr',
    
    // Текст
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn((text: string) => ({ 
      width: text.length * 6, // Простая аппроксимация
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: text.length * 6,
      actualBoundingBoxAscent: 8,
      actualBoundingBoxDescent: 2,
    })),
    
    // Изображения
    drawImage: vi.fn(),
    createImageData: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    })),
    putImageData: vi.fn(),
    
    // Градиенты и паттерны
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createPattern: vi.fn(),
    
    // Композиция
    globalAlpha: 1.0,
    globalCompositeOperation: 'source-over',
    
    // Тени
    shadowBlur: 0,
    shadowColor: 'rgba(0, 0, 0, 0)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    
    // Line dash
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    
    // Дополнительные методы
    isPointInPath: vi.fn(() => false),
    isPointInStroke: vi.fn(() => false),
  }
  
  return context
}

/**
 * Создает мок HTMLCanvasElement
 */
export function createMockCanvasElement(width = 800, height = 600) {
  const canvas = {
    width,
    height,
    clientWidth: width,
    clientHeight: height,
    offsetWidth: width,
    offsetHeight: height,
    getBoundingClientRect: vi.fn(() => ({
      x: 0,
      y: 0,
      width,
      height,
      top: 0,
      right: width,
      bottom: height,
      left: 0,
      toJSON: vi.fn(),
    })),
    getContext: vi.fn(() => createMockCanvas2DContext()),
    toDataURL: vi.fn(() => 'data:image/png;base64,'),
    toBlob: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    style: {},
  }
  
  return canvas
}

/**
 * Утилита для создания мока Canvas в DOM
 */
export function mockCanvasInDOM() {
  const originalCreateElement = document.createElement
  
  document.createElement = vi.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return createMockCanvasElement() as any
    }
    return originalCreateElement.call(document, tagName)
  })
  
  return () => {
    document.createElement = originalCreateElement
  }
}

/**
 * Хелпер для проверки вызовов рендеринга
 */
export function expectCanvasDrawCall(context: any, method: string, ...args: any[]) {
  expect(context[method]).toHaveBeenCalledWith(...args)
}

/**
 * Хелпер для проверки последовательности Canvas операций
 */
export function expectCanvasSequence(context: any, operations: Array<{ method: string, args?: any[] }>) {
  operations.forEach((op, index) => {
    const calls = context[op.method].mock.calls
    expect(calls.length).toBeGreaterThan(index)
    if (op.args) {
      expect(calls[index]).toEqual(op.args)
    }
  })
}

/**
 * Утилита для симуляции Canvas событий
 */
export function simulateCanvasEvent(canvas: any, eventType: string, options: any = {}) {
  const event = {
    type: eventType,
    clientX: options.x || 0,
    clientY: options.y || 0,
    offsetX: options.x || 0,
    offsetY: options.y || 0,
    button: options.button || 0,
    buttons: options.buttons || 1,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...options,
  }
  
  const handlers = canvas._eventHandlers?.[eventType] || []
  handlers.forEach((handler: Function) => handler(event))
  
  return event
}

/**
 * Хелпер для отслеживания Canvas событий
 */
export function trackCanvasEvents(canvas: any) {
  const events: any[] = []
  
  const originalAddEventListener = canvas.addEventListener
  canvas.addEventListener = vi.fn((type: string, handler: Function) => {
    if (!canvas._eventHandlers) canvas._eventHandlers = {}
    if (!canvas._eventHandlers[type]) canvas._eventHandlers[type] = []
    canvas._eventHandlers[type].push(handler)
    
    events.push({ type: 'addEventListener', eventType: type })
    return originalAddEventListener?.call(canvas, type, handler)
  })
  
  return {
    events,
    getEventCount: (eventType: string) => 
      events.filter(e => e.type === 'addEventListener' && e.eventType === eventType).length,
    hasEvent: (eventType: string) => 
      events.some(e => e.type === 'addEventListener' && e.eventType === eventType),
  }
}

/**
 * Утилита для симуляции resizing Canvas
 */
export function simulateCanvasResize(canvas: any, newWidth: number, newHeight: number) {
  canvas.width = newWidth
  canvas.height = newHeight
  canvas.clientWidth = newWidth
  canvas.clientHeight = newHeight
  canvas.offsetWidth = newWidth
  canvas.offsetHeight = newHeight
  
  // Обновляем getBoundingClientRect
  canvas.getBoundingClientRect = vi.fn(() => ({
    x: 0,
    y: 0,
    width: newWidth,
    height: newHeight,
    top: 0,
    right: newWidth,
    bottom: newHeight,
    left: 0,
    toJSON: vi.fn(),
  }))
  
  // Симулируем resize event
  simulateCanvasEvent(canvas, 'resize', { width: newWidth, height: newHeight })
}

/**
 * Snapshot утилита для Canvas state
 */
export function getCanvasSnapshot(context: any) {
  return {
    fillStyle: context.fillStyle,
    strokeStyle: context.strokeStyle,
    lineWidth: context.lineWidth,
    font: context.font,
    globalAlpha: context.globalAlpha,
    globalCompositeOperation: context.globalCompositeOperation,
    // Добавляем счетчики вызовов методов
    methodCalls: {
      fillRect: context.fillRect.mock.calls.length,
      strokeRect: context.strokeRect.mock.calls.length,
      clearRect: context.clearRect.mock.calls.length,
      drawImage: context.drawImage.mock.calls.length,
      fillText: context.fillText.mock.calls.length,
      arc: context.arc.mock.calls.length,
    }
  }
} 