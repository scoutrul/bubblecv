import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiEventStore = defineStore('ui-eventStore', () => {
  const shakeQueue = ref(new Set<string>())
  const gameSceneShake = ref(false)
  const showAchievements = ref(false)
  const bonusesActive = ref(false)
  const memoirsActive = ref(false)

  /**
   * Добавляет компонент в очередь на "встряску".
   * @param componentName - Имя компонента (например, 'lives', 'xp').
   */
  const queueShake = (componentName: string) => {
    shakeQueue.value.add(componentName)
  }

  /**
   * Забирает все запросы из очереди и очищает ее.
   * @returns Set с именами компонентов, которые нужно "встряхнуть".
   */
  const consumeShakeQueue = (): Set<string> => {
    const queueToProcess = new Set(shakeQueue.value)
    shakeQueue.value.clear()
    return queueToProcess
  }

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
    shakeQueue,
    gameSceneShake,
    showAchievements,
    bonusesActive,
    memoirsActive,
    queueShake,
    consumeShakeQueue,
    triggerGameSceneShake,
    toggleAchievements,
    closeAchievements,
    toggleBonusPanel,
    closeBonusPanel,
    toggleMemoirsPanel,
    closeMemoirsPanel
  }
}) 