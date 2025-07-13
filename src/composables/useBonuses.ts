import { computed } from 'vue'
import { useBonusStore, useModalStore, useSessionStore, useUiEventStore } from '@/stores'
import type { NormalizedBonus } from '@/types/normalized'

export function useBonuses() {
  const bonusStore = useBonusStore()
  const modalStore = useModalStore()
  const uiEventStore = useUiEventStore()

  const bonuses = computed(() => bonusStore.bonuses)
  const unlockedBonuses = computed(() => bonusStore.unlockedBonuses)
  const isLoading = computed(() => bonusStore.isLoading)

  // UI состояния для панели бонусов
  const showBonusPanel = computed(() => uiEventStore.bonusesActive)
  const unlockedBonusesCount = computed(() => unlockedBonuses.value.length)

  const loadBonuses = async () => {
    await bonusStore.loadBonuses()
    bonusStore.updateUnlockedBonuses()
  }

  const getBonusByLevel = (level: number) => bonusStore.getBonusByLevel(level)

  // Управление панелью бонусов
  const toggleBonusPanel = () => {
    uiEventStore.toggleBonusPanel()
  }

  const closeBonusPanel = () => {
    uiEventStore.closeBonusPanel()
  }

  const openBonusModal = (bonus: NormalizedBonus) => {
    if (!bonus.isUnlocked) return
    
    modalStore.setCurrentBonus(bonus)
    modalStore.openModal('bonus')
  }

  const closeBonusModal = () => {
    modalStore.closeModal('bonus')
    modalStore.setCurrentBonus(null)
  }

  // Получить разблокированный бонус для определенного уровня (для LevelUpModal)
  const getUnlockedBonusForLevel = (level: number) => {
    const bonus = bonusStore.getBonusByLevel(level)
    return bonus?.isUnlocked ? bonus : null
  }

  // Разблокировать бонус при повышении уровня
  const unlockBonusForLevel = (level: number) => {
    bonusStore.unlockBonusForLevel(level)
  }

  // Сброс бонусов при рестарте игры
  const resetBonuses = () => {
    bonusStore.resetBonuses()
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