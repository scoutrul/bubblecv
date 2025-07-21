import { ref, computed } from 'vue'
import { useBubbleStore, useSessionStore, useLevelStore } from '@/stores/'
import { useAchievement, useSession, useBonuses } from '@/composables/'
import { useModals } from '@/composables/useModals'
import { GAME_CONFIG } from '@/config'
import { getYearRange } from '@/utils/ui'
import { api } from '@/api'

export function useApp() {
  const bubbleStore = useBubbleStore()
  const sessionStore = useSessionStore()
  const levelStore = useLevelStore()
  const achievements = useAchievement()
  const bonuses = useBonuses()
  const session = useSession()
  const { openWelcome } = useModals()

  const isAppLoading = ref(false)
  const oldBubblesLoaded = ref(false)

  // Загрузка старых пузырей при достижении 4 уровня
  const loadOldBubblesIfNeeded = async () => {
    if (currentLevel.value >= 4 && !oldBubblesLoaded.value) {
      try {
        const { data: oldBubbles } = await api.getOldBubbles()
        // Добавляем старые пузыри к существующим
        bubbleStore.bubbles.push(...oldBubbles)
        oldBubblesLoaded.value = true
        console.log('✅ Загружены пузыри из прошлого')
      } catch (err) {
        console.error('❌ Ошибка загрузки старых пузырей:', err)
      }
    }
  }

  const initialize = async () => {
    isAppLoading.value = true
    try {
      await Promise.all([
        levelStore.loadLevels(),
        bubbleStore.loadBubbles(),
        achievements.loadAchievements(),
        bonuses.loadBonuses(),
        session.startSession({ lives: GAME_CONFIG.initialLives }),
      ])

      // Проверяем нужно ли загрузить старые пузыри
      await loadOldBubblesIfNeeded()

      // Открываем welcome модалку после инициализации
      openWelcome()
    } finally {
      isAppLoading.value = false
    }
  }

  const resetGame = () => {
    // Сбрасываем бонусы
    bonuses.resetBonuses()
    // startSession сбрасывает: достижения, опыт, уровень, жизни, посещенные пузыри
    session.startSession()
    openWelcome()
  }

  const currentLevel = computed(() => sessionStore.currentLevel)
  const yearRange = computed(() => getYearRange(bubbleStore.bubbles))
  const currentLevelTitle = computed(() => {
    const level = levelStore.getLevelByNumber(currentLevel.value)

    return level?.title || 'Посетитель'
  })

  const currentLevelIcon = computed(() => {
    const level = levelStore.getLevelByNumber(currentLevel.value)

    return level?.icon || '👋'
  })

  const game = {
    maxLives: GAME_CONFIG.maxLives,
    currentYear: computed(() => sessionStore.currentYear),
    updateCurrentYear: session.updateCurrentYear,
    currentLevel,
    currentLevelTitle,
    currentLevelIcon,
    startYear: computed(() => yearRange.value.startYear),
    endYear: computed(() => yearRange.value.endYear),
    currentXP: computed(() => sessionStore.currentXP),
    currentLives: computed(() => sessionStore.lives),
    xpProgress: computed(() => sessionStore.xpProgress),
    nextLevelXP: computed(() => sessionStore.nextLevelXP),
    visitedBubbles: computed(() => sessionStore.visitedBubbles),
    yearTransitionTrigger: session.yearTransitionTrigger
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
