import { vi, expect } from 'vitest'

/**
 * Создает расширенный мок GSAP с отслеживанием анимаций
 */
export function createGSAPMock() {
  const animations: any[] = []
  const timelines: any[] = []
  
  const gsapMock = {
    to: vi.fn((target, options) => {
      const animation: any = {
        target,
        options,
        id: `anim_${animations.length}`,
        isActive: true,
        currentProgress: 0,
        animDuration: options.duration || 1,
        kill: vi.fn(() => {
          animation.isActive = false
        }),
        pause: vi.fn(),
        play: vi.fn(),
        reverse: vi.fn(),
        restart: vi.fn(),
        progress: vi.fn((value?: number) => {
          if (value !== undefined) {
            animation.currentProgress = value
            // Мгновенно применяем финальные значения
            if (value === 1 && options.onComplete) {
              options.onComplete()
            }
          }
          return animation.currentProgress
        }),
        duration: vi.fn(() => animation.animDuration),
        then: vi.fn((callback) => {
          if (typeof callback === 'function') {
            callback()
          }
          return Promise.resolve()
        })
      }
      
      animations.push(animation)
      
      // Мгновенно выполняем анимацию для unit тестов
      if (options.onComplete) {
        setTimeout(options.onComplete, 0)
      }
      
      return animation
    }),
    
    from: vi.fn((target, options) => {
      const animation = {
        target,
        options,
        id: `from_anim_${animations.length}`,
        isActive: true,
        kill: vi.fn(),
        pause: vi.fn(),
        play: vi.fn(),
        reverse: vi.fn(),
        restart: vi.fn(),
      }
      
      animations.push(animation)
      
      if (options.onComplete) {
        setTimeout(options.onComplete, 0)
      }
      
      return animation
    }),
    
    set: vi.fn((target, options) => {
      // Мгновенно применяем стили
      if (target && typeof target === 'object') {
        Object.assign(target, options)
      }
      return { target, options }
    }),
    
    timeline: vi.fn((options = {}) => {
      const timeline: any = {
        id: `timeline_${timelines.length}`,
        options,
        animations: [],
        to: vi.fn((target, options) => {
          const anim = gsapMock.to(target, options)
          timeline.animations.push(anim)
          return timeline
        }),
        from: vi.fn((target, options) => {
          const anim = gsapMock.from(target, options)
          timeline.animations.push(anim)
          return timeline
        }),
        set: vi.fn((target, options) => {
          gsapMock.set(target, options)
          return timeline
        }),
        add: vi.fn((callback) => {
          if (typeof callback === 'function') {
            callback()
          }
          return timeline
        }),
        pause: vi.fn(),
        play: vi.fn(),
        kill: vi.fn(() => {
          timeline.animations.forEach((anim: any) => anim.kill())
        }),
        progress: vi.fn(() => 1),
        duration: vi.fn(() => options.duration || 1),
      }
      
      timelines.push(timeline)
      return timeline
    }),
    
    registerPlugin: vi.fn(),
    
    utils: {
      random: vi.fn((min, max) => {
        if (max === undefined) {
          return Math.random() * min
        }
        return min + Math.random() * (max - min)
      }),
      clamp: vi.fn((value, min, max) => Math.max(min, Math.min(max, value))),
      mapRange: vi.fn((inputMin, inputMax, outputMin, outputMax, value) => 
        outputMin + (outputMax - outputMin) * ((value - inputMin) / (inputMax - inputMin))
      ),
      normalize: vi.fn((value, min, max) => (value - min) / (max - min)),
      interpolate: vi.fn((start, end, progress) => start + (end - start) * progress),
    },
    
    // Глобальные методы
    killTweensOf: vi.fn(),
    globalTimeline: {
      pause: vi.fn(),
      play: vi.fn(),
      clear: vi.fn(),
    },
    
    // Getters для тестирования
    getActiveAnimations: () => animations.filter(a => a.isActive),
    getAllAnimations: () => animations,
    getTimelines: () => timelines,
    clearAllAnimations: () => {
      animations.length = 0
      timelines.length = 0
    }
  }
  
  return gsapMock
}

/**
 * Мок для ScrollTrigger плагина
 */
export function createScrollTriggerMock() {
  const triggers: any[] = []
  
  return {
    create: vi.fn((options) => {
      const trigger = {
        options,
        id: `trigger_${triggers.length}`,
        kill: vi.fn(),
        refresh: vi.fn(),
        update: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
      }
      
      triggers.push(trigger)
      return trigger
    }),
    
    refresh: vi.fn(),
    kill: vi.fn((trigger?) => {
      if (trigger) {
        const index = triggers.indexOf(trigger)
        if (index > -1) triggers.splice(index, 1)
      } else {
        triggers.length = 0
      }
    }),
    
    getById: vi.fn((id) => triggers.find(t => t.id === id)),
    getAll: vi.fn(() => triggers),
    
    // Утилитные методы для тестирования
    getTriggers: () => triggers,
    clearAllTriggers: () => {
      triggers.length = 0
    }
  }
}

/**
 * Утилита для предустановки GSAP моков
 */
export function setupGSAPMocks() {
  const gsapMock = createGSAPMock()
  const scrollTriggerMock = createScrollTriggerMock()
  
  vi.doMock('gsap', () => ({
    gsap: gsapMock,
    ScrollTrigger: scrollTriggerMock,
    default: gsapMock,
  }))
  
  return { gsapMock, scrollTriggerMock }
}

/**
 * Хелпер для проверки что анимация была создана
 */
export function expectAnimationCreated(gsapMock: any, target: any, expectedOptions?: any) {
  const animations = gsapMock.getAllAnimations()
  const targetAnimations = animations.filter((anim: any) => anim.target === target)
  
  expect(targetAnimations.length).toBeGreaterThan(0)
  
  if (expectedOptions) {
    const lastAnimation = targetAnimations[targetAnimations.length - 1]
    expect(lastAnimation.options).toMatchObject(expectedOptions)
  }
}

/**
 * Хелпер для проверки что timeline был создан
 */
export function expectTimelineCreated(gsapMock: any, expectedOptions?: any) {
  const timelines = gsapMock.getTimelines()
  expect(timelines.length).toBeGreaterThan(0)
  
  if (expectedOptions) {
    const lastTimeline = timelines[timelines.length - 1]
    expect(lastTimeline.options).toMatchObject(expectedOptions)
  }
}

/**
 * Утилита для симуляции завершения анимации
 */
export function completeAnimation(animation: any) {
  animation.progress(1)
  if (animation.options.onComplete) {
    animation.options.onComplete()
  }
}

/**
 * Утилита для симуляции завершения всех анимаций
 */
export function completeAllAnimations(gsapMock: any) {
  const animations = gsapMock.getActiveAnimations()
  animations.forEach(completeAnimation)
}

/**
 * Хелпер для проверки GSAP utility функций
 */
export function expectGSAPUtilityCall(gsapMock: any, utilityName: string, ...args: any[]) {
  expect(gsapMock.utils[utilityName]).toHaveBeenCalledWith(...args)
}

/**
 * Snapshot утилита для GSAP состояния
 */
export function getGSAPSnapshot(gsapMock: any) {
  return {
    activeAnimations: gsapMock.getActiveAnimations().length,
    totalAnimations: gsapMock.getAllAnimations().length,
    timelines: gsapMock.getTimelines().length,
    animationTargets: gsapMock.getAllAnimations().map((anim: any) => anim.target),
    timelineOptions: gsapMock.getTimelines().map((tl: any) => tl.options),
  }
}

/**
 * Утилита для мокирования физических расчетов с фиксированными значениями
 */
export function createPhysicsMock() {
  return {
    // Фиксированные значения для предсказуемых тестов
    gravity: 0.5,
    friction: 0.98,
    bounce: 0.8,
    
    // Мокированные математические функции
    calculateDistance: vi.fn((x1, y1, x2, y2) => 
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    ),
    calculateAngle: vi.fn((x1, y1, x2, y2) => 
      Math.atan2(y2 - y1, x2 - x1)
    ),
    applyForce: vi.fn((object, force) => {
      object.velocityX += force.x
      object.velocityY += force.y
    }),
    
    // Предсказуемый random для тестов
    randomInRange: vi.fn((min, max) => (min + max) / 2),
    randomBool: vi.fn(() => true), // Всегда true для предсказуемости
    
    // Utility для сброса всех физических состояний
    resetPhysics: vi.fn(),
  }
} 