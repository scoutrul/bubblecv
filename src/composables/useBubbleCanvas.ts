import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import { useBubbleStore } from '@/stores/bubble.store'
import { useSessionStore } from '@/stores/session.store'
import { getBubblesToRender, findNextYearWithNewBubbles, createHiddenBubble, normalizedToBubbleNode } from '@/utils/nodes'
import { useCanvasSimulation } from '@/composables/useCanvasSimulation'
import { useSession } from '@/composables/useSession'
import type { BubbleNode } from '@/types/canvas'
import { getYearRange } from '@/utils/ui'
import { GAME_CONFIG } from '@/config'

export function useBubbleCanvas(canvasRef: Ref<HTMLCanvasElement | null>, containerRef: Ref<HTMLElement | null>) {
  const bubbleStore = useBubbleStore()
  const sessionStore = useSessionStore()
  const { updateCurrentYear } = useSession()

  // Используем утилиту для вычисления диапазона годов
  const yearRange = computed(() => getYearRange(bubbleStore.bubbles))
  const startYear = computed(() => yearRange.value.startYear)
  const endYear = computed(() => yearRange.value.endYear)

  const canvasWidth = ref(0)
  const canvasHeight = ref(0)

  // Функция проверки и продвижения года
  const checkBubblesAndAdvance = (currentNodes: BubbleNode[]) => {
    const hasCoreBubbles = currentNodes.some(n => !n.isQuestion && !n.isHidden)

    if (!hasCoreBubbles && sessionStore.currentYear < endYear.value) {
      const nextYear = findNextYearWithNewBubbles(bubbleStore.bubbles, sessionStore.currentYear, sessionStore.visitedBubbles)
      if (nextYear !== null) {
        setTimeout(() => {
          updateCurrentYear(nextYear)
        }, 300)
      }
    }
  }

  const resetCanvas = async () => {
    updateCurrentYear(GAME_CONFIG.initialYear)
    await nextTick()
    // НЕ вызываем checkBubblesAndAdvance при reset, так как это запускает автопереключение
    // Пузыри будут загружены через watch() при смене currentYear
  }

  const {
    initSimulation,
    updateBubbles,
    isInitialized
  } = useCanvasSimulation(canvasRef, checkBubblesAndAdvance)

  watch(() => sessionStore.currentYear, async (newYear, oldYear) => {
    if (bubbleStore.isLoading || !isInitialized.value) return

    if (newYear > oldYear) {
      createHiddenBubble()
    }

    const filteredBubbles = getBubblesToRender(bubbleStore.bubbles, newYear, sessionStore.visitedBubbles, [])

    const hasCoreBubbles = filteredBubbles.some(b => !b.isQuestion && !b.isHidden)

    if (!hasCoreBubbles && newYear < endYear.value) {
      const nextYearWithBubbles = findNextYearWithNewBubbles(bubbleStore.bubbles, newYear, sessionStore.visitedBubbles)
      if (nextYearWithBubbles !== null) {
        setTimeout(() => updateCurrentYear(nextYearWithBubbles), 300)
      } else {
        updateBubbles(filteredBubbles)
      }
      return
    }

    updateBubbles(filteredBubbles)
  })

  onMounted(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          canvasWidth.value = width
          canvasHeight.value = height

          if (!isInitialized.value) {
            initSimulation(width, height)
            const initialBubbles = getBubblesToRender(bubbleStore.bubbles, sessionStore.currentYear, sessionStore.visitedBubbles)
            updateBubbles(initialBubbles)
            bubbleStore.isLoading = false
            
            // НЕ вызываем checkBubblesAndAdvance при первоначальной инициализации
            // чтобы избежать автопереключения на последний год
          } else {
            // Если нужен resize — сюда можно добавить updateSimulationSize, если будет
          }
        }
      }
    })

    if (containerRef.value) {
      resizeObserver.observe(containerRef.value)
    }

    onUnmounted(() => {
      resizeObserver.disconnect()
    })
  })

  return {
    canvasWidth,
    canvasHeight,
    resetCanvas,
  }
}