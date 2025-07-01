import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia } from 'pinia'
import { useBubbleStore } from './bubble.store'
import { createTestPinia } from '../test/helpers/pinia-helpers'
import { mockBubbles, createBubblesByYear, createCustomBubble } from '../test/fixtures/bubbles'
import { server, http, HttpResponse } from '../test/mocks/server'

// Мокируем глобальные window свойства для createHiddenBubble
Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })

describe('🏪 Bubble Store', () => {
  let store: ReturnType<typeof useBubbleStore>

  beforeEach(() => {
    setActivePinia(createTestPinia())
    store = useBubbleStore()
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    server.resetHandlers()
  })

  describe('📊 Начальное состояние', () => {
    it('должен иметь корректное начальное состояние', () => {
      expect(store.bubbles).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.activeHiddenBubbles).toEqual([])
    })
  })

  describe('🔄 Загрузка пузырей (loadBubbles)', () => {
    it('должен успешно загружать пузыри с сервера', async () => {
      // Setup API response с тестовыми данными
      server.use(
        http.get('/api/bubbles', () => {
          return HttpResponse.json({
            success: true,
            data: mockBubbles.map(bubble => ({
              ...bubble,
              skillLevel: 'expert', // API формат
              projects: JSON.stringify(bubble.projects)
            }))
          })
        })
      )

      await store.loadBubbles()

      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.bubbles.length).toBeGreaterThan(0)
      
      // Проверяем что данные трансформированы правильно
      const firstBubble = store.bubbles[0]
      expect(firstBubble).toHaveProperty('id')
      expect(firstBubble).toHaveProperty('name')
      expect(firstBubble).toHaveProperty('isPopped', false)
      expect(firstBubble).toHaveProperty('isVisited', false)
    })

    it('должен добавлять скрытый пузырь если его нет', async () => {
      await store.loadBubbles()
      
      const hiddenBubbles = store.bubbles.filter(b => b.bubbleType === 'hidden')
      expect(hiddenBubbles.length).toBeGreaterThanOrEqual(1)
      
      const hiddenBubble = hiddenBubbles[0]
      expect(hiddenBubble.name).toBe('Скрытый пузырь')
      expect(hiddenBubble.isHidden).toBe(true)
      expect(hiddenBubble.bubbleType).toBe('hidden')
    })

    it('должен показывать loading состояние во время загрузки', async () => {
      // Создаем медленный API response
      server.use(
        http.get('/api/bubbles', async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return HttpResponse.json({ success: true, data: mockBubbles })
        })
      )

      const loadPromise = store.loadBubbles()
      expect(store.isLoading).toBe(true)
      
      await loadPromise
      expect(store.isLoading).toBe(false)
    })

    it('должен обрабатывать ошибки API', async () => {
      server.use(
        http.get('/api/bubbles', () => {
          return HttpResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
          )
        })
      )

      await expect(store.loadBubbles()).rejects.toThrow('Failed to fetch bubbles')
      expect(store.error).toBe('Failed to fetch bubbles')
      expect(store.isLoading).toBe(false)
    })

    it('не должен загружать повторно если уже загружены (без forceReload)', async () => {
      const apiSpy = vi.fn()
      server.use(
        http.get('/api/bubbles', () => {
          apiSpy()
          return HttpResponse.json({ success: true, data: mockBubbles })
        })
      )

      await store.loadBubbles()
      await store.loadBubbles() // Второй вызов

      expect(apiSpy).toHaveBeenCalledTimes(1)
    })

    it('должен принудительно перезагружать с forceReload=true', async () => {
      const apiSpy = vi.fn()
      server.use(
        http.get('/api/bubbles', () => {
          apiSpy()
          return HttpResponse.json({ success: true, data: mockBubbles })
        })
      )

      await store.loadBubbles()
      await store.loadBubbles(true) // forceReload

      expect(apiSpy).toHaveBeenCalledTimes(2)
    })

    it('должен кешировать промис при одновременных вызовах', async () => {
      const apiSpy = vi.fn()
      
      // Создаем медленный API response для тестирования кеширования
      server.use(
        http.get('/api/bubbles', async () => {
          apiSpy()
          await new Promise(resolve => setTimeout(resolve, 50))
          return HttpResponse.json({ success: true, data: mockBubbles })
        })
      )

      // Запускаем первый вызов
      const promise1 = store.loadBubbles()
      expect(store.isLoading).toBe(true)
      
      // Запускаем второй вызов пока первый еще выполняется
      const promise2 = store.loadBubbles()

      // Ждем завершения обоих
      await Promise.all([promise1, promise2])
      
      // Проверяем что API был вызван только один раз (кеширование работает)
      expect(apiSpy).toHaveBeenCalledTimes(1)
      expect(store.isLoading).toBe(false)
      expect(store.bubbles.length).toBeGreaterThan(0)
    })
  })

  describe('🔍 Фильтрация пузырей', () => {
    beforeEach(async () => {
      // Подготавливаем тестовые данные
      const testBubbles = [
        ...createBubblesByYear(2020, 2),
        ...createBubblesByYear(2021, 3),
        ...createBubblesByYear(2022, 1)
      ]
      
      server.use(
        http.get('/api/bubbles', () => {
          return HttpResponse.json({ success: true, data: testBubbles })
        })
      )
      
      await store.loadBubbles()
    })

    it('getBubblesByYear должен возвращать пузыри определенного года', () => {
      const bubbles2021 = store.getBubblesByYear(2021)
      
      expect(bubbles2021.length).toBe(3)
      bubbles2021.forEach(bubble => {
        expect(bubble.year).toBe(2021)
      })
    })

    it('getBubblesUpToYear должен возвращать пузыри до указанного года', () => {
      const bubblesUpTo2021 = store.getBubblesUpToYear(2021)
      
      bubblesUpTo2021.forEach(bubble => {
        expect(bubble.year).toBeLessThanOrEqual(2021)
        expect(bubble.bubbleType).not.toBe('hidden') // Исключает скрытые
      })
    })

    it('getBubblesUpToYear должен исключать visited пузыри', () => {
      const visitedIds = [store.bubbles[0].id, store.bubbles[1].id]
      const filteredBubbles = store.getBubblesUpToYear(2022, visitedIds)
      
      filteredBubbles.forEach(bubble => {
        expect(visitedIds).not.toContain(bubble.id)
      })
    })

    it('findNextYearWithNewBubbles должен находить следующий год с новыми пузырями', () => {
      const nextYear = store.findNextYearWithNewBubbles(2020)
      expect(nextYear).toBe(2021)
      
      const nextAfter2021 = store.findNextYearWithNewBubbles(2021)
      expect(nextAfter2021).toBe(2022)
      
      const noNext = store.findNextYearWithNewBubbles(2025)
      expect(noNext).toBe(null)
    })

    it('hasUnpoppedBubblesInYear должен проверять наличие непробитых пузырей', () => {
      expect(store.hasUnpoppedBubblesInYear(2021)).toBe(true)
      
      // Пробиваем все пузыри 2021 года
      const bubbles2021 = store.getBubblesByYear(2021)
      bubbles2021.forEach(bubble => store.popBubble(bubble.id))
      
      expect(store.hasUnpoppedBubblesInYear(2021)).toBe(false)
    })
  })

  describe('💥 Управление состоянием пузырей', () => {
    beforeEach(async () => {
      server.use(
        http.get('/api/bubbles', () => {
          return HttpResponse.json({ success: true, data: mockBubbles })
        })
      )
      await store.loadBubbles()
    })

    it('popBubble должен помечать пузырь как пробитый', () => {
      const bubble = store.bubbles[0]
      expect(bubble.isPopped).toBe(false)
      
      store.popBubble(bubble.id)
      expect(bubble.isPopped).toBe(true)
    })

    it('popBubble должен игнорировать несуществующий ID', () => {
      const initialState = store.bubbles.map(b => ({ ...b }))
      
      store.popBubble('non-existent-id')
      
      expect(store.bubbles).toEqual(initialState)
    })

    it('resetBubbles должен сбрасывать isPopped у всех пузырей', () => {
      const bubble1 = store.bubbles[0]
      const bubble2 = store.bubbles[1]
      
      store.popBubble(bubble1.id)
      store.popBubble(bubble2.id)

      expect(store.bubbles.find(b => b.id === bubble1.id)!.isPopped).toBe(true)
      expect(store.bubbles.find(b => b.id === bubble2.id)!.isPopped).toBe(true)

      store.resetBubbles()

      expect(store.bubbles.find(b => b.id === bubble1.id)!.isPopped).toBe(false)
      expect(store.bubbles.find(b => b.id === bubble2.id)!.isPopped).toBe(false)
    })
    
    it('reset должен сбрасывать все состояние в начальное', () => {
      const bubble1 = store.bubbles[0]
      store.popBubble(bubble1.id)
      store.incrementToughBubbleClicks('tough-bubble-id') // test with a non-existent one

      store.reset()

      expect(store.bubbles).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.getToughBubbleClicks('tough-bubble-id')).toBe(0)
    })
  })

  describe('🕵️ Скрытые пузыри (Hidden Bubbles)', () => {
    beforeEach(async () => {
      server.use(
        http.get('/api/bubbles', () => {
          return HttpResponse.json({ success: true, data: mockBubbles })
        })
      )
      await store.loadBubbles()
    })

    it('должен добавлять скрытый пузырь автоматически при загрузке', () => {
      const hiddenBubbles = store.bubbles.filter(b => b.bubbleType === 'hidden')
      expect(hiddenBubbles.length).toBeGreaterThanOrEqual(1)
    })

    it('addHiddenBubble должен добавлять новый скрытый пузырь', () => {
      const initialHiddenCount = store.bubbles.filter(b => b.bubbleType === 'hidden').length
      store.addHiddenBubble()
      const newHiddenCount = store.bubbles.filter(b => b.bubbleType === 'hidden').length
      expect(newHiddenCount).toBe(initialHiddenCount + 1)
    })

    it('activeHiddenBubbles computed должен возвращать только активные скрытые пузыри', () => {
      // Добавляем еще один скрытый пузырь
      store.addHiddenBubble()
      
      const activeBefore = store.activeHiddenBubbles.length
      expect(activeBefore).toBeGreaterThan(0)
      
      // Пробиваем один скрытый пузырь
      const hiddenBubble = store.bubbles.find(b => b.bubbleType === 'hidden')!
      store.popBubble(hiddenBubble.id)
      
      const activeAfter = store.activeHiddenBubbles.length
      expect(activeAfter).toBe(activeBefore - 1)
    })

    it('скрытые пузыри должны иметь корректные координаты', () => {
      store.addHiddenBubble()
      
      const hiddenBubbles = store.bubbles.filter(b => b.bubbleType === 'hidden')
      hiddenBubbles.forEach(bubble => {
        expect(bubble.x).toBeGreaterThanOrEqual(window.innerWidth * 0.2)
        expect(bubble.x).toBeLessThanOrEqual(window.innerWidth * 0.8)
        expect(bubble.y).toBeGreaterThanOrEqual(window.innerHeight * 0.2)
        expect(bubble.y).toBeLessThanOrEqual(window.innerHeight * 0.8)
      })
    })

    it('activeHiddenBubbles должен возвращать только активные, непробитые и непосещенные скрытые пузыри', () => {
      store.addHiddenBubble() // a second hidden bubble
      const hiddenBubbles = store.bubbles.filter(b => b.bubbleType === 'hidden')
      const firstHidden = hiddenBubbles[0]
      const secondHidden = hiddenBubbles[1]

      // "Visit" the first bubble
      firstHidden.isVisited = true
      // "Pop" the second bubble
      secondHidden.isPopped = true

      // Add a third one that should be active
      store.addHiddenBubble()

      const activeOnes = store.activeHiddenBubbles
      expect(activeOnes.length).toBe(1)
      expect(activeOnes[0].isVisited).toBe(false)
      expect(activeOnes[0].isPopped).toBe(false)
    })
  })

  describe('🔄 Reset функциональность', () => {
    beforeEach(async () => {
      server.use(
        http.get('/api/bubbles', () => {
          return HttpResponse.json({ success: true, data: mockBubbles })
        })
      )
      await store.loadBubbles()
    })

    it('reset должен очищать все состояние', () => {
      // Создаем некоторое состояние
      store.popBubble(store.bubbles[0].id)
      store.incrementToughBubbleClicks('some-id')
      
      store.reset()
      
      expect(store.bubbles).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.getToughBubbleClicks('some-id')).toBe(0)
    })
  })

  describe('📊 Computed свойства', () => {
    beforeEach(async () => {
      // Подготавливаем mix из обычных и скрытых пузырей
      const regularBubbles = mockBubbles.slice(0, 2)
      
      server.use(
        http.get('/api/bubbles', () => {
          return HttpResponse.json({ success: true, data: regularBubbles })
        })
      )
      await store.loadBubbles()
      
      // Добавляем дополнительные скрытые пузыри
      store.addHiddenBubble()
      store.addHiddenBubble()
    })

    it('activeHiddenBubbles должен реактивно обновляться', () => {
      const initialCount = store.activeHiddenBubbles.length
      expect(initialCount).toBeGreaterThan(0)
      
      // Пробиваем один скрытый пузырь
      const hiddenBubble = store.activeHiddenBubbles[0]
      store.popBubble(hiddenBubble.id)
      
      expect(store.activeHiddenBubbles.length).toBe(initialCount - 1)
      expect(store.activeHiddenBubbles).not.toContain(hiddenBubble)
    })
  })

  describe('🔄 Интеграционные сценарии', () => {
    it('должен корректно работать с полным lifecycle', async () => {
      // 1. Загрузка данных
      await store.loadBubbles()
      expect(store.bubbles.length).toBeGreaterThan(0)
      
      // 2. Фильтрация пузырей
      const year2020Bubbles = store.getBubblesByYear(2020)
      expect(Array.isArray(year2020Bubbles)).toBe(true)
      
      // 3. Взаимодействие с пузырями
      if (store.bubbles.length > 0) {
        const bubble = store.bubbles[0]
        store.popBubble(bubble.id)
        expect(bubble.isPopped).toBe(true)
      }
      
      // 4. Скрытые пузыри
      store.addHiddenBubble()
      expect(store.activeHiddenBubbles.length).toBeGreaterThan(0)
      
      // 5. Reset
      store.reset()
      expect(store.bubbles).toEqual([])
    })
  })

  describe('💪 Tough Bubbles (крепкие пузыри)', () => {
    let toughBubble: ReturnType<typeof createCustomBubble>

    beforeEach(async () => {
      toughBubble = createCustomBubble({
        id: 'tough-1',
        isTough: true,
        toughClicks: 3
      })
      
      server.use(
        http.get('/api/bubbles', () => {
          return HttpResponse.json({ success: true, data: [toughBubble, ...mockBubbles] })
        })
      )
      
      await store.loadBubbles()
    })

    it('getToughBubbleClicks должен возвращать 0 для нового пузыря', () => {
      expect(store.getToughBubbleClicks(toughBubble.id)).toBe(0)
    })

    it('incrementToughBubbleClicks должен увеличивать счетчик кликов', () => {
      store.incrementToughBubbleClicks(toughBubble.id)
      expect(store.getToughBubbleClicks(toughBubble.id)).toBe(1)
      
      store.incrementToughBubbleClicks(toughBubble.id)
      expect(store.getToughBubbleClicks(toughBubble.id)).toBe(2)
    })

    it('incrementToughBubbleClicks должен возвращать isReady: false, пока кликов недостаточно', () => {
      const result1 = store.incrementToughBubbleClicks(toughBubble.id)
      expect(result1.currentClicks).toBe(1)
      expect(result1.isReady).toBe(false)

      const result2 = store.incrementToughBubbleClicks(toughBubble.id)
      expect(result2.currentClicks).toBe(2)
      expect(result2.isReady).toBe(false)
    })

    it('incrementToughBubbleClicks должен возвращать isReady: true, когда кликов достаточно', () => {
      store.incrementToughBubbleClicks(toughBubble.id) // 1
      store.incrementToughBubbleClicks(toughBubble.id) // 2
      const result = store.incrementToughBubbleClicks(toughBubble.id) // 3
      
      expect(result.currentClicks).toBe(3)
      expect(result.isReady).toBe(true)
    })

    it('счетчики кликов для разных пузырей должны быть независимы', () => {
      const toughBubble2Data = createCustomBubble({ id: 'tough-2', isTough: true, toughClicks: 2 })
      // Manually add to the store's state for this test
      store.bubbles.push(toughBubble2Data as any)

      store.incrementToughBubbleClicks(toughBubble.id)
      store.incrementToughBubbleClicks(toughBubble2Data.id)
      store.incrementToughBubbleClicks(toughBubble.id)

      expect(store.getToughBubbleClicks(toughBubble.id)).toBe(2)
      expect(store.getToughBubbleClicks(toughBubble2Data.id)).toBe(1)
    })
  })

  describe('🔮 Скрытые пузыри', () => {
    beforeEach(async () => {
      server.use(
        http.get('/api/bubbles', () => {
          return HttpResponse.json({ success: true, data: mockBubbles })
        })
      )
      await store.loadBubbles()
    })

    it('addHiddenBubble должен добавлять новый скрытый пузырь', () => {
      const initialHiddenCount = store.bubbles.filter(b => b.bubbleType === 'hidden').length
      store.addHiddenBubble()
      const newHiddenCount = store.bubbles.filter(b => b.bubbleType === 'hidden').length
      expect(newHiddenCount).toBe(initialHiddenCount + 1)
    })

    it('activeHiddenBubbles должен возвращать только активные, непробитые и непосещенные скрытые пузыри', () => {
      store.addHiddenBubble() // a second hidden bubble
      const hiddenBubbles = store.bubbles.filter(b => b.bubbleType === 'hidden')
      const firstHidden = hiddenBubbles[0]
      const secondHidden = hiddenBubbles[1]

      // "Visit" the first bubble
      firstHidden.isVisited = true
      // "Pop" the second bubble
      secondHidden.isPopped = true

      // Add a third one that should be active
      store.addHiddenBubble()

      const activeOnes = store.activeHiddenBubbles
      expect(activeOnes.length).toBe(1)
      expect(activeOnes[0].isVisited).toBe(false)
      expect(activeOnes[0].isPopped).toBe(false)
    })
  })
})