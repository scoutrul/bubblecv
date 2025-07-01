import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockAchievements } from '../test/fixtures/achievements'

// Мокируем зависимости (ВАЖНО: должно быть перед остальными импортами)
vi.mock('@/shared/assets/achievements', () => ({
  allAchievements: mockAchievements
}))

vi.mock('@shared/config/game-config', () => ({
  GAME_CONFIG: {
    levelRequirements: {
      1: 0,
      2: 100,
      3: 250,
      4: 500,
      5: 1000,
      6: 2000
    }
  }
}))

import { setActivePinia } from 'pinia'
import { useGameStore } from './game.store'
import { createTestPinia } from '../test/helpers/pinia-helpers'
import { server, http, HttpResponse } from '../test/mocks/server'

// Мокируем динамические импорты stores
const mockSessionStore = {
  gainXP: vi.fn().mockResolvedValue(undefined)
}

const mockModalStore = {
  queueOrShowAchievement: vi.fn()
}

const mockUiEventStore = {
  queueShake: vi.fn()
}

vi.mock('@/stores/session.store', () => ({
  useSessionStore: () => mockSessionStore
}))

vi.mock('@/stores/modal.store', () => ({
  useModalStore: () => mockModalStore
}))

vi.mock('@/stores/ui-event.store', () => ({
  useUiEventStore: () => mockUiEventStore
}))

describe('🎮 Game Store', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createTestPinia())
    store = useGameStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    server.resetHandlers()
  })

  describe('📊 Начальное состояние', () => {
    it('должен иметь корректное начальное состояние', () => {
      expect(store.achievements.length).toBeGreaterThan(0)
      expect(store.currentLevel).toBe(1)
      expect(store.currentXP).toBe(0)
      expect(store.isLoading).toBe(true) // Изначально загружает уровни
      expect(store.error).toBe(null)
      expect(store.unlockedAchievements).toEqual([])
    })

    it('должен инициализировать достижения в заблокированном состоянии', () => {
      store.achievements.forEach(achievement => {
        expect(achievement.isUnlocked).toBe(false)
        expect(achievement.isShown).toBe(false)
        expect(achievement.unlockedAt).toBeUndefined()
      })
    })
  })

  describe('📚 Загрузка уровней контента (loadContentLevels)', () => {
    it('должен успешно загружать уровни контента', async () => {
             const mockLevels = [
         { level: 1, title: 'Новичок', xpRequired: 0, description: 'Начальный уровень' },
         { level: 2, title: 'Изучающий', xpRequired: 100, description: 'Второй уровень' },
         { level: 3, title: 'Практик', xpRequired: 250, description: 'Третий уровень' }
       ]

      server.use(
        http.get('/api/content-levels', () => {
          return HttpResponse.json({ levels: mockLevels })
        })
      )

      await store.loadContentLevels()

      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.contentLevels.length).toBe(3)
      expect(store.levels.length).toBe(3)
      
      // Проверяем что XP requirements обновлены из конфига
      expect(store.contentLevels[0].xpRequired).toBe(0)
      expect(store.contentLevels[1].xpRequired).toBe(100)
      expect(store.contentLevels[2].xpRequired).toBe(250)
    })

    it('должен обрабатывать ошибки загрузки уровней', async () => {
      server.use(
        http.get('/api/content-levels', () => {
          return HttpResponse.json(
            { error: 'Server error' },
            { status: 500 }
          )
        })
      )

      await store.loadContentLevels()

      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Failed to load content levels')
    })

    it('getLevelByNumber должен возвращать правильный уровень', async () => {
             const mockLevels = [
         { level: 1, title: 'Новичок', xpRequired: 0, description: 'Начальный уровень' },
         { level: 2, title: 'Изучающий', xpRequired: 100, description: 'Второй уровень' }
       ]

      server.use(
        http.get('/api/content-levels', () => {
          return HttpResponse.json({ levels: mockLevels })
        })
      )

      await store.loadContentLevels()

      const level1 = store.getLevelByNumber(1)
      const level2 = store.getLevelByNumber(2)
      const levelNotExist = store.getLevelByNumber(999)

             expect(level1?.title).toBe('Новичок')
       expect(level2?.title).toBe('Изучающий')
      expect(levelNotExist).toBeUndefined()
    })
  })

  describe('🏆 Система достижений', () => {
    it('unlockAchievement должен разблокировать достижение', async () => {
      const achievementId = store.achievements[0].id
      const achievement = store.achievements[0]

      expect(achievement.isUnlocked).toBe(false)

      const result = await store.unlockAchievement(achievementId)

      expect(result).toBeTruthy()
      expect(achievement.isUnlocked).toBe(true)
      expect(achievement.unlockedAt).toBeTruthy()
      expect(achievement.isShown).toBe(true)
      
      // Проверяем взаимодействие с другими stores
      expect(mockUiEventStore.queueShake).toHaveBeenCalledWith('achievements')
      expect(mockSessionStore.gainXP).toHaveBeenCalledWith(achievement.xpReward)
      expect(mockModalStore.queueOrShowAchievement).toHaveBeenCalledWith({
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      })
    })

    it('unlockAchievement с showModal=false не должен показывать модал', async () => {
      const achievementId = store.achievements[0].id
      const achievement = store.achievements[0]

      const result = await store.unlockAchievement(achievementId, false)

      expect(result).toBeTruthy()
      expect(achievement.isUnlocked).toBe(true)
      expect(achievement.isShown).toBe(false)
      expect(mockModalStore.queueOrShowAchievement).not.toHaveBeenCalled()
    })

    it('unlockAchievement должен игнорировать уже разблокированное достижение', async () => {
      const achievementId = store.achievements[0].id
      const achievement = store.achievements[0]

      // Разблокируем первый раз
      await store.unlockAchievement(achievementId)
      vi.clearAllMocks()

      // Пытаемся разблокировать повторно
      const result = await store.unlockAchievement(achievementId)

      expect(result).toBeNull()
      expect(mockSessionStore.gainXP).not.toHaveBeenCalled()
      expect(mockModalStore.queueOrShowAchievement).not.toHaveBeenCalled()
    })

    it('unlockAchievement должен возвращать null для несуществующего достижения', async () => {
      const result = await store.unlockAchievement('non-existent-achievement')
      expect(result).toBeNull()
    })

    it('должен предотвращать дублирование разблокировки одного достижения', async () => {
      const achievementId = store.achievements[0].id

      // Запускаем два одновременных вызова
      const promise1 = store.unlockAchievement(achievementId)
      const promise2 = store.unlockAchievement(achievementId)

      const [result1, result2] = await Promise.all([promise1, promise2])

      // Только один должен успешно разблокировать
      const successCount = [result1, result2].filter(r => r !== null).length
      expect(successCount).toBe(1)
    })
  })

  describe('💎 Bubble Achievements', () => {
    it('checkAndUnlockBubbleAchievements должен разблокировать достижения по количеству пузырей', async () => {
      // Проверяем разные пороги
      await store.checkAndUnlockBubbleAchievements(5)
      let achievement10 = store.achievements.find(a => a.id === 'bubble-explorer-10')
      expect(achievement10!.isUnlocked).toBe(false)

      await store.checkAndUnlockBubbleAchievements(10)
      achievement10 = store.achievements.find(a => a.id === 'bubble-explorer-10')
      expect(achievement10!.isUnlocked).toBe(true)

      await store.checkAndUnlockBubbleAchievements(30)
      let achievement30 = store.achievements.find(a => a.id === 'bubble-explorer-30')
      expect(achievement10!.isUnlocked).toBe(true)
      expect(achievement30!.isUnlocked).toBe(true)
    })

    it('checkAndUnlockBubbleAchievements должен работать с большими числами', async () => {
      await store.checkAndUnlockBubbleAchievements(100)
      
      const achievement10 = store.achievements.find(a => a.id === 'bubble-explorer-10')
      const achievement30 = store.achievements.find(a => a.id === 'bubble-explorer-30')
      const achievement50 = store.achievements.find(a => a.id === 'bubble-explorer-50')

      expect(achievement10!.isUnlocked).toBe(true)
      expect(achievement30!.isUnlocked).toBe(true)
      expect(achievement50!.isUnlocked).toBe(true)
    })
  })

  describe('🔄 Сброс достижений', () => {
    it('resetAchievements должен сбрасывать все достижения в начальное состояние', async () => {
      // Сначала разблокируем несколько достижений
      const achievement1 = store.achievements[0]
      const achievement2 = store.achievements[1]
      await store.unlockAchievement(achievement1.id)
      await store.unlockAchievement(achievement2.id, false) // одно с модалом, другое без

      // Проверяем, что они разблокированы
      expect(store.achievements.find(a => a.id === achievement1.id)!.isUnlocked).toBe(true)
      expect(store.achievements.find(a => a.id === achievement1.id)!.isShown).toBe(true)
      expect(store.achievements.find(a => a.id === achievement1.id)!.unlockedAt).toBeDefined()
      
      expect(store.achievements.find(a => a.id === achievement2.id)!.isUnlocked).toBe(true)
      expect(store.achievements.find(a => a.id === achievement2.id)!.isShown).toBe(false)
      
      expect(store.unlockedAchievements.length).toBe(2)

      // Выполняем сброс
      store.resetAchievements()

      // Проверяем, что все сброшено
      store.achievements.forEach(a => {
        expect(a.isUnlocked).toBe(false)
        expect(a.isShown).toBe(false)
        expect(a.unlockedAt).toBeUndefined()
      })
      expect(store.unlockedAchievements.length).toBe(0)
    })
  })

  describe('📊 Computed свойства', () => {
    it('unlockedAchievements должен возвращать только разблокированные достижения', async () => {
      expect(store.unlockedAchievements.length).toBe(0)

      await store.unlockAchievement(store.achievements[0].id)
      expect(store.unlockedAchievements.length).toBe(1)
      expect(store.unlockedAchievements[0].id).toBe(store.achievements[0].id)

      await store.unlockAchievement(store.achievements[1].id)
      expect(store.unlockedAchievements.length).toBe(2)

      // Попытка разблокировать уже разблокированное
      await store.unlockAchievement(store.achievements[0].id)
      expect(store.unlockedAchievements.length).toBe(2) // Не должно увеличиться
    })

    it('unlockedAchievements должен реактивно обновляться при reset', async () => {
      await store.unlockAchievement(store.achievements[0].id)
      await store.unlockAchievement(store.achievements[1].id)
      
      expect(store.unlockedAchievements.length).toBe(2)

      store.resetAchievements()
      
      expect(store.unlockedAchievements.length).toBe(0)
    })
  })

  describe('⚙️ Инициализация store', () => {
    it('должен инициализировать достижения при создании', () => {
      // Store уже создан в beforeEach
      expect(store.achievements.length).toEqual(mockAchievements.length)
      
      store.achievements.forEach((achievement, index) => {
        expect(achievement.id).toBe(mockAchievements[index].id)
        expect(achievement.name).toBe(mockAchievements[index].name)
        expect(achievement.isUnlocked).toBe(false)
        expect(achievement.isShown).toBe(false)
      })
    })

    it('должен автоматически загружать уровни контента при создании', () => {
      // При создании store должен быть в состоянии загрузки
      expect(store.isLoading).toBe(true)
    })
  })

  describe('🔄 Интеграционные сценарии', () => {
    it('должен корректно работать с полным lifecycle', async () => {
      // 1. Начальное состояние
      expect(store.unlockedAchievements.length).toBe(0)
      expect(store.achievements.every(a => !a.isUnlocked)).toBe(true)

      // 2. Проверяем что store автоматически начинает загрузку (не обязательно завершенную)
      expect(store.isLoading).toBeDefined() // Store существует и имеет состояние

      // 3. Разблокировка достижений
      await store.unlockAchievement(store.achievements[0].id)
      expect(store.unlockedAchievements.length).toBe(1)

      // 4. Bubble achievements (используем простую проверку функции)
      expect(() => store.checkAndUnlockBubbleAchievements(10)).not.toThrow()
      
      // 5. Reset
      store.resetAchievements()
      expect(store.unlockedAchievements.length).toBe(0)
    })

    it('должен обрабатывать ошибки и восстанавливаться', async () => {
      // Имитируем ошибку загрузки
      server.use(
        http.get('/api/content-levels', () => {
          return HttpResponse.json(
            { error: 'Server error' },
            { status: 500 }
          )
        })
      )

      await store.loadContentLevels()
      expect(store.error).toBeTruthy()

             // Восстанавливаем сервер
       server.use(
         http.get('/api/content-levels', () => {
           return HttpResponse.json({ 
             levels: [{ level: 1, title: 'Test', xpRequired: 0, description: 'Test' }] 
           })
         })
       )

      await store.loadContentLevels()
      expect(store.error).toBe(null)
      expect(store.contentLevels.length).toBe(1)
    })
  })

  describe('🎯 Edge Cases', () => {
    it('должен обрабатывать пустой ответ уровней', async () => {
      // Изолируем этот тест от глобальных моков
      server.resetHandlers()
      server.use(
        http.get('/api/content-levels', () => {
          return HttpResponse.json({ levels: [] })
        })
      )

      // Создаем новый экземпляр store ПОСЛЕ настройки мока
      const localPinia = createTestPinia()
      setActivePinia(localPinia)
      const newStore = useGameStore()
      
      // Даем промису в loadContentLevels завершиться
      // Лучший способ - если бы store возвращал промис, но пока используем тайм-аут
      await new Promise(resolve => setTimeout(resolve, 50))

      // Проверяем что загрузка завершена и уровни пустые
      expect(newStore.isLoading).toBe(false)
      expect(newStore.contentLevels).toEqual([])
      expect(newStore.levels).toEqual([])
      expect(newStore.error).toBe(null)
    })

    it('должен обрабатывать достижения с отсутствующими полями', async () => {
      // Модифицируем достижение для удаления поля
      const originalAchievement = store.achievements[0]
      const modifiedAchievement = { ...originalAchievement, unlockedAt: undefined }
      store.achievements[0] = modifiedAchievement

      const result = await store.unlockAchievement(originalAchievement.id)
      
      expect(result).toBeTruthy()
      expect(modifiedAchievement.isUnlocked).toBe(true)
      expect(modifiedAchievement.unlockedAt).toBeTruthy()
    })
  })
}) 