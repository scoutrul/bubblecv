import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUiEventStore, useSessionStore } from '@/stores'

// Global event bridge to avoid circular dependencies
export interface EventBridge {
  processShakeQueue: () => void
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
  const shakingComponents = ref(new Set<string>())

  const sessionStore = useSessionStore()

  const uiEventStore = useUiEventStore()


  const animateXPGain = () => {
    isXPAnimating.value = true
    setTimeout(() => {
      isXPAnimating.value = false
    }, 200)
  }

  const processShakeQueue = () => {
    const componentsToShake = uiEventStore.consumeShakeQueue()
    if (componentsToShake.size > 0) {
      shakingComponents.value = componentsToShake
      setTimeout(() => {
        shakingComponents.value.clear()
      }, 700)
    }
  }

  watch(() => sessionStore.currentXP, (newXP, oldXP) => {
    if (newXP > oldXP) animateXPGain()
  })

  return {
    isXPAnimating,
    shakingComponents,
    processShakeQueue
  }
}