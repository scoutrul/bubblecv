import { ref, computed } from 'vue'
import { useBubbleStore, useSessionStore, useLevelStore } from '@/stores/'
import { useAchievement, useSession } from '@/composables/'
import { useModals } from '@/composables/useModals'
import { GAME_CONFIG } from '@/config'
import { getYearRange } from '@/utils/ui'

export function useApp() {
  const bubbleStore = useBubbleStore()
  const sessionStore = useSessionStore()
  const levelStore = useLevelStore()
  const achievements = useAchievement()
  const { startSession, updateCurrentYear, yearTransitionTrigger } = useSession()
  const { openWelcome } = useModals()

  const isAppLoading = ref(false)

  const initialize = async () => {
    isAppLoading.value = true
    try {
      await Promise.all([
        bubbleStore.loadBubbles(),
        achievements.loadAchievements(),
        startSession(),
      ])
      // Открываем welcome модалку после инициализации
      openWelcome()
    } finally {
      isAppLoading.value = false
    }
  }

  const resetGame = () => {
    startSession()
    openWelcome()
  }

  const currentLevel = computed(() => sessionStore.currentLevel)
  const yearRange = computed(() => getYearRange(bubbleStore.bubbles))
  const currentLevelTitle = computed(() => {
    const level = levelStore.getLevelByNumber(currentLevel.value)
    return level?.title || 'Посетитель'
  })

  const game = {
    maxLives: GAME_CONFIG.maxLives,
    currentYear: computed(() => sessionStore.currentYear),
    updateCurrentYear: updateCurrentYear,
    currentLevel,
    currentLevelTitle,
    startYear: computed(() => yearRange.value.startYear),
    endYear: computed(() => yearRange.value.endYear),
    currentXP: computed(() => sessionStore.currentXP),
    currentLives: computed(() => sessionStore.lives),
    xpProgress: computed(() => sessionStore.xpProgress),
    nextLevelXP: computed(() => sessionStore.nextLevelXP),
    visitedBubbles: computed(() => sessionStore.visitedBubbles),
    yearTransitionTrigger
  }

  return {
    initialize,
    resetGame,
    isAppLoading,
    game,
    achievements: {
      unlockedCount: achievements.unlockedCount,
      showAchievements: achievements.showAchievements,
      closeAchievements: achievements.closeAchievements,
      toggleAchievements: achievements.toggleAchievements,
    }
  }
}
