import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import { useBubbleStore } from '@/stores/bubble.store'
import { useSessionStore } from '@/stores/session.store'
import { getBubblesToRender, findNextYearWithNewBubbles, createHiddenBubble, normalizedToBubbleNode } from '@/utils/nodes'
import { createPhilosophyBubble } from '@/utils/normalize'
import { useCanvasSimulation } from '@/composables/useCanvasSimulation'
import { useSession } from '@/composables/useSession'
import type { BubbleNode } from '@/types/canvas'
import { getYearRange } from '@/utils/ui'
import { GAME_CONFIG } from '@/config'
import questionsData from '@/data/questions.json'

export function useCanvas(canvasRef: Ref<HTMLCanvasElement | null>, containerRef: Ref<HTMLElement | null>) {
  const bubbleStore = useBubbleStore()
  const sessionStore = useSessionStore()
  const { updateCurrentYear } = useSession()

  const yearRange = computed(() => getYearRange(bubbleStore.bubbles))
  const startYear = computed(() => yearRange.value.startYear)
  const endYear = computed(() => yearRange.value.endYear)

  const canvasWidth = ref(0)
  const canvasHeight = ref(0)
  
  // Сохраняем философские пузыри для каждого года
  const philosophyBubblesByYear = ref<Map<number, BubbleNode>>(new Map())

  const checkBubblesAndAdvance = (currentNodes: BubbleNode[]) => {
    // Проверяем есть ли основные пузыри навыков (исключая философские и скрытые)
    const coreBubbles = currentNodes.filter(n => !n.isQuestion && !n.isHidden && !n.isPopped)
    const hasCoreBubbles = coreBubbles.length > 0
    
    if (!hasCoreBubbles && sessionStore.currentYear < endYear.value) {
      const nextYear = findNextYearWithNewBubbles(bubbleStore.bubbles, sessionStore.currentYear, sessionStore.visitedBubbles)
      if (nextYear !== null) {
        setTimeout(() => {
          updateCurrentYear(nextYear, true) // Включаем анимацию для автоматической смены года
        }, 300)
      }
    }
  }

  const {
    initSimulation,
    updateBubbles,
    updateSimulationSize,
    isInitialized,
    removeBubbleFromCanvas
  } = useCanvasSimulation(canvasRef, checkBubblesAndAdvance)

  const resetCanvas = async () => {
    philosophyBubblesByYear.value.clear()
    updateCurrentYear(GAME_CONFIG.initialYear)
    await nextTick()
  }

  const removeBubble = (bubbleId: number, xpAmount?: number, isPhilosophyNegative?: boolean) => {
    if (removeBubbleFromCanvas) {
      removeBubbleFromCanvas(bubbleId, xpAmount, isPhilosophyNegative)
    }
  }

  const createPhilosophyBubbleForYear = (year: number): BubbleNode | null => {
    // Проверяем есть ли уже пузырь для этого года
    if (philosophyBubblesByYear.value.has(year)) {
      return philosophyBubblesByYear.value.get(year)!
    }
    
    // Создаем новый пузырь с 30% вероятностью
    if (Math.random() < 0.3) {
      const questions = questionsData.questions
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
      if (randomQuestion) {
        const philosophyBubble = createPhilosophyBubble(randomQuestion.id, year)
        const bubbleNode = normalizedToBubbleNode(philosophyBubble)
        philosophyBubblesByYear.value.set(year, bubbleNode)
        return bubbleNode
      }
    }
    
    return null
  }

  watch(() => sessionStore.currentYear, async (newYear, oldYear) => {
    if (bubbleStore.isLoading || !isInitialized.value) return
    
    const filteredBubbles = getBubblesToRender(bubbleStore.bubbles, newYear, sessionStore.visitedBubbles, [])
    const extraBubbles: BubbleNode[] = []
    
    // Добавляем скрытый пузырь при переходе на новый год
    if (newYear > oldYear) {
      extraBubbles.push(createHiddenBubble())
    }
    
    // Добавляем философский пузырь если он есть для этого года
    const philosophyBubble = createPhilosophyBubbleForYear(newYear)
    if (philosophyBubble) {
      extraBubbles.push(philosophyBubble)
    }
    
    const allBubbles = [...filteredBubbles, ...extraBubbles]
    // Проверяем есть ли основные пузыри только среди filteredBubbles (обычные пузыри навыков)
    const hasCoreBubbles = filteredBubbles.some(b => !b.isPopped)
    
    if (!hasCoreBubbles && newYear < endYear.value) {
      const nextYearWithBubbles = findNextYearWithNewBubbles(bubbleStore.bubbles, newYear, sessionStore.visitedBubbles)
      if (nextYearWithBubbles !== null) {
        setTimeout(() => {
          updateCurrentYear(nextYearWithBubbles, true)
        }, 300) // Включаем анимацию для автоматической смены года
      } else {
        updateBubbles(allBubbles)
      }
      return
    }
    updateBubbles(allBubbles)
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
            const extraBubbles: BubbleNode[] = []
            
            // Добавляем философский пузырь если он есть для текущего года
            const philosophyBubble = createPhilosophyBubbleForYear(sessionStore.currentYear)
            if (philosophyBubble) {
              extraBubbles.push(philosophyBubble)
            }
            
            updateBubbles([...initialBubbles, ...extraBubbles])
            bubbleStore.isLoading = false
          } else {
            updateSimulationSize(width, height)
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
    removeBubble,
  }
} 