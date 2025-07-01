import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createTestingPinia, type TestingOptions } from '@pinia/testing'
import { vi } from 'vitest'

/**
 * Создает изолированный Pinia instance для тестирования
 */
export function createTestPinia(options?: Partial<TestingOptions>): Pinia {
  return createTestingPinia({
    initialState: {},
    stubActions: false,
    fakeApp: true,
    plugins: [],
    ...options,
  })
}

/**
 * Создает мокированный Pinia instance для unit тестов отдельных stores
 */
export function createMockedPinia(): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Snapshot утилита для тестирования состояния store
 */
export function getStoreSnapshot(store: any) {
  return {
    state: JSON.parse(JSON.stringify(store.$state)),
    actions: Object.keys(store).filter(key => typeof store[key] === 'function'),
    getters: Object.keys(store).filter(key => 
      key.startsWith('get') || !key.startsWith('$') && typeof store[key] !== 'function'
    )
  }
}

/**
 * Утилита для создания мока API для store тестов
 */
export function mockApiService() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    // Специфичные для проекта API методы
    fetchBubbles: vi.fn(),
    fetchPhilosophyQuestions: vi.fn(),
    fetchAchievements: vi.fn(),
    saveProgress: vi.fn(),
  }
}

/**
 * Хелпер для мокирования localStorage
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    length: Object.keys(store).length,
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  }
}

/**
 * Утилита для создания тестовых данных состояния игры
 */
export function createGameStateFixture() {
  return {
    level: 1,
    xp: 0,
    lives: 3,
    maxLives: 3,
    score: 0,
    isGameActive: false,
    isGamePaused: false,
    currentBubbles: [],
    totalBubblesPopped: 0,
    gameStartTime: null,
    lastLevelUpTime: null,
  }
}

/**
 * Утилита для создания тестовых данных пузырей
 */
export function createBubbleStateFixture() {
  return {
    bubbles: [],
    selectedBubble: null,
    filteredBubbles: [],
    isLoading: false,
    error: null,
    lastFetch: null,
  }
}

/**
 * Утилита для создания тестовых данных модальных окон
 */
export function createModalStateFixture() {
  return {
    isOpen: false,
    currentModal: null,
    modalStack: [],
    modalProps: {},
    isClosing: false,
  }
}

/**
 * Утилита для создания тестовых данных сессии
 */
export function createSessionStateFixture() {
  return {
    user: null,
    isAuthenticated: false,
    preferences: {
      theme: 'light',
      soundEnabled: true,
      animationsEnabled: true,
    },
    progress: {
      completedBubbles: [],
      achievements: [],
      totalXP: 0,
      currentStreak: 0,
      maxStreak: 0,
    },
    lastActivity: null,
  }
}

/**
 * Утилита для создания тестовых данных UI событий
 */
export function createUIEventStateFixture() {
  return {
    activeInteractions: [],
    pendingAnimations: [],
    notifications: [],
    isUILocked: false,
    lastUserAction: null,
  }
}

/**
 * Мок для router (если нужен в store тестах)
 */
export function mockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {
      value: {
        name: 'home',
        path: '/',
        params: {},
        query: {},
        meta: {},
      }
    },
  }
}

/**
 * Утилита для ожидания обновления store state
 */
export async function waitForStoreUpdate(store: any, timeout = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Store update timeout after ${timeout}ms`))
    }, timeout)

    const unsubscribe = store.$subscribe(() => {
      clearTimeout(timer)
      unsubscribe()
      resolve()
    })
  })
}

/**
 * Утилита для сброса всех моков store
 */
export function resetAllStoreMocks() {
  vi.clearAllMocks()
  vi.resetAllMocks()
} 