import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Bubble } from '@/types/data'
import type { Question } from '@/types/data'
import { useSessionStore } from '@/stores/session.store'
import { useLevelStore } from '@/stores/levels.store'
import type { NormalizedBubble } from '@/types/normalized'

interface LevelUpData {
  level: number
  title: string
  description: string
  icon: string
  currentXP: number
  xpGained: number
  unlockedFeatures: string[]
}

export interface PendingAchievement {
  title: string
  description: string
  icon: string
  xpReward: number
}

export const useModalStore = defineStore('modalStore', () => {
  const sessionStore = useSessionStore()
  const gameStore = useLevelStore()
  
  // Welcome Modal
  const isWelcomeOpen = ref(false)
  
  // Bubble Modal
  const isBubbleModalOpen = ref(false)
  const currentBubble = ref<NormalizedBubble | null>(null)
  
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
  const currentQuestion = ref<Question | null>(null)
  const philosophyBubbleId = ref<NormalizedBubble['id']>()
  
  // Game Over Modal
  const isGameOverModalOpen = ref(false)
  const gameOverStats = ref<{ currentXP: number; currentLevel: number } | null>(null)
  
  // Achievement Modal
  const isAchievementModalOpen = ref(false)
  const achievementData = ref<PendingAchievement | null>(null)
  
  const isAnyModalOpen = computed(() => {
    return isWelcomeOpen.value ||
           isBubbleModalOpen.value ||
           isLevelUpModalOpen.value ||
           isPhilosophyModalOpen.value ||
           isGameOverModalOpen.value ||
           isAchievementModalOpen.value
  })

  watch(isAnyModalOpen, (isModalVisible, wasPreviouslyVisible) => {
    if (!isModalVisible && wasPreviouslyVisible) {
      // Когда последнее модальное окно закрывается, отправляем событие для обработки очереди анимаций
      window.dispatchEvent(new CustomEvent('process-shake-queue'))
      // Обрабатываем очередь достижений
      processPendingAchievements()
    }
  })

  // Система отложенных достижений
  const pendingAchievements = ref<PendingAchievement[]>([])
  
  // Computed для проверки открытых модалок (исключая AchievementModal)
  const hasActiveModals = computed(() => {
    return isWelcomeOpen.value || 
           isBubbleModalOpen.value || 
           isLevelUpModalOpen.value || 
           isPhilosophyModalOpen.value || 
           isGameOverModalOpen.value
  })
  
  // Функция для добавления достижения в очередь или показа сразу
  const queueOrShowAchievement = (achievement: PendingAchievement) => {
    console.log(`🎯 queueOrShowAchievement called for: ${achievement.title}`)
    console.log(`📊 Modal states - levelUp: ${isLevelUpModalOpen.value}, hasActive: ${hasActiveModals.value}, achievement: ${isAchievementModalOpen.value}`)
    
    // Если LevelUp модалка открыта - всегда добавляем в очередь  
    if (isLevelUpModalOpen.value) {
      pendingAchievements.value.push(achievement)
      console.log(`📥 Achievement queued (LevelUp open): ${achievement.title}`)
      return
    }
    
    if (hasActiveModals.value) {
      // Если есть другие открытые модалки - добавляем в очередь
      pendingAchievements.value.push(achievement)
      console.log(`📥 Achievement queued (other modals open): ${achievement.title}`)
    } else {
      // Если модалок нет - показываем сразу
      achievementData.value = achievement
      isAchievementModalOpen.value = true
      console.log(`🎉 Achievement shown immediately: ${achievement.title}`)
    }
  }
  
  // Функция для обработки очереди достижений
  const processPendingAchievements = () => {
    console.log(`🔄 processPendingAchievements called. Queue length: ${pendingAchievements.value.length}, hasActiveModals: ${hasActiveModals.value}`)
    
    if (!hasActiveModals.value && pendingAchievements.value.length > 0) {
      const nextAchievement = pendingAchievements.value.shift()
      if (nextAchievement) {
        achievementData.value = nextAchievement
        isAchievementModalOpen.value = true
        console.log(`▶️ Processing queued achievement: ${nextAchievement.title}`)
      }
    }
  }

  // Welcome Modal Actions
  const openWelcome = () => {
    isWelcomeOpen.value = true
  }

  const closeWelcome = () => {
    isWelcomeOpen.value = false
    processPendingAchievements()
    
    // Отправляем событие для обработки очереди анимаций
    window.dispatchEvent(new CustomEvent('process-shake-queue'))
  }

  // Bubble Modal Actions
  const openBubbleModal = (bubble: NormalizedBubble) => {
    currentBubble.value = bubble
    isBubbleModalOpen.value = true
  }

  const closeBubbleModal = () => {
    isBubbleModalOpen.value = false
    currentBubble.value = null
    
    // Явно вызываем processPendingAchievements для тестов
    processPendingAchievements()
    
    // Отправляем событие для обработки очереди анимаций
    window.dispatchEvent(new CustomEvent('process-shake-queue'))
  }

  const continueBubbleModal = () => {
    const bubbleId = currentBubble.value?.id
    closeBubbleModal()
    
    // Эмитим событие для удаления пузыря
    if (bubbleId) {
      // Используем кастомное событие для уведомления о необходимости удаления пузыря
      window.dispatchEvent(new CustomEvent('bubble-continue', { detail: { bubbleId } }))
    }
    
    processPendingAchievements()
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
    
    // Явно вызываем processPendingAchievements для тестов
    processPendingAchievements()
    
    // Отправляем событие для обработки очереди анимаций
    window.dispatchEvent(new CustomEvent('process-shake-queue'))
  }

  // Philosophy Question Modal Actions
  const openPhilosophyModal = (question: Question, bubbleId?: NormalizedBubble['id']) => {
    currentQuestion.value = question
    philosophyBubbleId.value = bubbleId
    isPhilosophyModalOpen.value = true

  }

  const closePhilosophyModal = () => {
    isPhilosophyModalOpen.value = false
    currentQuestion.value = null
    philosophyBubbleId.value = 0
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
          xpGained: 5, // XP только за достижение (базовый XP за пузырь начисляется отдельно)
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
    
    // Явно вызываем processPendingAchievements для тестов
    processPendingAchievements()
    
    // Отправляем событие для обработки очереди анимаций
    window.dispatchEvent(new CustomEvent('process-shake-queue'))
  }

  const restartGame = async () => {
    await sessionStore.startSession()
    closeGameOverModal()
    
    // Эмитим событие для перезагрузки с 2015 года
    window.dispatchEvent(new CustomEvent('game-restart'))
  }

  // Achievement Modal Actions
  const openAchievementModal = (achievement: PendingAchievement) => {
    queueOrShowAchievement(achievement)
  }

  const closeAchievementModal = () => {
    console.log('❌ closeAchievementModal called')
    isAchievementModalOpen.value = false
    achievementData.value = null
    
    // Откладываем обработку очереди, чтобы избежать гонки состояний
    console.log('⏰ Scheduling processPendingAchievements')
    // Используем прямой вызов метода для тестов
    setTimeout(() => processPendingAchievements(), 0)
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