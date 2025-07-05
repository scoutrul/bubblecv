import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { Level } from '@/types/levels'

import { api } from '@/api'

export const useLevelStore = defineStore('levelStore', () => {
  const levels = ref<Level[]>([])
  const currentLevel = ref(1)
  const isLoading = ref(true)


  const LoadLevels = async () => {
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

  const getLevelByNumber = (level: Level['level']) => levels.value.find(l => l.level === level)

  LoadLevels()

  return {
    levels,
    isLoading,
    currentLevel,
    getLevelByNumber,
  }
}) 