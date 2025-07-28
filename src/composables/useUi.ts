import { ref, watch, computed } from 'vue'
import { useUiEventStore, useSessionStore } from '@/stores'
import { UiUseCaseFactory, UiRepositoryImpl } from '@/usecases/ui'
import type { UiSessionStore, UiUiEventStore, UiRepository } from '@/usecases/ui'

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

  // Создаем адаптеры для stores
  const createAdapters = () => {
    return {
      sessionAdapter: {
        currentXP: computed(() => sessionStore.currentXP)
      } as UiSessionStore,
      uiEventAdapter: {
        consumeShakeQueue: () => uiEventStore.consumeShakeQueue()
      } as UiUiEventStore,
      uiRepositoryAdapter: new UiRepositoryImpl() as UiRepository
    }
  }

  // Создаем фабрику с адаптерами
  const createFactory = () => {
    const adapters = createAdapters()
    return new UiUseCaseFactory(
      adapters.sessionAdapter,
      adapters.uiEventAdapter,
      adapters.uiRepositoryAdapter
    )
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
    const factory = createFactory()
    const processShakeQueueUseCase = factory.createProcessShakeQueueUseCase()
    
    const result = await processShakeQueueUseCase.execute({})

    if (result.success && result.componentsShaken.size > 0) {
      shakingComponents.value = result.componentsShaken
      setTimeout(() => {
        shakingComponents.value.clear()
      }, result.shakeDuration)
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
