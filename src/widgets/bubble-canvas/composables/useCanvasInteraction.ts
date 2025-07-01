import { type Ref } from 'vue'
import type { PhilosophyQuestion } from '../../../shared/types'
import type { SimulationNode } from './types'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import { useSessionStore } from '../../../entities/user-session/model/session-store'
import { useModalStore } from '../../../shared/stores/modal-store'
import { useBubbleStore } from '@entities/bubble/model/bubble-store'
import { useGameStore } from '@features/gamification/model/game-store'

export function useCanvasInteraction(
  canvasRef: Ref<HTMLCanvasElement | null>,
  onBubblePopped?: () => void
) {
  const sessionStore = useSessionStore()
  const modalStore = useModalStore()
  const gameStore = useGameStore()
  const bubbleStore = useBubbleStore()

  let hoveredBubble: SimulationNode | null = null
  let isClicking = false

  // Обработка движения мыши
  const handleMouseMove = (
    event: MouseEvent,
    nodes: SimulationNode[],
    findBubbleUnderCursor: (mouseX: number, mouseY: number, nodes: SimulationNode[]) => SimulationNode | null,
    pushNeighbors: (centerBubble: SimulationNode, pushRadius: number, pushStrength: number, nodes: SimulationNode[]) => void
  ) => {
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const newHoveredBubble = findBubbleUnderCursor(mouseX, mouseY, nodes)

    if (newHoveredBubble !== hoveredBubble) {
      // Сброс предыдущего ховера
      if (hoveredBubble) {
        hoveredBubble.targetRadius = hoveredBubble.baseRadius
        hoveredBubble.isHovered = false
      }

      hoveredBubble = newHoveredBubble

      // Применение нового ховера
      if (hoveredBubble) {
        hoveredBubble.targetRadius = hoveredBubble.baseRadius * 1.2
        hoveredBubble.isHovered = true
        canvasRef.value!.style.cursor = 'pointer'
        
        // Отталкиваем соседей при начале ховера
        const pushRadius = hoveredBubble.baseRadius * 4 // Увеличили радиус воздействия
        const pushStrength = 8 // Увеличили силу отталкивания
        pushNeighbors(hoveredBubble, pushRadius, pushStrength, nodes)
        
  
      } else {
        canvasRef.value!.style.cursor = 'default'
      }
    }
  }

  // Обработка ухода мыши
  const handleMouseLeave = () => {
    if (hoveredBubble) {
      hoveredBubble.targetRadius = hoveredBubble.baseRadius
      hoveredBubble.isHovered = false
      hoveredBubble = null
    }
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'default'
    }
  }

  // Обработка кликов
  const handleClick = async (
    event: MouseEvent,
    nodes: SimulationNode[],
    width: number,
    height: number,
    findBubbleUnderCursor: (mouseX: number, mouseY: number, nodes: SimulationNode[]) => SimulationNode | null,
    explodeFromPoint: (clickX: number, clickY: number, explosionRadius: number, explosionStrength: number, nodes: SimulationNode[], width: number, height: number) => void,
    createXPFloatingText: (x: number, y: number, xpAmount: number, color?: string) => void,
    createLifeLossFloatingText: (x: number, y: number) => void,
    removeBubble: (bubbleId: string, nodes: SimulationNode[]) => SimulationNode[]
  ) => {
    if (!canvasRef.value || isClicking) return
    isClicking = true

    try {
      const rect = canvasRef.value.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const clickedBubble = findBubbleUnderCursor(mouseX, mouseY, nodes)

      if (clickedBubble && !clickedBubble.isVisited) {
        // Обработка крепких пузырей
        if (clickedBubble.isTough) {
          const result = bubbleStore.incrementToughBubbleClicks(clickedBubble.id)
          
          if (!result.isReady) {
            // Только промежуточные клики дают XP
            createXPFloatingText(mouseX, mouseY, 1, '#22c55e')
            await sessionStore.gainXP(1)

            // Анимация клика для крепкого пузыря
            const originalRadius = clickedBubble.targetRadius
            clickedBubble.targetRadius = originalRadius * 0.95
            setTimeout(() => {
              clickedBubble.targetRadius = originalRadius * 1.1
              setTimeout(() => {
                clickedBubble.targetRadius = originalRadius
              }, 100)
            }, 50)
            
            return // Не открываем модал и не помечаем как посещенный
          }
          
          await sessionStore.unlockFirstToughBubbleAchievement()
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
          
          // Начисляем XP за секретный пузырь
          const secretXP = 10
          await sessionStore.gainXP(secretXP)
          createXPFloatingText(clickedBubble.x, clickedBubble.y, secretXP, '#FFD700')
          
          // Разблокируем достижение
          const achievement = await gameStore.unlockAchievement('secret-bubble-discoverer')
          if (achievement) {
            modalStore.queueOrShowAchievement({
              title: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              xpReward: achievement.xpReward || 0
            })
          }
          
          // Удаляем пузырь со сцены
          removeBubble(clickedBubble.id, nodes)
          return // Завершаем обработку
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
        if (clickedBubble.isEasterEgg) {
          // Для философских пузырей открываем философский модал
          const philosophyQuestion: PhilosophyQuestion = {
            id: `question-${clickedBubble.id}`,
            question: clickedBubble.name,
            context: 'Этот вопрос проверяет ваши взгляды на разработку.',
            agreeText: 'Я согласен с этим подходом и готов работать в этом стиле.',
            disagreeText: 'Я предпочитаю работать по-другому и не согласен с этим подходом.',
            options: [
              'Я согласен с этим подходом и готов работать в этом стиле.',
              'Я предпочитаю работать по-другому и не согласен с этим подходом.'
            ],
            correctAnswer: 'Я согласен с этим подходом и готов работать в этом стиле.',
            explanation: clickedBubble.description,
            points: GAME_CONFIG.xpPerEasterEgg
          }
          modalStore.openPhilosophyModal(philosophyQuestion, clickedBubble.id)
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
      isClicking = false
    }
  }

  // Обработчик события удаления пузыря при нажатии "Продолжить"
  const handleBubbleContinue = async (
    event: Event,
    nodes: SimulationNode[],
    createXPFloatingText: (x: number, y: number, xpAmount: number, color?: string) => void,
    createLifeLossFloatingText: (x: number, y: number) => void,
    explodeBubble: (bubble: SimulationNode) => void,
    removeBubble: (bubbleId: string, nodes: SimulationNode[]) => SimulationNode[]
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
      // Для крепких пузырей XP уже начислен за клики, дополнительно не даем
      xpGained = 0
      leveledUp = false
      
    } else if (bubble.isEasterEgg) {
      if (isPhilosophyNegative) {
        // Отрицательный ответ на философский вопрос - показываем потерю жизни
        createLifeLossFloatingText(bubble.x, bubble.y)
      } else {
        // Положительный ответ - обычный XP (зеленый цвет)
        xpGained = GAME_CONFIG.xpPerEasterEgg
        leveledUp = await sessionStore.gainXP(xpGained)
        createXPFloatingText(bubble.x, bubble.y, xpGained, '#22c55e')
      }
    } else {
      const expertiseLevel = bubble.skillLevel as keyof typeof GAME_CONFIG.xpPerExpertiseLevel
      const xpConfig = GAME_CONFIG.xpPerExpertiseLevel[expertiseLevel]
      xpGained = xpConfig || 1
      
      leveledUp = await sessionStore.gainBubbleXP(expertiseLevel)
      
      // Создаём визуальный эффект получения XP при исчезновении (зеленый цвет)
      if (xpGained > 0) {
        createXPFloatingText(bubble.x, bubble.y, xpGained, '#22c55e')
      }
    }

    // Показываем Level Up модал если уровень повысился
    if (leveledUp) {
      
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
      await sessionStore.gainXP(achievement.xpReward)
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
      removeBubble(bubbleId, nodes)
    }, 50) // Минимальная задержка для применения физики
  }

  // Настройка обработчиков событий
  const setupEventListeners = (
    nodes: () => SimulationNode[],
    width: () => number,
    height: () => number,
    findBubbleUnderCursor: (mouseX: number, mouseY: number, nodes: SimulationNode[]) => SimulationNode | null,
    pushNeighbors: (centerBubble: SimulationNode, pushRadius: number, pushStrength: number, nodes: SimulationNode[]) => void,
    explodeFromPoint: (clickX: number, clickY: number, explosionRadius: number, explosionStrength: number, nodes: SimulationNode[], width: number, height: number) => void,
    createXPFloatingText: (x: number, y: number, xpAmount: number, color?: string) => void,
    createLifeLossFloatingText: (x: number, y: number) => void,
    explodeBubble: (bubble: SimulationNode) => void,
    removeBubble: (bubbleId: string, nodes: SimulationNode[]) => SimulationNode[]
  ) => {
    const mouseMoveHandler = (event: MouseEvent) => 
      handleMouseMove(event, nodes(), findBubbleUnderCursor, pushNeighbors)
    
    const clickHandler = (event: MouseEvent) => 
      handleClick(event, nodes(), width(), height(), findBubbleUnderCursor, explodeFromPoint, createXPFloatingText, createLifeLossFloatingText, removeBubble)
    
    const bubbleContinueHandler = (event: Event) =>
      handleBubbleContinue(event, nodes(), createXPFloatingText, createLifeLossFloatingText, explodeBubble, removeBubble)

    // Добавляем слушатель события удаления пузыря
    window.addEventListener('bubble-continue', bubbleContinueHandler)

    return {
      mouseMoveHandler,
      clickHandler,
      bubbleContinueHandler,
      cleanupEventListeners: () => {
        window.removeEventListener('bubble-continue', bubbleContinueHandler)
      }
    }
  }

  return {
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleBubbleContinue,
    setupEventListeners,
    getHoveredBubble: () => hoveredBubble
  }
} 