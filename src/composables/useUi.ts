import { ref, watch } from 'vue'
import { useUiEventStore, useSessionStore } from '@/stores'

export interface EventBridge {
  resetCanvas: () => Promise<void>
}

let eventBridge: EventBridge | null = null

export const setEventBridge = (bridge: EventBridge) => {
  eventBridge = bridge
}

export const getEventBridge = (): EventBridge | null => {
  return eventBridge
}

export function useUi() {
  const isXPAnimating = ref(false)
  const sessionStore = useSessionStore()

  const animateXPGain = async () => {
    // Упрощенная анимация XP без use case
    isXPAnimating.value = true
    setTimeout(() => {
      isXPAnimating.value = false
    }, 1000) // 1 секунда анимации
  }

  // Следим за изменениями XP
  watch(() => sessionStore.currentXP, (newXP, oldXP) => {
    if (newXP > oldXP) {
      animateXPGain()
    }
  })

  return {
    isXPAnimating
  }
}
