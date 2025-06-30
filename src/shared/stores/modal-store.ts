import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Bubble, PhilosophyQuestion } from '@shared/types'
import { useSessionStore } from '@/entities/user-session/model/session-store'
import { useGameStore } from '@/features/gamification/model/game-store'

interface LevelUpData {
  level: number
  title: string
  description: string
  icon: string
  currentXP: number
  xpGained: number
  unlockedFeatures: string[]
}

interface PendingAchievement {
  title: string
  description: string
  icon: string
  xpReward: number
}

export const useModalStore = defineStore('modal', () => {
  const sessionStore = useSessionStore()
  const gameStore = useGameStore()
  
  // Welcome Modal
  const isWelcomeOpen = ref(false)
  
  // Bubble Modal
  const isBubbleModalOpen = ref(false)
  const currentBubble = ref<Bubble | null>(null)
  
  // Level Up Modal
  const isLevelUpModalOpen = ref(false)
  const currentLevel = ref(1)
  const levelUpData = ref<LevelUpData>({
    level: 1,
    title: '',
    description: '',
    icon: '👋',
    currentXP: 0,
    xpGained: 0,
    unlockedFeatures: []
  })
  
  // Philosophy Question Modal
  const isPhilosophyModalOpen = ref(false)
  const currentQuestion = ref<PhilosophyQuestion | null>(null)
  const philosophyBubbleId = ref<string | null>(null)
  
  // Game Over Modal
  const isGameOverModalOpen = ref(false)
  const gameOverStats = ref<{ currentXP: number; currentLevel: number } | null>(null)
  
  // Achievement Modal
  const isAchievementModalOpen = ref(false)
  const achievementData = ref<{ title: string; description: string; icon: string; xpReward: number } | null>(null)
  
  // Система отложенных достижений
  const pendingAchievements = ref<PendingAchievement[]>([])
  
  // Computed для проверки открытых модалок (исключая панель достижений)
  const hasActiveModals = computed(() => {
    return isWelcomeOpen.value || 
           isBubbleModalOpen.value || 
           isLevelUpModalOpen.value || 
           isPhilosophyModalOpen.value || 
           isGameOverModalOpen.value ||
           isAchievementModalOpen.value
  })
  
  // Функция для добавления достижения в очередь или показа сразу
  const queueOrShowAchievement = (achievement: PendingAchievement) => {
    // Если LevelUp модалка открыта - всегда добавляем в очередь  
    if (isLevelUpModalOpen.value) {
      pendingAchievements.value.push(achievement)
      return
    }
    
    if (hasActiveModals.value) {
      // Если есть другие открытые модалки - добавляем в очередь
      pendingAchievements.value.push(achievement)
    } else {
      // Если модалок нет - показываем сразу
      achievementData.value = achievement
      isAchievementModalOpen.value = true
    }
  }
  
  // Функция для обработки очереди достижений
  const processPendingAchievements = () => {
    if (!hasActiveModals.value && pendingAchievements.value.length > 0) {
      const nextAchievement = pendingAchievements.value.shift()
      if (nextAchievement) {
        achievementData.value = nextAchievement
        isAchievementModalOpen.value = true
      }
    }
  }

  // Welcome Modal Actions
  const openWelcome = () => {
    isWelcomeOpen.value = true
  }

  const closeWelcome = () => {
    isWelcomeOpen.value = false
    // Сохраняем что welcome модалка была показана
    localStorage.setItem('bubbleme-welcome-shown', 'true')
    processPendingAchievements()
  }

  // Проверяем нужно ли показать welcome модалку
  const shouldShowWelcome = () => {
    return !localStorage.getItem('bubbleme-welcome-shown')
  }

  // Bubble Modal Actions
  const openBubbleModal = (bubble: Bubble) => {
    currentBubble.value = bubble
    isBubbleModalOpen.value = true
  }

  const closeBubbleModal = () => {
    isBubbleModalOpen.value = false
    currentBubble.value = null
    processPendingAchievements()
  }

  const continueBubbleModal = () => {
    const bubbleId = currentBubble.value?.id
    closeBubbleModal()
    
    // Эмитим событие для удаления пузыря
    if (bubbleId) {
      // Используем кастомное событие для уведомления о необходимости удаления пузыря
      window.dispatchEvent(new CustomEvent('bubble-continue', { detail: { bubbleId } }))
    }
  }

  // Level Up Modal Actions  
  const openLevelUpModal = (level: number, data?: Partial<LevelUpData>) => {
    // Если открыта achievement модалка - добавляем ее в очередь и закрываем
    if (isAchievementModalOpen.value && achievementData.value) {
      pendingAchievements.value.unshift(achievementData.value) // Добавляем в начало очереди
      isAchievementModalOpen.value = false
      achievementData.value = null
    }
    
    currentLevel.value = level
    
    if (data) {
      levelUpData.value = {
        level: data.level || level,
        title: data.title || '',
        description: data.description || '',
        icon: data.icon || '👋',
        currentXP: data.currentXP || 0,
        xpGained: data.xpGained || 0,
        unlockedFeatures: data.unlockedFeatures || []
      }
    }
    
    isLevelUpModalOpen.value = true
  }

  const closeLevelUpModal = () => {
    isLevelUpModalOpen.value = false
    processPendingAchievements()
  }

  // Philosophy Question Modal Actions
  const openPhilosophyModal = (question: PhilosophyQuestion, bubbleId?: string) => {
    currentQuestion.value = question
    philosophyBubbleId.value = bubbleId || null
    isPhilosophyModalOpen.value = true

  }

  const closePhilosophyModal = () => {
    isPhilosophyModalOpen.value = false
    currentQuestion.value = null
    philosophyBubbleId.value = null
    processPendingAchievements()
  }

  const handlePhilosophyAnswer = async (answer: 'agree' | 'disagree') => {
    if (!currentQuestion.value) return
    
    const bubbleId = philosophyBubbleId.value
    const isNegativeAnswer = answer === 'disagree'
    

    
    if (answer === 'agree') {
      // Правильный ответ - дать XP
      const leveledUp = await sessionStore.gainPhilosophyXP()
      if (leveledUp) {
        // Получаем иконку для уровня
        const getLevelIcon = (level: number): string => {
          switch (level) {
            case 1: return '👋'
            case 2: return '🤔'
            case 3: return '📚'
            case 4: return '🤝'
            case 5: return '🤜🤛'
            default: return '⭐'
          }
        }
        
        // Получаем данные уровня из contentLevels
        const levelData = gameStore.getLevelByNumber(sessionStore.currentLevel)
        
        // Создаем данные для level-up модалки
        const levelUpData = {
          level: sessionStore.currentLevel,
          title: levelData?.title || `Уровень ${sessionStore.currentLevel}`,
          description: levelData?.description || 'Новый уровень разблокирован за правильный ответ на философский вопрос!',
          icon: getLevelIcon(sessionStore.currentLevel),
          currentXP: sessionStore.currentXP,
          xpGained: 10, // XP за философский пузырь
          unlockedFeatures: (levelData as any)?.unlockedFeatures || []
        }
        
        openLevelUpModal(sessionStore.currentLevel, levelUpData)
      }
      
    } else {
      // Неправильный ответ - забрать жизнь (без XP)
      const gameOver = await sessionStore.losePhilosophyLife()
      if (gameOver) {
        openGameOverModal({
          currentXP: sessionStore.currentXP,
          currentLevel: sessionStore.currentLevel
        })
      }
      
    }
    
    closePhilosophyModal()
    
    // Пузырь всегда лопается независимо от ответа
    if (bubbleId) {

      window.dispatchEvent(new CustomEvent('bubble-continue', { 
        detail: { 
          bubbleId, 
          isPhilosophyNegative: isNegativeAnswer 
        } 
      }))
    } else {
      console.warn('⚠️ No bubbleId found for philosophy question!')
    }
  }

  // Game Over Modal Actions
  const openGameOverModal = (stats: { currentXP: number; currentLevel: number }) => {
    gameOverStats.value = stats
    isGameOverModalOpen.value = true
  }

  const closeGameOverModal = () => {
    isGameOverModalOpen.value = false
    gameOverStats.value = null
    processPendingAchievements()
  }

  const restartGame = async () => {
    await sessionStore.resetSession()
    closeGameOverModal()
    
    // Эмитим событие для перезагрузки с 2015 года
    window.dispatchEvent(new CustomEvent('game-restart'))
  }

  // Achievement Modal Actions
  const openAchievementModal = (achievement: { title: string; description: string; icon: string; xpReward: number }) => {
    achievementData.value = achievement
    isAchievementModalOpen.value = true
  }

  const closeAchievementModal = () => {
    isAchievementModalOpen.value = false
    achievementData.value = null
    processPendingAchievements()
  }

  return {
    // State
    isWelcomeOpen,
    isBubbleModalOpen,
    currentBubble,
    isLevelUpModalOpen,
    currentLevel,
    levelUpData,
    isPhilosophyModalOpen,
    currentQuestion,
    isGameOverModalOpen,
    gameOverStats,
    isAchievementModalOpen,
    achievementData,
    
    // Actions
    openWelcome,
    closeWelcome,
    shouldShowWelcome,
    openBubbleModal,
    closeBubbleModal,
    continueBubbleModal,
    openLevelUpModal,
    closeLevelUpModal,
    openPhilosophyModal,
    closePhilosophyModal,
    handlePhilosophyAnswer,
    openGameOverModal,
    closeGameOverModal,
    restartGame,
    openAchievementModal,
    closeAchievementModal,
    queueOrShowAchievement,
    processPendingAchievements
  }
}) 