import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockBubbles } from '../test/fixtures/bubbles'
import { mockPhilosophyQuestions, type TestPhilosophyQuestion } from '../test/fixtures/philosophy-questions'
import type { StoreGeneric } from 'pinia'

// Мокируем зависимости перед импортами
const mockSessionStore = {
  gainPhilosophyXP: vi.fn().mockResolvedValue(false),
  losePhilosophyLife: vi.fn().mockResolvedValue(false),
  resetSession: vi.fn().mockResolvedValue(undefined),
  currentLevel: 1,
  currentXP: 100
}

const mockGameStore = {
  getLevelByNumber: vi.fn().mockReturnValue({
    title: 'Новичок',
    description: 'Начальный уровень',
    unlockedFeatures: ['feature1']
  })
}

vi.mock('@/stores/session.store', () => ({
  useSessionStore: () => mockSessionStore
}))

vi.mock('@/stores/game.store', () => ({
  useGameStore: () => mockGameStore
}))

import { setActivePinia } from 'pinia'
import { useModalStore } from './modal.store'
import { createTestPinia } from '../test/helpers/pinia-helpers'
import type { PendingAchievement } from './modal.store'

describe('🏪 Modal Store', () => {
  let store: ReturnType<typeof useModalStore>

  // Mock window events
  const mockEventListeners: { [key: string]: EventListener[] } = {}
  const originalDispatchEvent = window.dispatchEvent
  const originalAddEventListener = window.addEventListener

  beforeEach(() => {
    setActivePinia(createTestPinia())
    store = useModalStore()
    
    // Mock window.dispatchEvent
    window.dispatchEvent = vi.fn()
    
    // Mock window.addEventListener
    window.addEventListener = vi.fn().mockImplementation((event: string, listener: EventListener) => {
      if (!mockEventListeners[event]) {
        mockEventListeners[event] = []
      }
      mockEventListeners[event].push(listener)
    })
    
    // Сброс моков
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.dispatchEvent = originalDispatchEvent
    window.addEventListener = originalAddEventListener
    
    // Очистка event listeners
    Object.keys(mockEventListeners).forEach(key => {
      delete mockEventListeners[key]
    })
  })

  describe('📊 Начальное состояние', () => {
    it('должен иметь корректное начальное состояние', () => {
      expect(store.isWelcomeOpen).toBe(false)
      expect(store.isBubbleModalOpen).toBe(false)
      expect(store.currentBubble).toBe(null)
      expect(store.isLevelUpModalOpen).toBe(false)
      expect(store.currentLevel).toBe(1)
      expect(store.isPhilosophyModalOpen).toBe(false)
      expect(store.currentQuestion).toBe(null)
      expect(store.isGameOverModalOpen).toBe(false)
      expect(store.gameOverStats).toBe(null)
      expect(store.isAchievementModalOpen).toBe(false)
      expect(store.achievementData).toBe(null)
    })

    it('должен иметь корректную структуру levelUpData', () => {
      expect(store.levelUpData).toEqual({
        level: 1,
        title: '',
        description: '',
        icon: '👋',
        currentXP: 0,
        xpGained: 0,
        unlockedFeatures: []
      })
    })

    it('должен корректно вычислять состояние модальных окон', () => {
      // Проверяем начальное состояние
      expect(store.$state.isWelcomeOpen).toBe(false)
      expect(store.$state.isBubbleModalOpen).toBe(false)
      expect(store.$state.isLevelUpModalOpen).toBe(false)
      expect(store.$state.isPhilosophyModalOpen).toBe(false)
      expect(store.$state.isGameOverModalOpen).toBe(false)
      expect(store.$state.isAchievementModalOpen).toBe(false)
      
      // Открываем welcome modal
      store.openWelcome()
      expect(store.$state.isWelcomeOpen).toBe(true)
      
      // Закрываем welcome modal
      store.closeWelcome()
      expect(store.$state.isWelcomeOpen).toBe(false)
      
      // Открываем bubble modal
      store.openBubbleModal(mockBubbles[0])
      expect(store.$state.isBubbleModalOpen).toBe(true)
      
      // Закрываем bubble modal
      store.closeBubbleModal()
      expect(store.$state.isBubbleModalOpen).toBe(false)
    })
  })

  describe('👋 Welcome Modal', () => {
    it('должен открывать welcome modal', () => {
      store.openWelcome()
      expect(store.isWelcomeOpen).toBe(true)
    })

    it('должен закрывать welcome modal', () => {
      store.openWelcome()
      store.closeWelcome()
      expect(store.isWelcomeOpen).toBe(false)
    })
  })

  describe('💫 Bubble Modal', () => {
    const testBubble = mockBubbles[0]

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('должен открывать bubble modal с пузырем', () => {
      store.openBubbleModal(testBubble)
      
      expect(store.isBubbleModalOpen).toBe(true)
      expect(store.currentBubble).toEqual(testBubble)
    })

    it('должен закрывать bubble modal и очищать состояние', () => {
      store.openBubbleModal(testBubble)
      store.closeBubbleModal()
      
      expect(store.isBubbleModalOpen).toBe(false)
      expect(store.currentBubble).toBe(null)
    })

    it('должен вызывать processPendingAchievements при закрытии', () => {
      // Открываем bubble modal
      store.openBubbleModal(testBubble)
      
      // Добавляем достижение через queueOrShowAchievement
      store.queueOrShowAchievement({
        title: 'Test Achievement',
        description: 'Test',
        icon: '🏆',
        xpReward: 10
      })
      
      // Закрываем модальное окно
      store.closeBubbleModal()
      
      // Запускаем отложенные таймеры
      vi.runAllTimers()
      
      // Проверяем, что достижение показано
      expect(store.isAchievementModalOpen).toBe(true)
      expect(store.achievementData?.title).toBe('Test Achievement')
    })

    it('должен эмитить bubble-continue событие при continue', () => {
      store.openBubbleModal(testBubble)
      store.continueBubbleModal()
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'bubble-continue',
          detail: { bubbleId: testBubble.id }
        })
      )
      expect(store.isBubbleModalOpen).toBe(false)
    })
  })

  describe('📈 Level Up Modal', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    
    afterEach(() => {
      vi.useRealTimers()
    })

    it('должен открывать level up modal с уровнем', () => {
      store.openLevelUpModal(2)
      
      expect(store.isLevelUpModalOpen).toBe(true)
      expect(store.currentLevel).toBe(2)
    })

    it('должен открывать level up modal с данными', () => {
      const testData = {
        level: 2,
        title: 'Test Level',
        description: 'Test Description',
        icon: '🎯',
        currentXP: 100,
        xpGained: 50,
        unlockedFeatures: ['feature1']
      }
      
      store.openLevelUpModal(2, testData)
      
      expect(store.isLevelUpModalOpen).toBe(true)
      expect(store.levelUpData).toEqual(testData)
    })

    it('должен закрывать level up modal и вызывать processPendingAchievements', () => {
      // Открываем level up modal
      store.openLevelUpModal(2)
      
      // Добавляем достижение через queueOrShowAchievement
      store.queueOrShowAchievement({
        title: 'Test Achievement',
        description: 'Test',
        icon: '🏆',
        xpReward: 10
      })
      
      // Закрываем level up modal
      store.closeLevelUpModal()
      
      // Запускаем отложенные таймеры
      vi.runAllTimers()
      
      // Проверяем, что достижение показано
      expect(store.isAchievementModalOpen).toBe(true)
      expect(store.achievementData?.title).toBe('Test Achievement')
    })

    it('должен перемещать achievement в очередь при открытии level up modal', () => {
      const testAchievement = {
        title: 'Test Achievement',
        description: 'Test Description',
        icon: '🎯',
        xpReward: 50
      }
      
      store.openAchievementModal(testAchievement)
      store.openLevelUpModal(2)
      
      expect(store.isAchievementModalOpen).toBe(false)
      expect(store.achievementData).toBe(null)
    })
  })

  describe('🧠 Philosophy Modal', () => {
    const testQuestion = mockPhilosophyQuestions[0] as TestPhilosophyQuestion
    const testBubbleId = 'test-bubble-id'

    it('должен открывать philosophy modal с вопросом', () => {
      store.openPhilosophyModal(testQuestion, testBubbleId)
      
      expect(store.isPhilosophyModalOpen).toBe(true)
      expect(store.currentQuestion).toEqual(testQuestion)
    })

    it('должен закрывать philosophy modal и очищать состояние', () => {
      store.openPhilosophyModal(testQuestion, testBubbleId)
      store.closePhilosophyModal()
      
      expect(store.isPhilosophyModalOpen).toBe(false)
      expect(store.currentQuestion).toBe(null)
    })

    describe('Обработка ответов на философские вопросы', () => {
      beforeEach(() => {
        store.openPhilosophyModal(testQuestion, testBubbleId)
      })

      it('должен обрабатывать положительный ответ без level up', async () => {
        mockSessionStore.gainPhilosophyXP.mockResolvedValueOnce(false)
        
        await store.handlePhilosophyAnswer('agree')
        
        expect(mockSessionStore.gainPhilosophyXP).toHaveBeenCalled()
        expect(store.isPhilosophyModalOpen).toBe(false)
        expect(window.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'bubble-continue',
            detail: { bubbleId: testBubbleId, isPhilosophyNegative: false }
          })
        )
      })

      it('должен обрабатывать положительный ответ с level up', async () => {
        mockSessionStore.gainPhilosophyXP.mockResolvedValueOnce(true)
        mockSessionStore.currentLevel = 2
        
        await store.handlePhilosophyAnswer('agree')
        
        expect(mockSessionStore.gainPhilosophyXP).toHaveBeenCalled()
        expect(store.isPhilosophyModalOpen).toBe(false)
        expect(store.isLevelUpModalOpen).toBe(true)
        expect(store.levelUpData.level).toBe(2)
      })

      it('должен обрабатывать отрицательный ответ без game over', async () => {
        mockSessionStore.losePhilosophyLife.mockResolvedValueOnce(false)
        
        await store.handlePhilosophyAnswer('disagree')
        
        expect(mockSessionStore.losePhilosophyLife).toHaveBeenCalled()
        expect(store.isGameOverModalOpen).toBe(false)
        expect(window.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'bubble-continue',
            detail: { bubbleId: testBubbleId, isPhilosophyNegative: true }
          })
        )
      })

      it('должен обрабатывать отрицательный ответ с game over', async () => {
        mockSessionStore.losePhilosophyLife.mockResolvedValueOnce(true)
        
        await store.handlePhilosophyAnswer('disagree')
        
        expect(mockSessionStore.losePhilosophyLife).toHaveBeenCalled()
        expect(store.isGameOverModalOpen).toBe(true)
        expect(store.gameOverStats).toEqual({
          currentXP: mockSessionStore.currentXP,
          currentLevel: mockSessionStore.currentLevel
        })
      })
    })
  })

  describe('💀 Game Over Modal', () => {
    const stats = { currentXP: 500, currentLevel: 4 }
    
    beforeEach(() => {
      vi.useFakeTimers()
    })
    
    afterEach(() => {
      vi.useRealTimers()
    })

    it('должен открывать game over modal со статистикой', () => {
      store.openGameOverModal(stats)
      
      expect(store.isGameOverModalOpen).toBe(true)
      expect(store.gameOverStats).toEqual(stats)
    })

    it('должен закрывать game over modal и очищать состояние', () => {
      store.openGameOverModal(stats)
      store.closeGameOverModal()
      
      expect(store.isGameOverModalOpen).toBe(false)
      expect(store.gameOverStats).toBe(null)
    })

    it('должен вызывать processPendingAchievements при закрытии', () => {
      // Открываем game over modal
      store.openGameOverModal(stats)
      
      // Добавляем достижение через queueOrShowAchievement
      store.queueOrShowAchievement({
        title: 'Test Achievement',
        description: 'Test',
        icon: '🏆',
        xpReward: 10
      })
      
      // Закрываем game over modal
      store.closeGameOverModal()
      
      // Запускаем отложенные таймеры
      vi.runAllTimers()
      
      // Проверяем, что достижение показано
      expect(store.isAchievementModalOpen).toBe(true)
      expect(store.achievementData?.title).toBe('Test Achievement')
    })

    it('должен перезапускать игру и эмитить событие', async () => {
      store.openGameOverModal(stats)
      await store.restartGame()
      
      expect(mockSessionStore.resetSession).toHaveBeenCalled()
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'game-restart' })
      )
      expect(store.isGameOverModalOpen).toBe(false)
    })
  })

  describe('🏆 Achievement Modal & Queue System', () => {
    const testAchievement = {
      title: 'Test Achievement',
      description: 'Test Description',
      icon: '🏆',
      xpReward: 50
    }

    const testAchievement2 = {
      title: 'Second Achievement',
      description: 'Second Description',
      icon: '🎯',
      xpReward: 100
    }

    it('должен немедленно показывать achievement, если нет активных модалок', () => {
      store.queueOrShowAchievement(testAchievement)

      expect(store.isAchievementModalOpen).toBe(true)
      expect(store.achievementData).toEqual(testAchievement)
    })

    it('должен добавлять achievement в очередь, если открыт bubble modal', () => {
      store.openBubbleModal(mockBubbles[0])
      store.queueOrShowAchievement(testAchievement)

      expect(store.isAchievementModalOpen).toBe(false)
      expect(store.achievementData).toBe(null)
    })

    it('должен добавлять achievement в очередь, если открыт level up modal', () => {
      store.openLevelUpModal(2)
      store.queueOrShowAchievement(testAchievement)

      expect(store.isAchievementModalOpen).toBe(false)
    })

    it('должен обрабатывать очередь после закрытия модального окна', () => {
      // Ставим в очередь, пока модалка открыта
      store.openBubbleModal(mockBubbles[0])
      store.queueOrShowAchievement(testAchievement)

      // Закрываем модалку - должен показаться achievement
      store.closeBubbleModal()

      expect(store.isAchievementModalOpen).toBe(true)
      expect(store.achievementData).toEqual(testAchievement)
    })

    it('должен обрабатывать несколько ачивок в очереди', async () => {
      const achievement2: PendingAchievement = { title: 'Achievement 2', description: 'Desc 2', icon: '🏆', xpReward: 20 }
      
      // Открываем модалку и ставим 2 ачивки в очередь
      store.openLevelUpModal(2)
      store.queueOrShowAchievement(testAchievement)
      store.queueOrShowAchievement(achievement2)
      
      // Закрываем level up - должна показаться первая ачивка
      store.closeLevelUpModal()
      
      expect(store.isAchievementModalOpen).toBe(true)
      expect(store.achievementData).toEqual(testAchievement)
      
      // Закрываем первую ачивку - должна показаться вторая
      store.closeAchievementModal()
      
      // Используем setTimeout, т.к. processPendingAchievements вызывается асинхронно
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(store.isAchievementModalOpen).toBe(true)
      expect(store.achievementData).toEqual(achievement2)
    })
  })

  describe('🏆 Achievement Queue System', () => {
    const testAchievement1: PendingAchievement = {
      title: 'First Achievement',
      description: 'First Description',
      icon: '🏆',
      xpReward: 50
    }

    const testAchievement2: PendingAchievement = {
      title: 'Second Achievement',
      description: 'Second Description',
      icon: '🥈',
      xpReward: 30
    }

    it('должен правильно обрабатывать очередь достижений при закрытии модальных окон', async () => {
      // Открываем level up modal и добавляем достижения в очередь
      store.openLevelUpModal(2)
      store.queueOrShowAchievement(testAchievement1)
      store.queueOrShowAchievement(testAchievement2)
      
      // Проверяем, что достижения в очереди
      expect(store.$state.isAchievementModalOpen).toBe(false)
      expect(store.$state.achievementData).toBe(null)
      
      // Закрываем level up modal
      store.closeLevelUpModal()
      
      // Ждем обработки очереди
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Проверяем, что первое достижение показано
      expect(store.$state.isAchievementModalOpen).toBe(true)
      expect(store.$state.achievementData).toEqual(testAchievement1)
      
      // Закрываем первое достижение
      store.closeAchievementModal()
      
      // Ждем обработки очереди
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Проверяем, что второе достижение показано
      expect(store.$state.isAchievementModalOpen).toBe(true)
      expect(store.$state.achievementData).toEqual(testAchievement2)
    })

    it('должен сохранять порядок достижений в очереди', async () => {
      store.openLevelUpModal(2)
      
      // Добавляем достижения в определенном порядке
      store.queueOrShowAchievement(testAchievement1)
      store.queueOrShowAchievement(testAchievement2)
      
      // Закрываем level up modal и проверяем порядок
      store.closeLevelUpModal()
      
      // Ждем обработки очереди
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(store.$state.achievementData).toEqual(testAchievement1)
      
      store.closeAchievementModal()
      
      // Ждем обработки очереди
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(store.$state.achievementData).toEqual(testAchievement2)
    })

    it('должен правильно обрабатывать добавление достижения при отсутствии активных модальных окон', () => {
      store.queueOrShowAchievement(testAchievement1)
      
      expect(store.$state.isAchievementModalOpen).toBe(true)
      expect(store.$state.achievementData).toEqual(testAchievement1)
    })

    it('должен обрабатывать пустую очередь достижений', () => {
      store.processPendingAchievements()
      
      expect(store.$state.isAchievementModalOpen).toBe(false)
      expect(store.$state.achievementData).toBe(null)
    })
  })

  describe('🔄 Интеграционные сценарии', () => {
    it('должен правильно работать complete user flow', async () => {
      const testBubble = mockBubbles[0]
      const testQuestion = mockPhilosophyQuestions[0]
      const achievement = {
        title: 'Flow Achievement',
        description: 'Flow Description',
        icon: '🌟',
        xpReward: 75
      }

      // 1. Открываем bubble modal
      store.openBubbleModal(testBubble)
      expect(store.isBubbleModalOpen).toBe(true)

      // 2. Добавляем achievement в очередь
      store.queueOrShowAchievement(achievement)
      expect(store.isAchievementModalOpen).toBe(false) // В очереди

      // 3. Закрываем bubble modal
      store.closeBubbleModal()
      expect(store.isAchievementModalOpen).toBe(true) // Achievement показан

      // 4. Открываем philosophy modal (achievement остается открытым)
      store.openPhilosophyModal(testQuestion, 'bubble-id')
      expect(store.isPhilosophyModalOpen).toBe(true)
      expect(store.isAchievementModalOpen).toBe(true)

      // 5. Отвечаем положительно с level up
      mockSessionStore.gainPhilosophyXP.mockResolvedValueOnce(true)
      await store.handlePhilosophyAnswer('agree')

      expect(store.isLevelUpModalOpen).toBe(true)
      expect(store.isAchievementModalOpen).toBe(false) // Achievement в очереди

      // 6. Закрываем level up
      store.closeLevelUpModal()
      expect(store.isAchievementModalOpen).toBe(true) // Achievement показан снова
    })

    it('должен обрабатывать edge case с пустой очередью', () => {
      store.processPendingAchievements()
      expect(store.isAchievementModalOpen).toBe(false)
    })

    it('должен игнорировать processPendingAchievements если есть активные модалки', () => {
      store.openWelcome()
      store.processPendingAchievements()
      expect(store.isAchievementModalOpen).toBe(false)
    })
  })

  describe('🔧 Edge Cases', () => {
    it('должен обрабатывать handlePhilosophyAnswer без currentQuestion', async () => {
      await expect(store.handlePhilosophyAnswer('agree')).resolves.not.toThrow()
    })

    it('должен обрабатывать continueBubbleModal без currentBubble', () => {
      // Очищаем предыдущие вызовы
      (window.dispatchEvent as any).mockClear()
      
      // Вызываем метод без установки currentBubble
      expect(() => store.continueBubbleModal()).not.toThrow()
      
      // Проверяем, что dispatchEvent не был вызван с событием bubble-continue
      expect(window.dispatchEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'bubble-continue' })
      )
    })

    it('должен обрабатывать openLevelUpModal без данных', () => {
      store.openLevelUpModal(3)
      
      // При вызове без data, levelUpData должно обновляться по level
      expect(store.currentLevel).toBe(3)
      expect(store.levelUpData.title).toBe('')
      expect(store.levelUpData.icon).toBe('👋')
    })

    it('должен обрабатывать частичные данные в openLevelUpModal', () => {
      store.openLevelUpModal(4, { title: 'Custom Title' })
      
      expect(store.levelUpData.level).toBe(4)
      expect(store.levelUpData.title).toBe('Custom Title')
      expect(store.levelUpData.icon).toBe('👋') // Default value
    })
  })

  describe('🎲 Game Over & Restart', () => {
    const stats = { currentXP: 500, currentLevel: 4 }

    it('должен открывать game over modal', () => {
      store.openGameOverModal(stats)
      expect(store.isGameOverModalOpen).toBe(true)
      expect(store.gameOverStats).toEqual(stats)
    })

    it('должен закрывать game over modal', () => {
      store.openGameOverModal(stats)
      store.closeGameOverModal()
      expect(store.isGameOverModalOpen).toBe(false)
      expect(store.gameOverStats).toBe(null)
    })
    
    it('должен перезапускать игру', async () => {
      await store.restartGame()
      
      expect(mockSessionStore.resetSession).toHaveBeenCalled()
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'game-restart' })
      )
      expect(store.isGameOverModalOpen).toBe(false)
    })
  })

  describe('🪟 Window Events', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.spyOn(window, 'dispatchEvent')
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    it('должен отправлять process-shake-queue событие при закрытии последнего модального окна', async () => {
      // Открываем модальное окно
      store.openWelcome()
      expect(store.$state.isWelcomeOpen).toBe(true)
      
      // Проверяем, что нет других открытых модальных окон
      expect(store.$state.isBubbleModalOpen).toBe(false)
      expect(store.$state.isLevelUpModalOpen).toBe(false)
      expect(store.$state.isPhilosophyModalOpen).toBe(false)
      expect(store.$state.isGameOverModalOpen).toBe(false)
      expect(store.$state.isAchievementModalOpen).toBe(false)
      
      // Закрываем модальное окно
      store.closeWelcome()
      
      // Ждем следующего тика для обработки watch-эффектов
      await vi.advanceTimersByTime(0)
      
      // Проверяем, что событие было отправлено
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'process-shake-queue'
        })
      )
    })

    it('должен отправлять bubble-continue событие с правильными данными', () => {
      const testBubble = mockBubbles[0]
      
      // Открываем bubble modal
      store.openBubbleModal(testBubble)
      
      // Продолжаем (закрываем с удалением пузыря)
      store.continueBubbleModal()
      
      // Проверяем, что событие было отправлено с правильным ID пузыря
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'bubble-continue',
          detail: { bubbleId: testBubble.id }
        })
      )
    })

    it('должен отправлять game-restart событие при перезапуске игры', async () => {
      // Открываем game over modal
      store.openGameOverModal({ currentXP: 100, currentLevel: 2 })
      
      // Перезапускаем игру
      await store.restartGame()
      
      // Проверяем, что событие было отправлено
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'game-restart'
        })
      )
    })
  })
}) 