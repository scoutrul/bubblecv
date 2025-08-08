import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import { useBubbleStore } from '@/stores/bubble.store'
import { useSessionStore } from '@/stores/session.store'
import { useModals, setCanvasBridge } from '@/composables/useModals'
import { getBubblesToRender, findNextYearWithNewBubbles, normalizedToBubbleNode, createPhilosophyBubble } from '@/utils'
import { useSession } from '@/composables/useSession'
import { CanvasUseCaseFactory } from '@/usecases/canvas'
import type { BubbleNode } from '@/types/canvas'
import { getYearRange } from '@/utils'
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

  const philosophyBubblesByYear = ref<Map<number, BubbleNode>>(new Map())
  const usedQuestionIds = ref<Set<string>>(new Set())

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

  const canvasUseCase = ref<ReturnType<typeof canvasUseCaseFactory.createCanvasUseCase> | null>(null)

  const updateCanvasBubbles = () => {
    if (!canvasUseCase.value || !canvasRef.value) return

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

    try {
      console.log(`🔄 Обновляем канвас: ${initialBubbles.length} основных + ${extraBubbles.length} дополнительных баблов`)
      canvasUseCase.value.updateBubbles({ bubbles: [...initialBubbles, ...extraBubbles] })
    } catch (error) {
      console.error('Error updating bubbles:', error)
    }
  }

  const addBubblesToCanvas = (newBubbles: BubbleNode[]) => {
    if (!canvasUseCase.value || !canvasRef.value) return

    // Получаем текущие пузыри на канвасе
    const currentBubbles = canvasUseCase.value.getCurrentBubbles?.() || []
    
    // Добавляем новые пузыри к существующим
    const updatedBubbles = [...currentBubbles, ...newBubbles]
    
    try {
      console.log(`➕ Добавляем ${newBubbles.length} новых пузырей к существующим ${currentBubbles.length}`)
      canvasUseCase.value.updateBubbles({ bubbles: updatedBubbles })
    } catch (error) {
      console.error('Error adding bubbles to canvas:', error)
    }
  }

  watch([() => bubbleStore.bubbles, () => sessionStore.currentLevel], () => {
    nextTick(() => {
      updateCanvasBubbles()
    })
  })

  const checkBubblesAndAdvance = (currentNodes: BubbleNode[]) => {
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
    console.log('🔄 Сброс канваса...')
    philosophyBubblesByYear.value.clear()
    usedQuestionIds.value.clear()
    updateCurrentYear(GAME_CONFIG.initialYear)
    await nextTick()
      setTimeout(() => {
      updateCanvasBubbles()
    }, 100)
  }

  const createPhilosophyBubbleForYear = (year: number): BubbleNode | null => {
      if (philosophyBubblesByYear.value.has(year)) {
      const existingBubble = philosophyBubblesByYear.value.get(year)!
          if (sessionStore.visitedBubbles.includes(existingBubble.id)) {
        philosophyBubblesByYear.value.delete(year)
          if (existingBubble.questionId) {
            usedQuestionIds.value.delete(existingBubble.questionId)
          }
        return null
      }
      return existingBubble
    }

      if (Math.random() < 0.3) {
      const questions = questionsData.questions
              const availableQuestions = questions.filter(q => !usedQuestionIds.value.has(q.id))

      if (availableQuestions.length > 0) {
        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]

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
      for (const [year, bubble] of philosophyBubblesByYear.value.entries()) {
      if (bubble.id === bubbleId) {
        philosophyBubblesByYear.value.delete(year)
        break
      }
    }

      if (canvasUseCase.value) {
      const bubble = canvasUseCase.value.findBubbleById(bubbleId)
      if (bubble) {

        const isPhilosophyBubble = bubble.isQuestion
              await canvasUseCase.value.removeBubbleWithEffects({
        bubble,
        xpAmount,
        isPhilosophyNegative,
        skipFloatingText: true // Всегда пропускаем floating text, так как он создается в processPendingBubbleRemovals
      })
      }
    }
  }

  watch(() => sessionStore.currentYear, async (newYear) => {
    
    if (bubbleStore.isLoading || !canvasUseCase.value) {
      console.log('⚠️ Пропускаем обновление: bubbleStore загружается или canvasUseCase не готов')
      return
    }

    // Если год сброшен на начальный, очищаем философские пузыри
    if (newYear === GAME_CONFIG.initialYear) {
      philosophyBubblesByYear.value.clear()
      usedQuestionIds.value.clear()
    }

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
              updateCanvasBubbles()
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
    addBubblesToCanvas,
    updateCanvasBubbles,
    removeBubbleWithEffects: async (params: { bubble: BubbleNode; xpAmount?: number; isPhilosophyNegative?: boolean; skipFloatingText?: boolean }) => {
      if (canvasUseCase.value) {
        await canvasUseCase.value.removeBubbleWithEffects(params)
      }
    },
    removePhilosophyBubble: (bubbleId: number) => {
      if (canvasUseCase.value) {
        return canvasUseCase.value.removePhilosophyBubble(bubbleId)
      }
    },
    findBubbleById: (bubbleId: number) => {
      if (canvasUseCase.value) {
        return canvasUseCase.value.findBubbleById(bubbleId)
      }
      return undefined
    },
    createFloatingText: (params: { x: number; y: number; text: string; type: 'xp' | 'life'; color?: string }) => {
      if (canvasUseCase.value) {
        canvasUseCase.value.createFloatingText(params)
      }
    }
  }
}
