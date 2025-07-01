import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiEventStore = defineStore('ui-events', () => {
  const shakeQueue = ref(new Set<string>())

  const queueShake = (component: string) => {
    shakeQueue.value.add(component)
  }

  const consumeShakeQueue = (): Set<string> => {
    const queue = new Set(shakeQueue.value)
    shakeQueue.value.clear()
    return queue
  }

  return {
    shakeQueue,
    queueShake,
    consumeShakeQueue
  }
}) 