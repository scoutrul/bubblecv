import { ref, watch, computed } from 'vue'
import { useUiEventStore, useSessionStore } from '@/stores'
import { UiUseCaseFactory } from '@/usecases/ui'
import type { UiUiEventStore } from '@/usecases/ui'
import { GAME_CONFIG } from '@/config'

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

  // Создаем фабрику с адаптерами
  const createFactory = () => {
    return new UiUseCaseFactory({
      consumeShakeQueue: () => uiEventStore.consumeShakeQueue()
    })
  }

  const animateXPGain = async () => {
    const factory = createFactory()
    const animateXPGainUseCase = factory.createAnimateXPGainUseCase()
    
    // Получаем текущее значение XP
    const currentXP = sessionStore.currentXP
    
    const result = await animateXPGainUseCase.execute({
      oldXP: currentXP - 1, // Примерное значение для демонстрации
      newXP: currentXP
    })

    if (result.success) {
      isXPAnimating.value = true
      setTimeout(() => {
        isXPAnimating.value = false
      }, result.animationDuration)
    }
  }

  const processShakeQueue = async () => {
    try {
      const factory = createFactory()
      const processShakeQueueUseCase = factory.createProcessShakeQueueUseCase()
      
      const result = await processShakeQueueUseCase.execute({})

      if (result.success && result.componentsShaken.size > 0) {
        shakingComponents.value = result.componentsShaken
        setTimeout(() => {
          shakingComponents.value.clear()
        }, result.shakeDuration)
      }
    } catch (error) {
      console.error('Error in processShakeQueue:', error)
      // Fallback: обрабатываем очередь напрямую
      const componentsToShake = uiEventStore.consumeShakeQueue()
      if (componentsToShake.size > 0) {
        shakingComponents.value = componentsToShake
        setTimeout(() => {
          shakingComponents.value.clear()
        }, GAME_CONFIG.animations.shake)
      }
    }
  }

  // Следим за изменениями XP
  watch(() => sessionStore.currentXP, (newXP, oldXP) => {
    if (newXP > oldXP) {
      animateXPGain()
    }
  })

  return {
    isXPAnimating,
    shakingComponents,
    processShakeQueue
  }
}
