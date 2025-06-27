import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Achievement, ContentLevel } from '@shared/types'

export const useGameStore = defineStore('game', () => {
  const achievements = ref<Achievement[]>([])
  const contentLevels = ref<ContentLevel[]>([])

  const getLevelByNumber = (level: number) => {
    return contentLevels.value.find(l => l.level === level)
  }

  return {
    achievements,
    contentLevels,
    getLevelByNumber
  }
}) 