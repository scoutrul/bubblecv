import { computed } from 'vue'
import { useBonusStore, useModalStore, useUiEventStore } from '@/stores'
import { BonusUseCaseFactory } from '@/usecases/bonus'
import type { NormalizedBonus } from '@/types/normalized'

export function useBonuses() {
  const bonusStore = useBonusStore()
  const modalStore = useModalStore()
  const uiEventStore = useUiEventStore()

  const factory = new BonusUseCaseFactory(
    bonusStore,
    modalStore,
    uiEventStore
  )

  // Создаем экземпляры use cases
  const unlockBonusUseCase = factory.createUnlockBonusUseCase()
  const openBonusModalUseCase = factory.createOpenBonusModalUseCase()
  const getBonusUseCase = factory.createGetBonusUseCase()
  const resetBonusesUseCase = factory.createResetBonusesUseCase()
  const bonusUiUseCase = factory.createBonusUiUseCase()

  const bonuses = computed(() => bonusStore.bonuses)
  const unlockedBonuses = computed(() => bonusStore.unlockedBonuses)
  const isLoading = computed(() => bonusStore.isLoading)

  const showBonusPanel = computed(() => bonusUiUseCase.isBonusPanelActive())
  const unlockedBonusesCount = computed(() => unlockedBonuses.value.length)

  const loadBonuses = async () => {
    await bonusStore.loadBonuses()
    bonusStore.updateUnlockedBonuses()
  }

  const getBonusByLevel = (level: number) => {
    const result = getBonusUseCase.getBonusByLevel({ level })
    return result.success ? result.bonus : undefined
  }

  const toggleBonusPanel = () => {
    bonusUiUseCase.toggleBonusPanel()
  }

  const closeBonusPanel = () => {
    bonusUiUseCase.closeBonusPanel()
  }

  const openBonusModal = async (bonus: NormalizedBonus) => {
    const result = await openBonusModalUseCase.execute({ bonus })
    return result.success
  }

  const closeBonusModal = () => {
    modalStore.closeModal('bonus')
    modalStore.setCurrentBonus(null)
  }

  // Получить разблокированный бонус для определенного уровня (для LevelUpModal)
  const getUnlockedBonusForLevel = (level: number) => {
    return getBonusUseCase.getUnlockedBonusForLevel(level)
  }

  // Разблокировать бонус при повышении уровня
  const unlockBonusForLevel = async (level: number) => {
    const result = await unlockBonusUseCase.execute({ level })
    return result.success ? result.bonus : null
  }

  // Сброс бонусов при рестарте игры
  const resetBonuses = () => {
    resetBonusesUseCase.execute()
  }

  return {
    bonuses,
    unlockedBonuses,
    isLoading,
    showBonusPanel,
    unlockedBonusesCount,
    loadBonuses,
    getBonusByLevel,
    toggleBonusPanel,
    closeBonusPanel,
    openBonusModal,
    closeBonusModal,
    getUnlockedBonusForLevel,
    unlockBonusForLevel,
    resetBonuses
  }
}
