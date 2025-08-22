import { ref, computed } from 'vue'
import { useBubbleStore, useSessionStore, useLevelsStore } from '@/stores/'
import { useAchievement, useSession, useBonuses, useMemoirs } from '@/composables/'
import { useModals } from '@/composables/useModals'
import { getTranslatedLevelTitleByOriginal } from '@/utils/level-translations'
import { AppUseCaseFactory, AppRepositoryImpl } from '@/usecases/app'
import type { 
  AppSessionStore, 
  AppBubbleStore, 
  AppLevelStore, 
  AppAchievementStore, 
  AppBonusStore, 
  AppModalStore,
  AppMemoirStore
} from '@/usecases/app'
import type { NormalizedBubble, NormalizedAchievement } from '@/types/normalized'
import { GAME_CONFIG } from '@/config'
import { getYearRange } from '@/utils'
import { getEventBridge } from '@/composables/useUi'

export function useApp() {
  const bubbleStore = useBubbleStore()
  const sessionStore = useSessionStore()
  const levelStore = useLevelsStore()
  const achievements = useAchievement()
  const bonuses = useBonuses()
  const memoirs = useMemoirs()
  const session = useSession()
  const { openWelcome } = useModals()

  const isAppLoading = ref(false)

  // Создаем адаптеры для stores
  const createAdapters = () => {
    return {
      sessionAdapter: {
        session: {
          currentLevel: sessionStore.currentLevel,
          currentXP: sessionStore.currentXP,
          lives: sessionStore.lives,
          currentYear: sessionStore.currentYear,
          visitedBubbles: sessionStore.visitedBubbles
        },
        xpProgress: sessionStore.xpProgress,
        nextLevelXP: sessionStore.nextLevelXP,
        startSession: (params: { lives: number }) => session.startSession(params),
        updateCurrentYear: (year: number, triggerAnimation?: boolean) => session.updateCurrentYear(year, triggerAnimation),
        yearTransitionTrigger: session.yearTransitionTrigger
      } as AppSessionStore,
      bubbleAdapter: {
        get bubbles() { return bubbleStore.bubbles as unknown as import('@/types/canvas').BubbleNode[] },
        loadBubbles: () => bubbleStore.loadBubbles(),
        addBubbles: (bubbles: NormalizedBubble[]) => bubbleStore.bubbles.push(...bubbles)
      } as AppBubbleStore,
      levelAdapter: {
        levels: levelStore.levels,
        loadLevels: () => levelStore.loadLevels(),
        getLevelByNumber: (level: number) => levelStore.getLevelByNumber(level)
      } as AppLevelStore,
      achievementAdapter: {
        achievements: [] as import('@/types/normalized').NormalizedAchievement[], // not used directly here; use cases query store
        unlockedCount: achievements.unlockedCount.value,
        unlockedAchievements: achievements.unlockedAchievements.value,
        loadAchievements: () => achievements.loadAchievements(),
        showAchievements: () => achievements.toggleAchievements(),
        closeAchievements: () => achievements.closeAchievements(),
        toggleAchievements: () => achievements.toggleAchievements()
      } as AppAchievementStore,
      bonusAdapter: {
        bonuses: bonuses.bonuses.value,
        unlockedBonusesCount: bonuses.unlockedBonusesCount.value,
        unlockedBonuses: bonuses.unlockedBonuses.value,
        loadBonuses: () => bonuses.loadBonuses(),
        showBonusPanel: () => bonuses.toggleBonusPanel(),
        closeBonusPanel: () => bonuses.closeBonusPanel(),
        toggleBonusPanel: () => bonuses.toggleBonusPanel()
      } as AppBonusStore,
      memoirAdapter: {
        memoirs: memoirs.memoirs.value,
        unlockedCount: memoirs.unlockedMemoirsCount.value,
        unlockedMemoirs: memoirs.unlockedMemoirs.value,
        loadMemoirs: () => memoirs.loadMemoirs(),
        showMemoirs: () => memoirs.resetMemoirs(),
        closeMemoirs: () => memoirs.resetMemoirs(),
        toggleMemoirs: () => memoirs.resetMemoirs(),
        resetReadMemoirs: () => memoirs.resetMemoirs()
      } as AppMemoirStore,
      modalAdapter: {
        openWelcome: () => openWelcome()
      } as AppModalStore,
      repositoryAdapter: new AppRepositoryImpl()
    }
  }

  // Создаем фабрику use cases
  const createFactory = () => {
    const adapters = createAdapters()
    return new AppUseCaseFactory(
      adapters.sessionAdapter,
      adapters.bubbleAdapter,
      adapters.levelAdapter,
      adapters.achievementAdapter,
      adapters.bonusAdapter,
      adapters.modalAdapter,
      adapters.repositoryAdapter,
      adapters.memoirAdapter
    )
  }

  const initialize = async () => {
    isAppLoading.value = true
    try {
      const factory = createFactory()
      const useCase = factory.createInitializeAppUseCase()
      
      const result = await useCase.execute({ lives: GAME_CONFIG.initialLives })
      
      if (!result.success) {
        console.error('Ошибка инициализации приложения:', result.error)
      }
    } finally {
      isAppLoading.value = false
    }
  }

  const resetGame = async () => {
    const factory = createFactory()
    const useCase = factory.createResetGameUseCase()
    
    const result = await useCase.execute()
    
    if (!result.success) {
      console.error('Ошибка сброса игры:', result.error)
    }
    
    // Reset category filters when game is reset
    bubbleStore.resetCategoryFilters()
    bubbleStore.closeCategoryFilterPanel()

    // Reset tough bubble counters to avoid carry-over after reset
    bubbleStore.resetToughBubbleCounters()

    // Reload locale-dependent data after language change/reset
    try {
      await Promise.all([
        levelStore.loadLevels(),
        bubbleStore.loadBubbles(),
        achievements.loadAchievements(),
        bonuses.loadBonuses(),
        memoirs.loadMemoirs()
      ])
    } catch (e) {
      console.error('Ошибка перезагрузки данных после смены языка:', e)
    }

    // Ensure canvas reinitializes with freshly loaded data
    const bridge = getEventBridge()
    if (bridge) {
      await bridge.resetCanvas()
    }
  }

  // Реактивные computed для состояния игры
  const currentLevel = computed(() => sessionStore.currentLevel)
  const currentLevelTitle = computed(() => {
    const level = levelStore.getLevelByNumber(currentLevel.value)

    return getTranslatedLevelTitleByOriginal(level?.title || 'Посетитель')
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
    startYear: computed(() => {
      const yearRange = getYearRange(bubbleStore.bubbles)
      return yearRange.startYear
    }),
    endYear: computed(() => {
      const yearRange = getYearRange(bubbleStore.bubbles)
      return yearRange.endYear
    }),
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
      unlockedAchievements: achievements.unlockedAchievements,
      showAchievements: achievements.showAchievements,
      closeAchievements: achievements.closeAchievements,
      toggleAchievements: achievements.toggleAchievements,
    },
    bonuses: {
      unlockedCount: bonuses.unlockedBonusesCount,
      unlockedBonuses: bonuses.unlockedBonuses,
      showBonuses: bonuses.showBonusPanel,
      closeBonuses: bonuses.closeBonusPanel,
      toggleBonuses: bonuses.toggleBonusPanel,
    },
    memoirs: {
      unlockedCount: memoirs.unlockedMemoirsCount,
      unlockedMemoirs: memoirs.unlockedMemoirs,
      showMemoirs: memoirs.resetMemoirs,
      closeMemoirs: memoirs.resetMemoirs,
      toggleMemoirs: memoirs.resetMemoirs,
    }
  }
}
