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

  // Инициализируем уровни при создании store
  loadContentLevels()

  return {
    achievements,
    contentLevels,
    getLevelByNumber,
    loadContentLevels
  }
}) 