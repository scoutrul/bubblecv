import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiEventStore = defineStore('ui-eventStore', () => {
  const shakeQueue = ref(new Set<string>())

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

  return {
    queueShake,
    consumeShakeQueue
  }
}) 