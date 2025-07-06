import { ref } from 'vue'
import { useBubbleStore, useSessionStore, useAchievmentStore } from '@/stores/index'

export function useApp() {
  const bubbleStore = useBubbleStore()
  const sessionStore = useSessionStore()
  const achievementStore = useAchievmentStore()

  const isAppLoading = ref(false)

  const initialize = async () => {
    isAppLoading.value = true
    try {
      await Promise.all([
        bubbleStore.loadBubbles(),
        achievementStore.loadAchievements(),
        sessionStore.startSession(),
      ])
    } finally {
      isAppLoading.value = false
    }
  }

  return {
    initialize,
    resetGame: sessionStore.startSession,
    isAppLoading
  }
}
