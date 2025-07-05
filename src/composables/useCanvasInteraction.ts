import { type Ref, ref, onMounted, onUnmounted } from 'vue'
import type { Question } from '@/types/data'
import type { Simulation } from 'd3-force'
import type { BubbleNode } from '@/types/canvas'
import { GAME_CONFIG } from '@/config/game-config'
import { useSessionStore } from '@/stores/session.store'
import { useModalStore } from '@/stores/modal.store'
import { useBubbleStore } from '@/stores/bubble.store'
import { useLevelStore } from '@/stores/levels.store'
import { gsap } from 'gsap'
import type { NormalizedBubble } from '@/types/normalized'

import { XP_CALCULATOR } from '@/config/game-config'

export function useCanvasInteraction(
  canvasRef: Ref<HTMLCanvasElement | null>,
  onBubblePopped?: (nodes: BubbleNode[]) => void
) {
  const modalStore = useModalStore()
  const gameStore = useLevelStore()
  const sessionStore = useSessionStore()
  const bubbleStore = useBubbleStore()
  
  const isDragging = ref(false)
  const hoveredBubble = ref<BubbleNode | null>(null)
  const parallaxOffset = ref({ x: 0, y: 0 })

  // Вспомогательная функция для показа Level Up модала
  const showLevelUpModal = (xpGained: number) => {
    // Получаем иконку для уровня (такую же как в LevelDisplay)
    const getLevelIcon = (level: number): string => {
      switch (level) {
        case 1: return '👋'
        case 2: return '🤔'
        case 3: return '📚'
        case 4: return '🤝'
        case 5: return '🤜🤛'
        default: return '⭐'
      }
    }
    
    // Получаем данные нового уровня из contentLevels
    const levelData = gameStore.getLevelByNumber(sessionStore.currentLevel)
    const levelUpData = {
      level: sessionStore.currentLevel,
      title: levelData?.title || `Уровень ${sessionStore.currentLevel}`,
      description: levelData?.description || 'Новый уровень разблокирован!',
      icon: getLevelIcon(sessionStore.currentLevel),
      currentXP: sessionStore.currentXP,
      xpGained,
      unlockedFeatures: (levelData as any)?.unlockedFeatures || []
    }
    
    modalStore.openLevelUpModal(sessionStore.currentLevel, levelUpData)
  }

  // Обработка движения мыши
  const handleMouseMove = (
    event: MouseEvent,
    nodes: BubbleNode[],
    findBubbleUnderCursor: (mouseX: number, mouseY: number, nodes: BubbleNode[]) => BubbleNode | null,
    pushNeighbors: (centerBubble: BubbleNode, pushRadius: number, pushStrength: number, nodes: BubbleNode[]) => void
  ) => {
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Вычисляем целевое смещение для параллакса
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const strength = 0.008 // Сила эффекта параллакса (еще уменьшена)
    const targetX = (mouseX - centerX) * strength * -1
    const targetY = (mouseY - centerY) * strength * -1

    // Анимируем смещение к целевому значению с затуханием
    gsap.to(parallaxOffset.value, {
      x: targetX,
      y: targetY,
      duration: 1.2, // Длительность анимации (увеличена для более медленного эффекта)
      ease: 'power2.out' // Изинг для плавности
    })

    // Если идет перетаскивание, не обрабатываем ховер
    if (isDragging.value) return

    const newHoveredBubble = findBubbleUnderCursor(mouseX, mouseY, nodes)

    if (newHoveredBubble !== hoveredBubble.value) {
      // Сброс предыдущего ховера
      if (hoveredBubble.value) {
        hoveredBubble.value.targetRadius = hoveredBubble.value.baseRadius
        hoveredBubble.value.isHovered = false
      }

      hoveredBubble.value = newHoveredBubble

      // Применение нового ховера
      if (hoveredBubble.value) {
        hoveredBubble.value.targetRadius = hoveredBubble.value.baseRadius * 1.2
        hoveredBubble.value.isHovered = true
        canvasRef.value!.style.cursor = 'pointer'
        
        // Отталкиваем соседей при начале ховера
        const pushRadius = hoveredBubble.value.baseRadius * 3 // Уменьшили радиус воздействия
        const pushStrength = 4 // Уменьшили силу отталкивания
        pushNeighbors(hoveredBubble.value, pushRadius, pushStrength, nodes)
        
  
      } else {
        canvasRef.value!.style.cursor = 'default'
      }
    }
  }

  // Обработка ухода мыши
  const handleMouseLeave = () => {
    if (hoveredBubble.value) {
      hoveredBubble.value.targetRadius = hoveredBubble.value.baseRadius
      hoveredBubble.value.isHovered = false
      hoveredBubble.value = null
    }
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'default'
    }
  }

  // Обработка кликов
  const handleClick = async (
    event: MouseEvent,
    nodes: BubbleNode[],
    width: number,
    height: number,
    findBubbleUnderCursor: (mouseX: number, mouseY: number, nodes: BubbleNode[]) => BubbleNode | null,
    explodeFromPoint: (clickX: number, clickY: number, explosionRadius: number, explosionStrength: number, nodes: BubbleNode[], width: number, height: number) => void,
    createXPFloatingText: (x: number, y: number, xpAmount: number, color?: string) => void,
    createLifeLossFloatingText: (x: number, y: number) => void,
    removeBubble: (bubbleId: NormalizedBubble['id'], nodes: BubbleNode[]) => BubbleNode[],
    getSimulation?: () => Simulation<BubbleNode, undefined> | null
  ) => {
    if (!canvasRef.value || isDragging.value) return
    isDragging.value = true

    try {
      const rect = canvasRef.value.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const clickedBubble = findBubbleUnderCursor(mouseX, mouseY, nodes)

      if (clickedBubble && !clickedBubble.isVisited) {
        // Обработка крепких пузырей
        if (clickedBubble.isTough) {
          const result = bubbleStore.incrementToughBubbleClicks(clickedBubble.id)
          
          if (result.isReady) {
            // Пузырь пробит!
            // Помечаем пузырь как посещенный, чтобы он не появился снова.
            // Достижение будет выдано после закрытия модалки в handleBubbleContinue.
            await sessionStore.visitBubble(clickedBubble.id)

            // Не выходим из функции, а позволяем коду ниже
            // обработать этот пузырь как обычный (открыть модалку).
          } else {
            // Промежуточные клики дают XP
            createXPFloatingText(mouseX, mouseY, 1, '#22c55e')
            const leveledUp = await sessionStore.gainXP(1)

            // Проверяем повышение уровня
            if (leveledUp) {
              showLevelUpModal(1)
            }

            // --- ОБНОВЛЕННАЯ ЛОГИКА ОТСКОКА И НАБУХАНИЯ ---
            const clickOffsetX = mouseX - clickedBubble.x
            const clickOffsetY = mouseY - clickedBubble.y
            const distanceToCenter = Math.sqrt(clickOffsetX * clickOffsetX + clickOffsetY * clickOffsetY)

            if (distanceToCenter > 0) {
              const dirX = clickOffsetX / distanceToCenter
              const dirY = clickOffsetY / distanceToCenter
              
              const strengthFactor = Math.min(distanceToCenter / clickedBubble.radius, 1)
              // Сила отскока теперь зависит от ТЕКУЩЕГО размера пузыря
              const maxStrength = clickedBubble.radius * 1.5 // Еще больше отскок
              const jumpStrength = maxStrength * strengthFactor

              clickedBubble.vx -= dirX * jumpStrength
              clickedBubble.vy -= dirY * jumpStrength
              clickedBubble.x -= dirX * jumpStrength * 0.5
              clickedBubble.y -= dirY * jumpStrength * 0.5

              const simulation = getSimulation ? getSimulation() : null
              if (simulation) {
                simulation.alpha(1).restart()
              }
            }
            
            // Анимация "набухания" при клике
            gsap.killTweensOf(clickedBubble, 'targetRadius')
            clickedBubble.targetRadius = (clickedBubble.targetRadius || clickedBubble.baseRadius) * 1.08
            gsap.to(clickedBubble, {
              targetRadius: clickedBubble.baseRadius,
              duration: 1.2,
              ease: 'elastic.out(1, 0.6)',
              delay: 0.1
            })
          
            return // Не открываем модал и не помечаем как посещенный
          }
        }
        
        // Пузырь считается посещенным, как только мы по нему кликнули
        clickedBubble.isVisited = true
        await sessionStore.visitBubble(clickedBubble.id)
        
        // Специальная обработка для скрытого пузыря
        if (clickedBubble.isHidden) {
          // Создаем мощный эффект взрыва
          const explosionRadius = clickedBubble.baseRadius * 8
          const explosionStrength = 25
          explodeFromPoint(clickedBubble.x, clickedBubble.y, explosionRadius, explosionStrength, nodes, width, height)
          
          // Начисляем XP за секретный пузырь (используем централизованную логику)

          const secretXP = XP_CALCULATOR.getSecretBubbleXP()
          const leveledUp = await sessionStore.gainXP(secretXP)
          createXPFloatingText(clickedBubble.x, clickedBubble.y, secretXP, '#FFD700')
          
          // Проверяем повышение уровня
          if (leveledUp) {
            showLevelUpModal(secretXP)
          }
          
          // Разблокируем достижение (отдельно от основного XP)
          const achievement = await gameStore.unlockAchievement('secret-bubble-discoverer')
          if (achievement) {
            const achievementLeveledUp = await sessionStore.gainXP(achievement.xpReward)
            
            // Проверяем повышение уровня от XP за достижение
            if (achievementLeveledUp) {
              showLevelUpModal(achievement.xpReward)
            }
            
            modalStore.queueOrShowAchievement({
              title: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              xpReward: achievement.xpReward
            })
          }
          
          // Удаляем пузырь со сцены
          removeBubble(clickedBubble.id, nodes)
          return
        }
        
        // Анимация клика - плавное изменение размера
        const originalRadius = clickedBubble.targetRadius
        clickedBubble.targetRadius = originalRadius * 0.9
        
        setTimeout(() => {
          clickedBubble.targetRadius = originalRadius * 1.3
          setTimeout(() => {
            clickedBubble.targetRadius = originalRadius
          }, 150)
        }, 100)
        
        // Открываем модальное окно с деталями
        if (clickedBubble.isQuestion) {
          // Для философских пузырей открываем философский модал
          const question: Question = {
            id: `question-${clickedBubble.id}`,
            title: clickedBubble.name,   
            description: clickedBubble.description,
            question: clickedBubble.description,
            type: 'string',
            insight: 'string',
            options: [
              {
                id: 1,
                text: 'Я согласен с этим подходом и готов работать в этом стиле.',
                response: 'string',
                agreementLevel: 100,
                livesLost: 1
              },
              {
                id: 1,
                text: 'Я предпочитаю работать по-другому и не согласен с этим подходом.',
                response: 'string',
                agreementLevel: 100,
                livesLost: 1
              },
            ],
          }
          modalStore.openPhilosophyModal(question, clickedBubble.id)
        } else {
          modalStore.openBubbleModal(clickedBubble)
        }
      } else if (!clickedBubble) {
        // Клик по пустому месту - создаем взрыв отталкивания
        const explosionRadius = Math.min(width, height) * 0.3 // 30% от размера экрана
        const explosionStrength = 15 // Сильный взрыв
        
        // Создаем эффект взрыва от точки клика
        explodeFromPoint(mouseX, mouseY, explosionRadius, explosionStrength, nodes, width, height)
      }
    } finally {
      isDragging.value = false
    }
  }

  // Обработчик события удаления пузыря при нажатии "Продолжить"
  const handleBubbleContinue = async (
    event: Event,
    nodes: BubbleNode[],
    createXPFloatingText: (x: number, y: number, xpAmount: number, color?: string) => void,
    createLifeLossFloatingText: (x: number, y: number) => void,
    explodeBubble: (bubble: BubbleNode) => void,
    removeBubble: (bubbleId: NormalizedBubble['id'], nodes: BubbleNode[]) => BubbleNode[]
  ) => {
    const customEvent = event as CustomEvent
    const { bubbleId, isPhilosophyNegative } = customEvent.detail
    
    
    // Находим пузырь
    const bubble = nodes.find(node => node.id === bubbleId)
    if (!bubble) {
      return
    }
    
    // Начисляем опыт в зависимости от уровня экспертизы
    let leveledUp = false
    let xpGained = 0
    
    if (bubble.isTough) {
      // Для крепких пузырей XP уже начислен за клики.
      // Здесь мы выдаем достижение и взрываем его.
      await sessionStore.unlockFirstToughBubbleAchievement()
      xpGained = 0 // XP за само пробитие не дается, только за клики и ачивку.
      leveledUp = false
      
      explodeBubble(bubble)
      const remainingNodes = removeBubble(bubble.id, nodes)
      if (onBubblePopped) {
        onBubblePopped(remainingNodes)
      }
      return // Завершаем обработку здесь
    } else if (bubble.isQuestion) {

      xpGained = XP_CALCULATOR.getPhilosophyBubbleXP()
      leveledUp = await sessionStore.gainXP(xpGained)
      createXPFloatingText(bubble.x, bubble.y, xpGained, '#22c55e')
      
      if (isPhilosophyNegative) {
        // Дополнительно показываем потерю жизни при неправильном ответе
        createLifeLossFloatingText(bubble.x, bubble.y)
      }
    } else {
      xpGained = XP_CALCULATOR.getBubbleXP(bubble.skillLevel || 'novice')
      leveledUp = await sessionStore.gainXP(xpGained)
      
      // Создаём визуальный эффект получения XP при исчезновении (зеленый цвет)
      if (xpGained > 0) {
        createXPFloatingText(bubble.x, bubble.y, xpGained, '#22c55e')
      }
    }

    // Показываем Level Up модал если уровень повысился
    if (leveledUp) {
      showLevelUpModal(xpGained)
    }
    
    // Отмечаем пузырь как посещенный
    await sessionStore.visitBubble(bubble.id)
    bubble.isVisited = true
    
    // Проверяем достижения за количество пузырей ПОСЛЕ закрытия модалки
    const bubblesCount = sessionStore.visitedBubbles.length
    let achievement = null
    
    if (bubblesCount === 10) {
      achievement = await gameStore.unlockAchievement('bubble-explorer-10')
    } else if (bubblesCount === 30) {
      achievement = await gameStore.unlockAchievement('bubble-explorer-30')
    } else if (bubblesCount === 50) {
      achievement = await gameStore.unlockAchievement('bubble-explorer-50')
    }
    
    if (achievement) {
      const achievementLeveledUp = await sessionStore.gainXP(achievement.xpReward)
      
      // Проверяем повышение уровня от XP за достижение
      if (achievementLeveledUp) {
        showLevelUpModal(achievement.xpReward)
      }
      
      modalStore.queueOrShowAchievement({
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward
      })
    }
    
    // Создаем мощный взрыв пузыря и сразу удаляем
    explodeBubble(bubble)
    
    // Удаляем пузырь сразу - резкий эффект
    setTimeout(() => {
      const remainingNodes = removeBubble(bubbleId, nodes)
      if (onBubblePopped) {
        onBubblePopped(remainingNodes)
      }
    }, 50) // Минимальная задержка для применения физики
  }

  // Настройка обработчиков событий
  const setupEventListeners = (
    nodes: () => BubbleNode[],
    width: () => number,
    height: () => number,
    findBubbleUnderCursor: (mouseX: number, mouseY: number, nodes: BubbleNode[]) => BubbleNode | null,
    pushNeighbors: (centerBubble: BubbleNode, pushRadius: number, pushStrength: number, nodes: BubbleNode[]) => void,
    explodeFromPoint: (clickX: number, clickY: number, explosionRadius: number, explosionStrength: number, nodes: BubbleNode[], width: number, height: number) => void,
    createXPFloatingText: (x: number, y: number, xpAmount: number, color?: string) => void,
    createLifeLossFloatingText: (x: number, y: number) => void,
    explodeBubble: (bubble: BubbleNode) => void,
    removeBubble: (bubbleId: NormalizedBubble['id'], nodes: BubbleNode[]) => BubbleNode[],
    getSimulation?: () => Simulation<BubbleNode, undefined> | null
  ) => {
    const mouseMoveHandler = (event: MouseEvent) => 
      handleMouseMove(event, nodes(), findBubbleUnderCursor, pushNeighbors)
    
    const clickHandler = (event: MouseEvent) => 
      handleClick(event, nodes(), width(), height(), findBubbleUnderCursor, explodeFromPoint, createXPFloatingText, createLifeLossFloatingText, removeBubble, getSimulation)
    
    const bubbleContinueHandler = (event: Event) =>
      handleBubbleContinue(event, nodes(), createXPFloatingText, createLifeLossFloatingText, explodeBubble, removeBubble)

    // Добавляем слушатель события удаления пузыря
    window.addEventListener('bubble-continue', bubbleContinueHandler)

    return {
      mouseMoveHandler,
      clickHandler,
      bubbleContinueHandler,
      removeEventListeners: () => {
        window.removeEventListener('bubble-continue', bubbleContinueHandler)
      }
    }
  }

  onMounted(() => {
    // setupEventListeners will be called from the component with proper parameters
  })

  return {
    isDragging,
    hoveredBubble,
    handleMouseMove,
    handleClick,
    handleMouseLeave,
    setupEventListeners,
    parallaxOffset
  }
} 