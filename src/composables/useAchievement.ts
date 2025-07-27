import { useAchievmentStore, useUiEventStore, useSessionStore } from '@/stores'
import { computed } from 'vue'
import { AchievementUseCaseFactory } from '@/usecases/achievement'

export function useAchievement() {
  const achievementStore = useAchievmentStore()
  const sessionStore = useSessionStore()
  const uiEventStore = useUiEventStore()

  // Создаем фабрику use cases
  const factory = new AchievementUseCaseFactory(
    achievementStore,
    sessionStore,
    uiEventStore
  )

  // Создаем экземпляры use cases
  const unlockAchievementUseCase = factory.createUnlockAchievementUseCase()
  const resetAchievementsUseCase = factory.createResetAchievementsUseCase()
  const getAchievementsUseCase = factory.createGetAchievementsUseCase()

  const unlockAchievement = async (id: string, showModal = true) => {
    const result = await unlockAchievementUseCase.execute({ id, showModal })
    return result.success ? result.achievement : null
  }

  const unlockedAchievements = computed(() => 
    getAchievementsUseCase.getUnlockedAchievements()
  )

  const unlockedCount = computed(() => 
    getAchievementsUseCase.getUnlockedCount()
  )

  const toggleAchievements = () => {
    uiEventStore.toggleAchievements()
  }

  const closeAchievements = () => {
    uiEventStore.closeAchievements()
  }

  const resetAchievements = () => {
    resetAchievementsUseCase.execute()
  }

  return {
    unlockedAchievements,
    unlockAchievement,
    showAchievements: computed(() => uiEventStore.showAchievements),
    unlockedCount,
    toggleAchievements,
    closeAchievements,
    loadAchievements: achievementStore.loadAchievements,
    resetAchievements,
  }
}
