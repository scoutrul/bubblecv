import { useBubbleStore, useSessionStore } from '@/stores/index'

export function useApp() {
  const bubbleStore = useBubbleStore()
  const sessionStore = useSessionStore()

  const initialize = async () => {
    await Promise.all([
      bubbleStore.loadBubbles(),
      sessionStore.startSession()
    ])
  }

  return {
    initialize,
    bubbleStore,
    sessionStore,
  }
}
