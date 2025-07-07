import { ref, computed } from 'vue'
import { useBubbleStore, useSessionStore, useLevelStore } from '@/stores/'
import { useAchievement } from '@/composables/'

import { GAME_CONFIG } from '@/config'
import { getYearRange } from '@/utils/ui'

export function useApp() {
  const bubbleStore = useBubbleStore()
  const sessionStore = useSessionStore()
  const levelStore = useLevelStore()

  const achievements = useAchievement()

  const isAppLoading = ref(false)

  const initialize = async () => {
    isAppLoading.value = true
    try {
      await Promise.all([
        bubbleStore.loadBubbles(),
        achievements.loadAchievements(),
        sessionStore.startSession(),
      ])
    } finally {
      isAppLoading.value = false
    }
  }

  const currentLevel = computed(() => sessionStore.currentLevel)

  const yearRange = computed(() => getYearRange(bubbleStore.bubbles))

  const currentLevelTitle = computed(() => {
    const level = levelStore.getLevelByNumber(currentLevel.value)
    return level?.title || 'Посетитель'
  })

  return {
    initialize,
    resetGame: sessionStore.startSession,
    isAppLoading,
    game: {
      maxLives: GAME_CONFIG.maxLives,
      currentYear: sessionStore.currentYear,
      updateCurrentYear: sessionStore.updateCurrentYear,
      currentLevel,
      currentLevelTitle,
      startYear: computed(() => yearRange.value.startYear), 
      endYear: computed(() => yearRange.value.endYear),
      currentXP: computed(() => sessionStore.currentXP),
      currentLives: computed(() => sessionStore.lives),
      xpProgress: computed(() => sessionStore.xpProgress),
      nextLevelXP: computed(() => sessionStore.nextLevelXP)
    },
    achievements: {
      unlockedAchievements: computed(() => achievements.unlockedAchievements),
      toggleAchievements: computed(() => achievements.toggleAchievements),
      closeAchievements: computed(() => achievements.closeAchievements),
      showAchievements: computed(() => achievements.showAchievements),
    }
  }
}
