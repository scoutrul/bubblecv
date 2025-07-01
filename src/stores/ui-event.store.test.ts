import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia } from 'pinia'
import { useUiEventStore } from './ui-event.store'
import { createTestPinia } from '../test/helpers/pinia-helpers'

describe('🏪 UI Event Store', () => {
  let store: ReturnType<typeof useUiEventStore>

  beforeEach(() => {
    setActivePinia(createTestPinia())
    store = useUiEventStore()
  })

  describe('📊 Начальное состояние', () => {
    it('должен иметь пустую очередь shake при инициализации', () => {
      // Проверяем что shakeQueue пуста через consumeShakeQueue
      const queue = store.consumeShakeQueue()
      expect(queue.size).toBe(0)
    })
  })

  describe('📝 queueShake', () => {
    it('должен добавлять компонент в очередь shake', () => {
      store.queueShake('xp')
      
      const queue = store.consumeShakeQueue()
      expect(queue.has('xp')).toBe(true)
      expect(queue.size).toBe(1)
    })

    it('должен добавлять несколько компонентов в очередь', () => {
      store.queueShake('xp')
      store.queueShake('lives')
      store.queueShake('level')
      
      const queue = store.consumeShakeQueue()
      expect(queue.has('xp')).toBe(true)
      expect(queue.has('lives')).toBe(true)
      expect(queue.has('level')).toBe(true)
      expect(queue.size).toBe(3)
    })

    it('не должен добавлять дубликаты в очередь (Set behavior)', () => {
      store.queueShake('xp')
      store.queueShake('xp')
      store.queueShake('xp')
      
      const queue = store.consumeShakeQueue()
      expect(queue.has('xp')).toBe(true)
      expect(queue.size).toBe(1) // Только один элемент из-за Set
    })

    it('должен обрабатывать пустые строки', () => {
      store.queueShake('')
      
      const queue = store.consumeShakeQueue()
      expect(queue.has('')).toBe(true)
      expect(queue.size).toBe(1)
    })

    it('должен обрабатывать специальные символы в имени компонента', () => {
      const specialNames = ['xp-bar', 'lives_counter', 'level@component', 'comp#1']
      
      specialNames.forEach(name => {
        store.queueShake(name)
      })
      
      const queue = store.consumeShakeQueue()
      expect(queue.size).toBe(specialNames.length)
      specialNames.forEach(name => {
        expect(queue.has(name)).toBe(true)
      })
    })
  })

  describe('🍽️ consumeShakeQueue', () => {
    it('должен возвращать пустой Set если очередь пуста', () => {
      const queue = store.consumeShakeQueue()
      
      expect(queue).toBeInstanceOf(Set)
      expect(queue.size).toBe(0)
    })

    it('должен возвращать все элементы очереди и очищать ее', () => {
      store.queueShake('xp')
      store.queueShake('lives')
      
      const queue = store.consumeShakeQueue()
      
      expect(queue.size).toBe(2)
      expect(queue.has('xp')).toBe(true)
      expect(queue.has('lives')).toBe(true)
      
      // Проверяем что очередь очищена
      const secondQueue = store.consumeShakeQueue()
      expect(secondQueue.size).toBe(0)
    })

    it('должен возвращать копию Set, не влияющую на внутреннее состояние', () => {
      store.queueShake('xp')
      
      const queue = store.consumeShakeQueue()
      
      // Модифицируем возвращенный Set
      queue.add('lives')
      queue.delete('xp')
      
      // Проверяем что внутреннее состояние не изменилось
      store.queueShake('level')
      const newQueue = store.consumeShakeQueue()
      
      expect(newQueue.has('level')).toBe(true)
      expect(newQueue.has('lives')).toBe(false) // Не должно быть добавлено
      expect(newQueue.size).toBe(1)
    })

    it('должен обрабатывать множественные вызовы подряд', () => {
      // Первый цикл
      store.queueShake('xp')
      const firstQueue = store.consumeShakeQueue()
      expect(firstQueue.size).toBe(1)
      
      // Второй цикл
      store.queueShake('lives')
      store.queueShake('level')
      const secondQueue = store.consumeShakeQueue()
      expect(secondQueue.size).toBe(2)
      
      // Третий цикл - пустая очередь
      const thirdQueue = store.consumeShakeQueue()
      expect(thirdQueue.size).toBe(0)
    })
  })

  describe('🔄 Интеграционные сценарии', () => {
    it('должен правильно работать полный lifecycle UI событий', () => {
      // 1. Начальное состояние пусто
      expect(store.consumeShakeQueue().size).toBe(0)
      
      // 2. Добавляем события
      store.queueShake('xp')
      store.queueShake('lives')
      
      // 3. Обрабатываем первую партию
      const firstBatch = store.consumeShakeQueue()
      expect(firstBatch.size).toBe(2)
      expect(firstBatch.has('xp')).toBe(true)
      expect(firstBatch.has('lives')).toBe(true)
      
      // 4. Очередь пуста после обработки
      expect(store.consumeShakeQueue().size).toBe(0)
      
      // 5. Добавляем новые события
      store.queueShake('level')
      store.queueShake('achievement')
      
      // 6. Обрабатываем вторую партию
      const secondBatch = store.consumeShakeQueue()
      expect(secondBatch.size).toBe(2)
      expect(secondBatch.has('level')).toBe(true)
      expect(secondBatch.has('achievement')).toBe(true)
    })

    it('должен обрабатывать реальный сценарий игрового UI', () => {
      // Симулируем получение XP
      store.queueShake('xp')
      store.queueShake('progress-bar')
      
      // Симулируем level up
      store.queueShake('level')
      store.queueShake('achievement-notification')
      
      // UI компонент забирает все события для анимации
      const uiEvents = store.consumeShakeQueue()
      
      const expectedEvents = ['xp', 'progress-bar', 'level', 'achievement-notification']
      expect(uiEvents.size).toBe(expectedEvents.length)
      
      expectedEvents.forEach(event => {
        expect(uiEvents.has(event)).toBe(true)
      })
      
      // После обработки очередь пуста
      expect(store.consumeShakeQueue().size).toBe(0)
    })

    it('должен правильно работать с частыми обновлениями', () => {
      // Симулируем rapid fire события (как в игре)
      const events = []
      for (let i = 0; i < 100; i++) {
        const eventName = `event-${i % 5}` // 5 разных типов событий
        store.queueShake(eventName)
        events.push(eventName)
      }
      
      const processedQueue = store.consumeShakeQueue()
      
      // Должно быть только 5 уникальных событий (Set убирает дубликаты)
      expect(processedQueue.size).toBe(5)
      
      for (let i = 0; i < 5; i++) {
        expect(processedQueue.has(`event-${i}`)).toBe(true)
      }
    })
  })

  describe('🔧 Edge Cases', () => {
    it('должен обрабатывать очень длинные имена компонентов', () => {
      const longName = 'a'.repeat(1000)
      
      store.queueShake(longName)
      
      const queue = store.consumeShakeQueue()
      expect(queue.has(longName)).toBe(true)
      expect(queue.size).toBe(1)
    })

    it('должен обрабатывать Unicode символы в именах', () => {
      const unicodeNames = ['🎯', '💎', '⭐', '🏆', '🎪', '🌟']
      
      unicodeNames.forEach(name => {
        store.queueShake(name)
      })
      
      const queue = store.consumeShakeQueue()
      expect(queue.size).toBe(unicodeNames.length)
      
      unicodeNames.forEach(name => {
        expect(queue.has(name)).toBe(true)
      })
    })

    it('должен обрабатывать null/undefined имена как есть', () => {
      // TypeScript предотвратит это, но на случай runtime
      store.queueShake(null as any)
      store.queueShake(undefined as any)
      
      const queue = store.consumeShakeQueue()
      expect(queue.size).toBe(2)
      expect((queue as any).has(null)).toBe(true)
      expect((queue as any).has(undefined)).toBe(true)
    })

    it('должен сохранять производительность при большом количестве операций', () => {
      const startTime = performance.now()
      
      // Добавляем много событий
      for (let i = 0; i < 10000; i++) {
        store.queueShake(`event-${i}`)
      }
      
      // Забираем все события
      const queue = store.consumeShakeQueue()
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      expect(queue.size).toBe(10000)
      expect(executionTime).toBeLessThan(100) // Должно выполниться быстро (< 100ms)
    })
  })

  describe('🧩 Type Safety', () => {
    it('должен принимать любые строковые значения', () => {
      const testValues = [
        'normal-component',
        'UPPERCASE_COMPONENT',
        'camelCaseComponent',
        'kebab-case-component',
        'snake_case_component',
        'PascalCaseComponent',
        'component123',
        '123component',
        'comp-onent_with.everything'
      ]
      
      testValues.forEach(value => {
        expect(() => store.queueShake(value)).not.toThrow()
      })
      
      const queue = store.consumeShakeQueue()
      expect(queue.size).toBe(testValues.length)
      
      testValues.forEach(value => {
        expect(queue.has(value)).toBe(true)
      })
    })
  })
}) 