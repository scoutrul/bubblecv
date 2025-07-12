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

  const createPhilosophyBubbleForYear = (year: number): BubbleNode | null => {
    // Проверяем есть ли уже пузырь для этого года
    if (philosophyBubblesByYear.value.has(year)) {
      const existingBubble = philosophyBubblesByYear.value.get(year)!
      // Если пузырь был лопнут, удаляем его из Map
      if (sessionStore.visitedBubbles.includes(existingBubble.id)) {
        console.log('🗑️ Removing visited philosophy bubble for year', year, 'with ID', existingBubble.id)
        philosophyBubblesByYear.value.delete(year)
        return null
      }
      console.log('♻️ Reusing existing philosophy bubble for year', year, 'with ID', existingBubble.id)
      return existingBubble
    }
    
    // Создаем новый пузырь с 30% вероятностью
    if (Math.random() < 0.3) {
      const questions = questionsData.questions
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
      if (randomQuestion) {
        const philosophyBubble = createPhilosophyBubble(randomQuestion.id, year)
        const bubbleNode = normalizedToBubbleNode(philosophyBubble)
        philosophyBubblesByYear.value.set(year, bubbleNode)
        console.log('✨ Created new philosophy bubble for year', year, 'with ID', bubbleNode.id)
        return bubbleNode
      }
    }
    
    return null
  }

  const removeBubble = (bubbleId: number, xpAmount?: number, isPhilosophyNegative?: boolean) => {
    console.log('🔥 Removing bubble with ID:', bubbleId)
    
    // Удаляем философский пузырь из Map если он был лопнут
    for (const [year, bubble] of philosophyBubblesByYear.value.entries()) {
      if (bubble.id === bubbleId) {
        console.log('🗑️ Removing philosophy bubble from Map for year', year, 'with ID', bubbleId)
        philosophyBubblesByYear.value.delete(year)
        break
      }
    }
    
    if (removeBubbleFromCanvas) {
      removeBubbleFromCanvas(bubbleId, xpAmount, isPhilosophyNegative)
    }
  }

  watch(() => sessionStore.currentYear, async (newYear, oldYear) => {
    if (bubbleStore.isLoading || !isInitialized.value) return
    
    const filteredBubbles = getBubblesToRender(bubbleStore.bubbles, newYear, sessionStore.visitedBubbles, [])
    const extraBubbles: BubbleNode[] = []
    
    // Добавляем скрытый пузырь при переходе на новый год
    if (newYear > oldYear) {
      extraBubbles.push(createHiddenBubble())
    }
    
    // Добавляем ВСЕ философские пузыри до текущего года включительно (но не больше 5)
    const philosophyBubbles: BubbleNode[] = []
    for (let year = startYear.value; year <= newYear && philosophyBubbles.length < 5; year++) {
      const philosophyBubble = createPhilosophyBubbleForYear(year)
      if (philosophyBubble) {
        // Проверяем, не был ли этот пузырь уже лопнут
        const isPopped = sessionStore.visitedBubbles.includes(philosophyBubble.id)
        if (!isPopped) {
          philosophyBubbles.push(philosophyBubble)
        }
      }
    }
    extraBubbles.push(...philosophyBubbles)
    
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
            
            // Добавляем ВСЕ философские пузыри до текущего года включительно (но не больше 5)
            const philosophyBubbles: BubbleNode[] = []
            for (let year = startYear.value; year <= sessionStore.currentYear && philosophyBubbles.length < 5; year++) {
              const philosophyBubble = createPhilosophyBubbleForYear(year)
              if (philosophyBubble) {
                // Проверяем, не был ли этот пузырь уже лопнут
                const isPopped = sessionStore.visitedBubbles.includes(philosophyBubble.id)
                if (!isPopped) {
                  philosophyBubbles.push(philosophyBubble)
                }
              }
            }
            extraBubbles.push(...philosophyBubbles)
            
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