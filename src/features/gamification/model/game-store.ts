import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Achievement, ContentLevel, Level } from '@shared/types'
import { GAME_CONFIG } from '@shared/config/game-config'
import { api } from '@shared/api'

export const useGameStore = defineStore('game', () => {
  const achievements = ref<Achievement[]>([])
  const contentLevels = ref<ContentLevel[]>([])
  const currentLevel = ref(1)
  const currentXP = ref(0)
  const levels = ref<Level[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // Загружаем и обновляем уровни с актуальными XP требованиями
  const loadContentLevels = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const data = await api.getContentLevels()
      
      // Обновляем XP требования из game-config
      const levelsWithUpdatedXP = data.levels.map((level: Level) => {
        const xpRequiredMap = {
          1: 0,  // Первый уровень - стартовый
          2: GAME_CONFIG.levelRequirements[2],
          3: GAME_CONFIG.levelRequirements[3],
          4: GAME_CONFIG.levelRequirements[4],
          5: GAME_CONFIG.levelRequirements[5]
        }
        
        return {
          ...level,
          xpRequired: xpRequiredMap[level.level as keyof typeof xpRequiredMap] || level.xpRequired
        } as ContentLevel
      })
      
      contentLevels.value = levelsWithUpdatedXP
      levels.value = data.levels
      console.log('📚 Loaded levels:', levels.value.length)
    } catch (err) {
      console.error('❌ Error loading content levels:', err)
      error.value = 'Failed to load content levels'
    } finally {
      isLoading.value = false
    }
  }

  const getLevelByNumber = (level: number) => {
    return contentLevels.value.find(l => l.level === level)
  }

  // Система достижений
  const initializeAchievements = () => {
    achievements.value = [
      {
        id: 'tough-bubble-popper',
        name: 'Крепыш',
        description: 'Вы пробили свой первый крепкий пузырь! Настойчивость - ключ к успеху в разработке.',
        icon: '💪',
        xpReward: GAME_CONFIG.achievementXP.intermediate,
        isUnlocked: false
      },
      {
        id: 'secret-bubble-discoverer',
        name: 'Искатель секретов',
        description: 'Вы нашли и активировали скрытый пузырь!',
        icon: '🕵️',
        xpReward: GAME_CONFIG.achievementXP.advanced,
        isUnlocked: false
      },
      {
        id: 'year-jumper',
        name: 'Путешественник во времени',
        description: 'Вы перешли на следующий год, не лопнув все пузыри!',
        icon: '⏭️',
        xpReward: GAME_CONFIG.achievementXP.advanced,
        isUnlocked: false
      },
      {
        id: 'completionist',
        name: 'Перфекционист',
        description: 'Вы лопнули все доступные пузыри в году!',
        icon: '🏆',
        xpReward: GAME_CONFIG.achievementXP.master,
        isUnlocked: false
      },
      {
        id: 'philosophy-master',
        name: 'Философ',
        description: 'Правильно ответили на первый философский вопрос! Мудрость приходит к тем, кто готов размышлять.',
        icon: '🤔',
        isUnlocked: false,
        xpReward: GAME_CONFIG.achievementXP.basic
      },
      {
        id: 'on-the-edge',
        name: 'На краю',
        description: 'У вас осталась всего одна жизнь! Иногда лучшие решения принимаются под давлением.',
        icon: '🔥',
        isUnlocked: false,
        xpReward: GAME_CONFIG.achievementXP.basic
      },
      {
        id: 'first-level-master',
        name: 'Первопроходец',
        description: 'Вы прошли первый уровень! Путешествие в тысячу миль начинается с первого шага.',
        icon: '🚀',
        isUnlocked: false,
        xpReward: GAME_CONFIG.achievementXP.basic
      },
      // Достижения за количество исследованных пузырей
      {
        id: 'bubble-explorer-10',
        name: 'Исследователь',
        description: 'Изучили 10 пузырей технологий! Любопытство - двигатель прогресса.',
        icon: '🔍',
        isUnlocked: false,
        xpReward: GAME_CONFIG.achievementXP.basic
      },
      {
        id: 'bubble-explorer-30',
        name: 'Эксперт по технологиям',
        description: 'Изучили 30 пузырей! Широкий кругозор - основа мастерства.',
        icon: '🎯',
        isUnlocked: false,
        xpReward: GAME_CONFIG.achievementXP.intermediate
      },
      {
        id: 'bubble-explorer-50',
        name: 'Мастер всех технологий',
        description: 'Изучили 50 пузырей! Вы настоящий гуру в мире разработки.',
        icon: '🏆',
        isUnlocked: false,
        xpReward: GAME_CONFIG.achievementXP.advanced
      },
      // Достижение за финальный уровень
      {
        id: 'final-level-master',
        name: 'Финалист',
        description: 'Достигли максимального уровня! Вы прошли весь путь развития и стали настоящим экспертом.',
        icon: '🎖️',
        isUnlocked: false,
        xpReward: GAME_CONFIG.achievementXP.master
      }
    ]
  }

  const unlockAchievement = async (achievementId: string): Promise<Achievement | null> => {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (achievement && !achievement.isUnlocked) {
      achievement.isUnlocked = true
      achievement.unlockedAt = new Date().toISOString()
      console.log('🏆 Достижение разблокировано:', achievement.name)

      // Начисляем XP за достижение
      const { useSessionStore } = await import('@entities/user-session/model/session-store')
      const { useModalStore } = await import('@shared/stores/modal-store')
      const sessionStore = useSessionStore()
      const modalStore = useModalStore()

      await sessionStore.gainXP(achievement.xpReward)
      
      modalStore.queueOrShowAchievement({
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      })

      return achievement
    }
    return null
  }

  const currentLevelData = computed(() => {
    return levels.value.find(level => level.level === currentLevel.value)
  })

  const nextLevelXP = computed(() => {
    const nextLevel = levels.value.find(level => level.level === currentLevel.value + 1)
    return nextLevel?.xpRequired || Infinity
  })

  const progress = computed(() => {
    const currentLevelObj = levels.value.find(level => level.level === currentLevel.value)
    const nextLevelObj = levels.value.find(level => level.level === currentLevel.value + 1)
    
    if (!currentLevelObj || !nextLevelObj) return 0
    
    const currentLevelXP = currentLevelObj.xpRequired
    const nextLevelXP = nextLevelObj.xpRequired
    const xpInCurrentLevel = currentXP.value - currentLevelXP
    const xpRequiredForNextLevel = nextLevelXP - currentLevelXP
    
    return (xpInCurrentLevel / xpRequiredForNextLevel) * 100
  })

  function addXP(amount: number) {
    currentXP.value += amount
    checkLevelUp()
  }

  function checkLevelUp() {
    while (currentXP.value >= nextLevelXP.value) {
      currentLevel.value++
    }
  }

  // Инициализируем уровни и достижения при создании store
  initializeAchievements()
  loadContentLevels() // Асинхронная загрузка уровней

  return {
    achievements,
    contentLevels,
    getLevelByNumber,
    loadContentLevels,
    unlockAchievement,
    currentLevel,
    currentXP,
    currentLevelData,
    nextLevelXP,
    progress,
    addXP,
    isLoading,
    error
  }
}) 