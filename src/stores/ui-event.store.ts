import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiEventStore = defineStore('ui-eventStore', () => {
  const gameSceneShake = ref(false)
  const showAchievements = ref(false)
  const bonusesActive = ref(false)
  const memoirsActive = ref(false)

  const triggerGameSceneShake = () => {
    gameSceneShake.value = true
    setTimeout(() => {
      gameSceneShake.value = false
    }, 600) // Длительность тряски
  }

  const toggleAchievements = () => {
    showAchievements.value = !showAchievements.value
  }

  const closeAchievements = () => {
    showAchievements.value = false
  }

  const toggleBonusPanel = () => {
    bonusesActive.value = !bonusesActive.value
  }

  const closeBonusPanel = () => {
    bonusesActive.value = false
  }

  const toggleMemoirsPanel = () => {
    memoirsActive.value = !memoirsActive.value
  }

  const closeMemoirsPanel = () => {
    memoirsActive.value = false
  }

  return {
    gameSceneShake,
    showAchievements,
    bonusesActive,
    memoirsActive,
    triggerGameSceneShake,
    toggleAchievements,
    closeAchievements,
    toggleBonusPanel,
    closeBonusPanel,
    toggleMemoirsPanel,
    closeMemoirsPanel
  }
}) 