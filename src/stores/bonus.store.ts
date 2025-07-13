import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api'
import { useSessionStore } from '@/stores/session.store'
import { normalizeBonus } from '@/utils/normalize'
import type { NormalizedBonus } from '@/types/normalized'

export const useBonusStore = defineStore('bonusStore', () => {
  const bonuses = ref<NormalizedBonus[]>([])
  const isLoading = ref(true)

  const loadBonuses = async () => {
    try {
      isLoading.value = true
      const { data } = await api.getBonuses()
      bonuses.value = data.map(normalizeBonus)
      
      // Автоматически разблокируем бонусы на основе текущего уровня
      updateUnlockedBonuses()
    } catch (error) {
      console.error('❌ Ошибка загрузки бонусов:', error)
    } finally {
      isLoading.value = false
    }
  }

  const getBonusByLevel = (level: number) => 
    bonuses.value.find((bonus) => bonus.level === level)

  const unlockBonusForLevel = (level: number) => {
    const bonus = getBonusByLevel(level)
    if (bonus) {
      bonus.isUnlocked = true
    }
  }

  const unlockedBonuses = computed(() => 
    bonuses.value.filter((bonus) => bonus.isUnlocked)
  )

  // Реактивная разблокировка бонусов на основе текущего уровня
  const updateUnlockedBonuses = () => {
    const sessionStore = useSessionStore()
    const currentLevel = sessionStore.currentLevel
    
    bonuses.value.forEach((bonus) => {
      if (bonus.level <= currentLevel && !bonus.isUnlocked) {
        bonus.isUnlocked = true
      }
    })
  }

  // Сброс состояния бонусов при рестарте игры
  const resetBonuses = () => {
    bonuses.value.forEach((bonus) => {
      bonus.isUnlocked = false
    })
    // Разблокируем только бонус первого уровня
    updateUnlockedBonuses()
  }

  return {
    bonuses,
    unlockedBonuses,
    isLoading,
    loadBonuses,
    getBonusByLevel,
    unlockBonusForLevel,
    updateUnlockedBonuses,
    resetBonuses
  }
}) 