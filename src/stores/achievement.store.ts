import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Achievement } from '@/types/data'

import { api } from '@/api'

export const useAchievmentStore = defineStore('achievmentStore', () => {
  const achievements = ref<Achievement[]>([])

  const isLoading = ref(true)

  const loadAchievements = async () => {
    isLoading.value = true

    try {
      const { data } = await api.getAchievements()
      achievements.value = data
    } catch (err) {
      console.error('❌ Ошибка загрузки уровней:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    achievements,
    loadAchievements
  }
}) 