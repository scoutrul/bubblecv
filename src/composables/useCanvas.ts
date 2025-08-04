import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import { useBubbleStore } from '@/stores/bubble.store'
import { useSessionStore } from '@/stores/session.store'
import { useModals, setCanvasBridge } from '@/composables/useModals'
import { getBubblesToRender, findNextYearWithNewBubbles, normalizedToBubbleNode } from '@/utils/nodes'
import { createPhilosophyBubble } from '@/utils/normalize'
import { useSession } from '@/composables/useSession'
import { CanvasUseCaseFactory } from '@/usecases/canvas'
import type { BubbleNode } from '@/types/canvas'
import { getYearRange } from '@/utils/ui'
import { GAME_CONFIG } from '@/config'
import questionsData from '@/data/questions.json'

export function useCanvas(canvasRef: Ref<HTMLCanvasElement | null>, containerRef: Ref<HTMLElement | null>) {
  const bubbleStore = useBubbleStore()
  const sessionStore = useSessionStore()
  const sessionComposable = useSession()
  const { updateCurrentYear } = sessionComposable
  const { openLevelUpModal, openBubbleModal, openPhilosophyModal, handleSecretBubbleDestroyed } = useModals()

  const yearRange = computed(() => getYearRange(bubbleStore.bubbles))
  const startYear = computed(() => yearRange.value.startYear)
  const endYear = computed(() => yearRange.value.endYear)

  const canvasWidth = ref(0)
  const canvasHeight = ref(0)

  // Сохраняем философские пузыри для каждого года
  const philosophyBubblesByYear = ref<Map<number, BubbleNode>>(new Map())
  // Отслеживаем использованные вопросы чтобы избежать дублирования
  const usedQuestionIds = ref<Set<string>>(new Set())

  // Создаем фабрику use cases
  const canvasUseCaseFactory = new CanvasUseCaseFactory(
    bubbleStore,
    sessionStore,
    {
      openLevelUpModal,
      openBubbleModal,
      openPhilosophyModal,
      handleSecretBubbleDestroyed
    }
  )

  // Создаем основной use case
  const canvasUseCase = ref<ReturnType<typeof canvasUseCaseFactory.createCanvasUseCase> | null>(null)

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

  const resetCanvas = async () => {
    philosophyBubblesByYear.value.clear()
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

        const philosophyBubble = createPhilosophyBubble(randomQuestion, year)
        const bubbleNode = normalizedToBubbleNode(philosophyBubble)

        philosophyBubblesByYear.value.set(year, bubbleNode)

        return bubbleNode
      }
    }

    return null
  }

  const removeBubble = async (bubbleId: number, xpAmount?: number, isPhilosophyNegative?: boolean) => {
    // Удаляем философский пузырь из Map если он был лопнут
    for (const [year, bubble] of philosophyBubblesByYear.value.entries()) {
      if (bubble.id === bubbleId) {
        philosophyBubblesByYear.value.delete(year)
        break
      }
    }

    // Используем use case для удаления пузыря с эффектами
    if (canvasUseCase.value) {
      const bubble = canvasUseCase.value.findBubbleById(bubbleId)
      if (bubble) {
        // Удаляем пузырь с эффектами через универсальный метод
        await canvasUseCase.value.removeBubbleWithEffects({
          bubble,
          xpAmount,
          isPhilosophyNegative
        })
      }
    }
  }

  watch(() => sessionStore.currentYear, async (newYear) => {
    if (bubbleStore.isLoading || !canvasUseCase.value) return

    // Добавляем скрытые пузыри в bubbleStore только если получена ачивка "крепыш"
    if (sessionStore.hasUnlockedFirstToughBubbleAchievement) {
      const yearsToAdd: number[] = []
      for (let year = startYear.value; year <= newYear; year++) {
        // Проверяем, есть ли уже скрытый пузырь для этого года в bubbleStore
        const existingHiddenBubble = bubbleStore.bubbles.find(b => 
          b.isHidden && b.year === year
        )
        
        // Проверяем, не был ли этот пузырь уже лопнут
        const isPopped = sessionStore.visitedBubbles.includes(-(year * 10000 + 9999))
        
        if (!existingHiddenBubble && !isPopped) {
          yearsToAdd.push(year)
        }
      }
      
      if (yearsToAdd.length > 0) {
        bubbleStore.addHiddenBubbles(yearsToAdd)
      }
    }

    const filteredBubbles = getBubblesToRender(
      bubbleStore.bubbles, 
      newYear, 
      sessionStore.visitedBubbles, 
      [], 
      sessionStore.hasUnlockedFirstToughBubbleAchievement
    )
    const extraBubbles: BubbleNode[] = []

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

    // Используем use case для обновления пузырей
    canvasUseCase.value.updateBubbles({ bubbles: allBubbles })

    // Проверяем нужно ли перейти к следующему году
    checkBubblesAndAdvance(allBubbles)
  })

  onMounted(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvasWidth.value = width
        canvasHeight.value = height

        if (canvasRef.value) {
          canvasRef.value.width = width
          canvasRef.value.height = height

          // Проверяем, нужно ли переинициализировать canvas (например, при hot reload)
          const needsReinit = !canvasUseCase.value || 
            (canvasUseCase.value && !canvasUseCase.value.updateBubbles)

          if (!canvasUseCase.value || needsReinit) {
            // Уничтожаем старый use case если он существует
            if (canvasUseCase.value) {
              canvasUseCase.value.destroyCanvas()
            }
            
            // Создаем use case при первой инициализации или переинициализации
            canvasUseCase.value = canvasUseCaseFactory.createCanvasUseCase(canvasRef, sessionComposable, checkBubblesAndAdvance)
            
            // Инициализируем канвас
            canvasUseCase.value.initCanvas({ width, height, canvasRef })
            
            // Обновляем пузыри с небольшой задержкой
            setTimeout(() => {
              const initialBubbles = getBubblesToRender(
                bubbleStore.bubbles, 
                sessionStore.currentYear, 
                sessionStore.visitedBubbles, 
                [], 
                sessionStore.hasUnlockedFirstToughBubbleAchievement
              )
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

              // Проверяем, что use case инициализирован
              if (canvasUseCase.value && canvasUseCase.value.updateBubbles) {
                try {
                  canvasUseCase.value.updateBubbles({ bubbles: [...initialBubbles, ...extraBubbles] })
                } catch (error) {
                  console.error('Error updating bubbles:', error)
                }
              }
            }, 50)
          } else {
            // Обновляем размеры существующего use case
            canvasUseCase.value.updateCanvasSize({ width, height })
          }
        }
      }
    })
    
    // Обработчик изменения размера окна
    const handleWindowResize = () => {
      if (containerRef.value && canvasRef.value) {
        const rect = containerRef.value.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        
        canvasWidth.value = width
        canvasHeight.value = height
        canvasRef.value.width = width
        canvasRef.value.height = height
        
        if (canvasUseCase.value) {
          canvasUseCase.value.updateCanvasSize({ width, height })
        }
      }
    }
    
    if (containerRef.value) {
      resizeObserver.observe(containerRef.value)
    }
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', handleWindowResize)
    
    // Обработчик для Vite HMR (Hot Module Replacement)
    if (import.meta.hot) {
      import.meta.hot.accept(() => {
        console.log('🔄 Hot reload detected - reinitializing canvas...')
        
        // Принудительно вызываем resize для переинициализации
        if (containerRef.value) {
          const rect = containerRef.value.getBoundingClientRect()
          const event = new Event('resize')
          window.dispatchEvent(event)
        }
      })
    }
    
    onUnmounted(() => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleWindowResize)
      if (canvasUseCase.value) {
        canvasUseCase.value.destroyCanvas()
      }
    })
  })

  return {
    canvasWidth,
    canvasHeight,
    resetCanvas,
    removeBubble,
    removeBubbleWithEffects: async (params: { bubble: BubbleNode; xpAmount?: number; isPhilosophyNegative?: boolean; skipFloatingText?: boolean }) => {
      if (canvasUseCase.value) {
        await canvasUseCase.value.removeBubbleWithEffects(params)
      }
    },
    removePhilosophyBubble: (bubbleId: number) => {
      if (canvasUseCase.value) {
        return canvasUseCase.value.removePhilosophyBubble(bubbleId)
      }
    }
  }
}
