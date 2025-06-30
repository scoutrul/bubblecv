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
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const clickedBubble = findBubbleUnderCursor(mouseX, mouseY, nodes)

    if (clickedBubble && !clickedBubble.isVisited) {

      
      // Обработка крепких пузырей
      if (clickedBubble.isTough) {
        const result = bubbleStore.incrementToughBubbleClicks(clickedBubble.id)
        
        // Показываем +1 XP за каждый клик
        createXPFloatingText(clickedBubble.x, clickedBubble.y, 1, '#fbbf24')
        await sessionStore.gainXP(1)
        
        if (!result.isReady) {

          
          // Анимация клика для крепкого пузыря
          const originalRadius = clickedBubble.targetRadius
          clickedBubble.targetRadius = originalRadius * 0.95
          setTimeout(() => {
            clickedBubble.targetRadius = originalRadius * 1.1
            setTimeout(() => {
              clickedBubble.targetRadius = originalRadius
            }, 100)
          }, 50)
          
          return // Не открываем модал пока пузырь не готов
        } else {
          
          
          // Разблокируем достижение за первый крепкий пузырь
          await sessionStore.unlockFirstToughBubbleAchievement()
          
          // Пузырь готов - продолжаем обычную логику открытия модалки
        }
      }
      
      // Специальная обработка для скрытого пузыря
      if (clickedBubble.isHidden) {

        
        // Отмечаем пузырь как посещенный
        clickedBubble.isVisited = true
        await sessionStore.visitBubble(clickedBubble.id)
        
        // Создаем мощный эффект взрыва
        const explosionRadius = clickedBubble.baseRadius * 8
        const explosionStrength = 25
        explodeFromPoint(clickedBubble.x, clickedBubble.y, explosionRadius, explosionStrength, nodes, width, height)
        
        // Начисляем XP за секретный пузырь
        const secretXP = 10
        await sessionStore.gainXP(secretXP)
        createXPFloatingText(clickedBubble.x, clickedBubble.y, secretXP, '#FFD700') // Золотой цвет для секретного XP
        
        // Разблокируем достижение
        const achievement = gameStore.unlockAchievement('secret-bubble-discoverer')
        if (achievement) {
          modalStore.openAchievementModal({
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward || 0
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
      if (clickedBubble.isEasterEgg) {
        // Для философских пузырей открываем философский модал
        const philosophyQuestion: PhilosophyQuestion = {
          id: `question-${clickedBubble.id}`,
          question: clickedBubble.name,
          options: [
            'Я согласен с этим подходом и готов работать в этом стиле.',
            'Я предпочитаю работать по-другому и не согласен с этим подходом.'
          ],
          correctAnswer: 'Я согласен с этим подходом и готов работать в этом стиле.',
          explanation: clickedBubble.description,
          points: GAME_CONFIG.XP_PER_EASTER_EGG
        }
        modalStore.openPhilosophyModal(philosophyQuestion, clickedBubble.id)
      } else {
        modalStore.openBubbleModal(clickedBubble)
      }
    } else {
      // Клик по пустому месту - создаем взрыв отталкивания
      const explosionRadius = Math.min(width, height) * 0.3 // 30% от размера экрана
      const explosionStrength = 15 // Сильный взрыв
      
      // Создаем эффект взрыва от точки клика
      explodeFromPoint(mouseX, mouseY, explosionRadius, explosionStrength, nodes, width, height)
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
      console.warn('❌ Пузырь не найден:', bubbleId)
      return
    }
    

    
    // Начисляем опыт в зависимости от уровня экспертизы
    let leveledUp = false
    let xpGained = 0
    
    if (bubble.isEasterEgg) {
      if (isPhilosophyNegative) {
        // Отрицательный ответ на философский вопрос - показываем потерю жизни
        createLifeLossFloatingText(bubble.x, bubble.y)
      } else {
        // Положительный ответ - обычный XP (зеленый цвет)
        xpGained = GAME_CONFIG.XP_PER_EASTER_EGG
        leveledUp = await sessionStore.gainXP(xpGained)
        createXPFloatingText(bubble.x, bubble.y, xpGained, '#22c55e')
      }
    } else {
      const expertiseLevel = bubble.skillLevel as keyof typeof GAME_CONFIG.XP_PER_EXPERTISE_LEVEL
      const xpConfig = GAME_CONFIG.XP_PER_EXPERTISE_LEVEL[expertiseLevel]
      xpGained = xpConfig || 1
      
      leveledUp = await sessionStore.gainBubbleXP(expertiseLevel)
      
      // Создаём визуальный эффект получения XP при исчезновении (зеленый цвет)
      if (xpGained > 0) {
        createXPFloatingText(bubble.x, bubble.y, xpGained, '#22c55e')
      }
    }

    // Показываем Level Up модал если уровень повысился
    if (leveledUp) {
      console.log('🎉 LEVEL UP! Уровень:', sessionStore.currentLevel)
      
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