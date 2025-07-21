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
  // Сохраняем скрытые пузыри для каждого года
  const hiddenBubblesByYear = ref<Map<number, BubbleNode>>(new Map())
  // Отслеживаем использованные вопросы чтобы избежать дублирования
  const usedQuestionIds = ref<Set<string>>(new Set())

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
    hiddenBubblesByYear.value.clear()
    usedQuestionIds.value.clear()
    updateCurrentYear(GAME_CONFIG.initialYear)
    await nextTick()
  }

  const createPhilosophyBubbleForYear = (year: number): BubbleNode | null => {
    // Проверяем есть ли уже пузырь для этого года
    if (philosophyBubblesByYear.value.has(year)) {
      const existingBubble = philosophyBubblesByYear.value.get(year)!
      // Если пузырь был лопнут, удаляем его из Map
      if (sessionStore.visitedBubbles.includes(existingBubble.id)) {
        philosophyBubblesByYear.value.delete(year)
        // Убираем вопрос из использованных, чтобы его можно было использовать снова
        if (existingBubble.questionId) {
          usedQuestionIds.value.delete(existingBubble.questionId)
        }
        return null
      }
      return existingBubble
    }

    // Создаем новый пузырь с 30% вероятностью
    if (Math.random() < 0.3) {
      const questions = questionsData.questions
      // Фильтруем неиспользованные вопросы
      const availableQuestions = questions.filter(q => !usedQuestionIds.value.has(q.id))

      if (availableQuestions.length > 0) {
        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]

        // Отмечаем вопрос как использованный
        usedQuestionIds.value.add(randomQuestion.id)

        const philosophyBubble = createPhilosophyBubble(randomQuestion.id, year)
        const bubbleNode = normalizedToBubbleNode(philosophyBubble)

        philosophyBubblesByYear.value.set(year, bubbleNode)

        return bubbleNode
      }
    }

    return null
  }

  const createHiddenBubbleForYear = (year: number): BubbleNode | null => {
    // Проверяем есть ли уже скрытый пузырь для этого года
    if (hiddenBubblesByYear.value.has(year)) {
      const existingBubble = hiddenBubblesByYear.value.get(year)!
      // Если пузырь был лопнут, удаляем его из Map
      if (sessionStore.visitedBubbles.includes(existingBubble.id)) {
        hiddenBubblesByYear.value.delete(year)
        return null
      }
      return existingBubble
    }

    // Создаем скрытый пузырь для каждого года
    const hiddenBubble = createHiddenBubble(year)
    hiddenBubblesByYear.value.set(year, hiddenBubble)

    return hiddenBubble
  }

  const removeBubble = (bubbleId: number, xpAmount?: number, isPhilosophyNegative?: boolean) => {
    // Удаляем философский пузырь из Map если он был лопнут
    for (const [year, bubble] of philosophyBubblesByYear.value.entries()) {
      if (bubble.id === bubbleId) {
        philosophyBubblesByYear.value.delete(year)
        break
      }
    }

    // Удаляем скрытый пузырь из Map если он был лопнут
    for (const [year, bubble] of hiddenBubblesByYear.value.entries()) {
      if (bubble.id === bubbleId) {
        hiddenBubblesByYear.value.delete(year)
        break
      }
    }

    if (removeBubbleFromCanvas) {
      removeBubbleFromCanvas(bubbleId, xpAmount, isPhilosophyNegative)
    }
  }

  watch(() => sessionStore.currentYear, async (newYear) => {
    if (bubbleStore.isLoading || !isInitialized.value) return

    const filteredBubbles = getBubblesToRender(bubbleStore.bubbles, newYear, sessionStore.visitedBubbles, [])
    const extraBubbles: BubbleNode[] = []

    // Добавляем ВСЕ скрытые пузыри до текущего года включительно
    const hiddenBubbles: BubbleNode[] = []
    for (let year = startYear.value; year <= newYear; year++) {
      const hiddenBubble = createHiddenBubbleForYear(year)
      if (hiddenBubble) {
        // Проверяем, не был ли этот пузырь уже лопнут
        const isPopped = sessionStore.visitedBubbles.includes(hiddenBubble.id)
        if (!isPopped) {
          hiddenBubbles.push(hiddenBubble)
        }
      }
    }
    extraBubbles.push(...hiddenBubbles)

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

    updateBubbles(allBubbles)

    if (!hasCoreBubbles) {
      checkBubblesAndAdvance(allBubbles)
    }
  }, { immediate: false })

  onMounted(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvasWidth.value = width
        canvasHeight.value = height

        if (canvasRef.value) {
          canvasRef.value.width = width
          canvasRef.value.height = height

          if (!isInitialized.value) {
            initSimulation(width, height)
            const initialBubbles = getBubblesToRender(bubbleStore.bubbles, sessionStore.currentYear, sessionStore.visitedBubbles)
            const extraBubbles: BubbleNode[] = []

            // Добавляем ВСЕ скрытые пузыри до текущего года включительно
            const hiddenBubbles: BubbleNode[] = []
            for (let year = startYear.value; year <= sessionStore.currentYear; year++) {
              const hiddenBubble = createHiddenBubbleForYear(year)
              if (hiddenBubble) {
                // Проверяем, не был ли этот пузырь уже лопнут
                const isPopped = sessionStore.visitedBubbles.includes(hiddenBubble.id)
                if (!isPopped) {
                  hiddenBubbles.push(hiddenBubble)
                }
              }
            }
            extraBubbles.push(...hiddenBubbles)

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
