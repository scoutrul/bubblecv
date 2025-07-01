import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestPinia } from './helpers/pinia-helpers'
import { server, http, HttpResponse } from './mocks/server'
import { mockBubbles } from './fixtures/bubbles'
import { mockAchievements } from './fixtures/achievements'
import { useBubbleStore } from '@/stores/bubble.store'
import { useGameStore } from '@/stores/game.store'
import { useSessionStore } from '@/stores/session.store'
import { useModalStore } from '@/stores/modal.store'
import { GAME_CONFIG } from '@shared/config/game-config'

// Мокируем ассеты и конфиги
vi.mock('@/shared/assets/achievements', () => ({
  allAchievements: mockAchievements
}))

vi.mock('@shared/config/game-config', () => ({
  GAME_CONFIG: {
    levelRequirements: { 1: 0, 2: 100, 3: 250 },
    xpPerBubble: 20,
    achievementXP: {
      basic: 10,
      intermediate: 20,
      advanced: 50,
      master: 100
    }
  }
}))

describe('🔄 Интеграционное тестирование: Полный игровой цикл', () => {
  let bubbleStore: ReturnType<typeof useBubbleStore>
  let gameStore: ReturnType<typeof useGameStore>
  let sessionStore: ReturnType<typeof useSessionStore>
  let modalStore: ReturnType<typeof useModalStore>

  beforeEach(async () => {
    // Используем фейковые таймеры для тестов
    vi.useFakeTimers({ shouldAdvanceTime: true })
    
    // Настраиваем мок-сервер для всех тестов в этом сьюте
    server.use(
      http.get('/api/bubbles', () => {
        return HttpResponse.json({ success: true, data: mockBubbles })
      }),
      http.get('/api/content-levels', () => {
        return HttpResponse.json({
          levels: [
            { level: 1, title: 'Новичок', xpRequired: 0 },
            { level: 2, title: 'Ученик', xpRequired: 100 },
            { level: 3, title: 'Знаток', xpRequired: 250 }
          ]
        })
      })
    )

    // Создаем свежий Pinia и сторы для каждого теста
    setActivePinia(createTestPinia())
    bubbleStore = useBubbleStore()
    gameStore = useGameStore()
    sessionStore = useSessionStore()
    modalStore = useModalStore()

    // Ждем инициализации всех данных
    await Promise.all([
      bubbleStore.loadBubbles(),
      gameStore.loadContentLevels(),
      sessionStore.loadSession()
    ])
    
    // Принудительно устанавливаем начальное состояние сессии
    sessionStore.$patch({
      session: {
        id: 'test-session',
        currentXP: 0,
        currentLevel: 1,
        lives: 3,
        unlockedContent: [],
        visitedBubbles: [],
        agreementScore: 0,
        gameCompleted: false,
        hasDestroyedToughBubble: false,
        startTime: new Date(),
        lastActivity: new Date()
      }
    })
  })

  afterEach(() => {
    server.resetHandlers()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('должен корректно обрабатывать флоу: лопнуть пузыри -> получить XP -> повысить уровень -> получить ачивку', async () => {
    // Увеличиваем таймаут для этого теста
    vi.setConfig({ testTimeout: 20000 })
    
    // 1. Начальное состояние
    expect(sessionStore.currentXP).toBe(0)
    expect(sessionStore.currentLevel).toBe(1)
    expect(gameStore.unlockedAchievements.length).toBe(0)

    // 2. "Лопнуть" 5 пузырей, чтобы получить 100 XP (5 * 20)
    for (let i = 0; i < 5; i++) {
      const bubble = bubbleStore.bubbles[i]
      bubbleStore.popBubble(bubble.id)
      await sessionStore.gainXP(GAME_CONFIG.xpPerBubble)
      // Продвигаем таймеры после каждого действия
      await vi.advanceTimersByTimeAsync(10)
    }

    // 3. Проверка после получения XP
    // 100 XP за пузыри + 10 XP за достижение 'first-level-master'
    expect(sessionStore.currentXP).toBe(110) 
    expect(sessionStore.currentLevel).toBe(2) // Должен был повыситься уровень
    
    // 3.1. Симулируем открытие модалки, как это сделал бы `useBubbleManager`
    modalStore.openLevelUpModal(2, { level: 2 })
    await vi.advanceTimersByTimeAsync(10)

    // 4. Проверяем, что достижение за 10 пузырей еще НЕ получено
    let achievement = gameStore.achievements.find(a => a.id === 'bubble-explorer-10')
    expect(achievement?.isUnlocked).toBe(false)
    
    // 5. "Лопнуть" еще 5 пузырей
    let poppedCount = 5
    for (let i = 5; i < 10; i++) {
      const bubble = bubbleStore.bubbles[i]
      bubbleStore.popBubble(bubble.id)
      poppedCount++
      await sessionStore.gainXP(GAME_CONFIG.xpPerBubble)
      gameStore.checkAndUnlockBubbleAchievements(poppedCount)
      // Продвигаем таймеры после каждого действия
      await vi.advanceTimersByTimeAsync(10)
    }
    
    // 6. Проверка получения достижения
    achievement = gameStore.achievements.find(a => a.id === 'bubble-explorer-10')
    expect(achievement?.isUnlocked).toBe(true)

    // 7. Проверяем систему очереди модалок
    // LevelUp модалка все еще должна быть открыта
    expect(modalStore.isLevelUpModalOpen).toBe(true) 
    // Модалка достижения НЕ должна открываться, а должна встать в очередь
    expect(modalStore.isAchievementModalOpen).toBe(false)

    // 8. Закрываем модалку повышения уровня
    modalStore.closeLevelUpModal()
    
    // Добавляем небольшую задержку для обработки очереди достижений
    await vi.advanceTimersByTimeAsync(50)

    // После закрытия LevelUp модалки, должна показаться модалка первого разблокированного достижения (Первопроходец)
    expect(modalStore.isAchievementModalOpen).toBe(true)
    expect(modalStore.achievementData?.title).toBe('Первопроходец')

    // 9. Закрываем модалку первого достижения
    modalStore.closeAchievementModal()
    
    // Добавляем небольшую задержку для обработки очереди достижений
    await vi.advanceTimersByTimeAsync(50)
    
    // 10. Теперь должна показаться модалка следующего достижения из очереди (Исследователь пузырей)
    expect(modalStore.isAchievementModalOpen).toBe(true)
    expect(modalStore.achievementData?.title).toBe(achievement?.name) // achievement здесь относится к bubble-explorer-10
    
    // Восстанавливаем стандартный таймаут
    vi.setConfig({ testTimeout: 5000 })
  })
}) 