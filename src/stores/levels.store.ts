import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { NormalizedLevel } from '@/types/normalized'

import { api } from '@/api'

export const useLevelsStore = defineStore('levelsStore', () => {
  const levels = ref<NormalizedLevel[]>([])
  const currentLevel = ref(1)
  const isLoading = ref(true)

  const loadLevels = async () => {
    isLoading.value = true

    try {
      const { data } = await api.getLevels()
      levels.value = data
    } catch (err) {
      console.error('❌ Ошибка загрузки уровней:', err)
    } finally {
      isLoading.value = false
    }
  }

  const getLevelByNumber = (level: number) => {
    return levels.value.find((l: NormalizedLevel) => l.level === level)
  }

  return {
    levels,
    isLoading,
    currentLevel,
    getLevelByNumber,
    loadLevels
  }
}) 