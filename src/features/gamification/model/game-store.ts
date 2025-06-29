import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Achievement, ContentLevel } from '@shared/types'
import contentLevelsData from '@shared/data/contentLevels.json'
import { GAME_CONFIG } from '@shared/config/game-config'

export const useGameStore = defineStore('game', () => {
  const achievements = ref<Achievement[]>([])
  const contentLevels = ref<ContentLevel[]>([])

  // Загружаем и обновляем уровни с актуальными XP требованиями
  const loadContentLevels = () => {
    const levelsWithUpdatedXP = contentLevelsData.levels.map((level, index) => {
      // Получаем XP требования из game-config
      const xpRequiredMap = {
        1: 0,  // Первый уровень - стартовый
        2: GAME_CONFIG.XP_LEVELS.LEVEL_1, // 22 XP
        3: GAME_CONFIG.XP_LEVELS.LEVEL_2, // 44 XP  
        4: GAME_CONFIG.XP_LEVELS.LEVEL_3, // 66 XP
        5: GAME_CONFIG.XP_LEVELS.LEVEL_4  // 88 XP
      }
      
      return {
        ...level,
        xpRequired: xpRequiredMap[level.level as keyof typeof xpRequiredMap] || level.xpRequired
      } as ContentLevel
    })
    
    contentLevels.value = levelsWithUpdatedXP
    console.log('📊 Загружены уровни контента:', contentLevels.value.map(l => ({ level: l.level, title: l.title, xpRequired: l.xpRequired })))
  }

  const getLevelByNumber = (level: number) => {
    return contentLevels.value.find(l => l.level === level)
  }

  // Система достижений
  const initializeAchievements = () => {
    achievements.value = [
      {
        id: 'secret-bubble-discoverer',
        name: 'Секретный исследователь',
        description: 'Вы нашли скрытый пузырь! Настоящие таланты умеют находить возможности там, где их не видят другие.',
        icon: '🕵️',
        isUnlocked: false,
        xpReward: 10
      },
      {
        id: 'philosophy-master',
        name: 'Философ',
        description: 'Правильно ответили на первый философский вопрос! Мудрость приходит к тем, кто готов размышлять.',
        icon: '🤔',
        isUnlocked: false,
        xpReward: 10
      },
      {
        id: 'on-the-edge',
        name: 'На краю',
        description: 'У вас осталась всего одна жизнь! Иногда лучшие решения принимаются под давлением.',
        icon: '🔥',
        isUnlocked: false,
        xpReward: 10
      },
      {
        id: 'first-level-master',
        name: 'Первопроходец',
        description: 'Достигли 1-го уровня! Путешествие в тысячу миль начинается с первого шага.',
        icon: '🚀',
        isUnlocked: false,
        xpReward: 10
      },
      // Достижения за количество исследованных пузырей
      {
        id: 'bubble-explorer-10',
        name: 'Исследователь',
        description: 'Изучили 10 пузырей технологий! Любопытство - двигатель прогресса.',
        icon: '🔍',
        isUnlocked: false,
        xpReward: 10
      },
      {
        id: 'bubble-explorer-30',
        name: 'Эксперт по технологиям',
        description: 'Изучили 30 пузырей! Широкий кругозор - основа мастерства.',
        icon: '🎯',
        isUnlocked: false,
        xpReward: 15
      },
      {
        id: 'bubble-explorer-50',
        name: 'Мастер всех технологий',
        description: 'Изучили 50 пузырей! Вы настоящий гуру в мире разработки.',
        icon: '🏆',
        isUnlocked: false,
        xpReward: 20
      },
      // Достижение за финальный уровень
      {
        id: 'final-level-master',
        name: 'Финалист',
        description: 'Достигли максимального уровня! Вы прошли весь путь развития и стали настоящим экспертом.',
        icon: '🎖️',
        isUnlocked: false,
        xpReward: 25
      },
      // Достижение за первый крепкий пузырь
      {
        id: 'first-tough-bubble',
        name: 'Упорство',
        description: 'Разбили первый крепкий пузырь! Настойчивость - ключ к успеху в разработке.',
        icon: '💪',
        isUnlocked: false,
        xpReward: 15
      }
    ]
  }

  const unlockAchievement = (achievementId: string): Achievement | null => {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (achievement && !achievement.isUnlocked) {
      achievement.isUnlocked = true
      achievement.unlockedAt = new Date()
      console.log('🏆 Достижение разблокировано:', achievement.name)
      return achievement
    }
    return null
  }

  // Инициализируем уровни и достижения при создании store
  loadContentLevels()
  initializeAchievements()

  return {
    achievements,
    contentLevels,
    getLevelByNumber,
    loadContentLevels,
    unlockAchievement
  }
}) 