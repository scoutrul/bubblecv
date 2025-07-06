import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAchievmentStore, useUiEventStore, useLevelStore, useSessionStore } from '@/stores'
import { GAME_CONFIG } from '@/config'

export function useGameHUD() {
  const showAchievements = ref(false)
  const isXPAnimating = ref(false)
  const shakingComponents = ref(new Set<string>())

  const sessionStore = useSessionStore()
  const gameStore = useLevelStore()
  const achievementStore = useAchievmentStore()
  const uiEventStore = useUiEventStore()

  const currentLevel = computed(() => sessionStore.currentLevel)
  const currentXP = computed(() => sessionStore.currentXP)
  const currentLives = computed(() => sessionStore.lives)
  const maxLives = computed(() => GAME_CONFIG.maxLives)
  const xpProgress = computed(() => sessionStore.xpProgress)
  const nextLevelXP = computed(() => sessionStore.nextLevelXP)

  const currentLevelTitle = computed(() => {
    const level = gameStore.getLevelByNumber(currentLevel.value)
    return level?.title || 'Посетитель'
  })

  const unlockedAchievements = computed(() => {
    return achievementStore.achievements.filter(a => a.isUnlocked).length
  })

  const animateXPGain = () => {
    isXPAnimating.value = true
    setTimeout(() => {
      isXPAnimating.value = false
    }, 200)
  }

  const handleProcessShakeQueue = () => {
    const componentsToShake = uiEventStore.consumeShakeQueue()
    if (componentsToShake.size > 0) {
      shakingComponents.value = componentsToShake
      setTimeout(() => {
        shakingComponents.value.clear()
      }, 700)
    }
  }

  onMounted(() => {
    window.addEventListener('process-shake-queue', handleProcessShakeQueue)
  })

  onUnmounted(() => {
    window.removeEventListener('process-shake-queue', handleProcessShakeQueue)
  })

  watch(() => sessionStore.currentXP, (newXP, oldXP) => {
    if (newXP > oldXP) animateXPGain()
  })

  return {
    showAchievements,
    isXPAnimating,
    shakingComponents,
    currentLevel,
    currentXP,
    currentLives,
    maxLives,
    xpProgress,
    nextLevelXP,
    currentLevelTitle,
    unlockedAchievements,
    toggleAchievements: () => showAchievements.value = !showAchievements.value,
    closeAchievements: () => showAchievements.value = false,
  }
}1