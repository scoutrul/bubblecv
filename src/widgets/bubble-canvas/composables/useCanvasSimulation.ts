import { ref, type Ref } from 'vue'
import * as d3 from 'd3'
import type { Bubble } from '../../../shared/types'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import { useSessionStore } from '../../../entities/user-session/model/session-store'
import { useModalStore } from '../../../shared/stores/modal-store'

interface CanvasBubble extends Bubble {
  radius: number
  color: string
  oscillationPhase: number
  targetRadius: number
  currentRadius: number
  baseRadius: number
  isHovered?: boolean
  isVisited?: boolean
  textLines?: string[]
}

interface SimulationNode extends CanvasBubble {
  x: number
  y: number
  vx?: number
  vy?: number
}

export function useCanvasSimulation(canvasRef: Ref<HTMLCanvasElement | null>) {
  const isInitialized = ref(false)
  const sessionStore = useSessionStore()
  const modalStore = useModalStore()
  
  let simulation: d3.Simulation<SimulationNode, undefined> | null = null
  let nodes: SimulationNode[] = []
  let ctx: CanvasRenderingContext2D | null = null
  let width = 0
  let height = 0
  let animationId: number = 0
  let hoveredBubble: SimulationNode | null = null
  let restartInterval: number = 0
  
  // Сохранение позиций между фильтрациями
  const savedPositions = new Map<string, { x: number, y: number, vx: number, vy: number }>()

  // Цвета по категориям технологий
  const categoryColors = {
    'foundation': '#3b82f6',
    'framework': '#8b5cf6', 
    'language': '#ec4899',
    'tooling': '#0ea5e9',
    'philosophy': '#10b981',
    'skill': '#f59e0b',
    'library': '#6366f1',
    'runtime': '#06b6d4',
    'preprocessor': '#a855f7',
    'optimization': '#059669',
    'quality': '#dc2626',
    'state-management': '#7c3aed',
    'inclusive': '#2563eb',
    'visualization': '#0891b2',
    'animation': '#be185d',
    'technique': '#16a34a',
    'design': '#ea580c',
    'tool': '#9333ea',
    'soft-skill': '#4f46e5'
  }

  // Проверка Windows для отключения анимации дыхания
  const isWindows = (): boolean => {
    return typeof window !== 'undefined' && /Win/.test(window.navigator.platform)
  }

  // Адаптивный расчет размеров пузырей
  const calculateAdaptiveSizes = (bubbleCount: number): { min: number, max: number } => {
    // Цель: заполнить 75% экрана пузырями
    const screenArea = width * height * 0.75
    const averageAreaPerBubble = screenArea / bubbleCount
    const averageRadius = Math.sqrt(averageAreaPerBubble / Math.PI)
    
    // Диапазон размеров на основе среднего
    const minRadius = Math.max(25, averageRadius * 0.6)
    const maxRadius = Math.min(80, averageRadius * 1.4)
    
    return { min: minRadius, max: maxRadius }
  }

  // Умная обрезка текста на несколько строк
  const wrapText = (text: string, radius: number): string[] => {
    const maxCharsPerLine = Math.max(4, Math.floor(radius / 4))
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine
      } else {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          // Слово слишком длинное, обрезаем
          lines.push(word.slice(0, maxCharsPerLine - 3) + '...')
          currentLine = ''
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    // Максимум 2 строки
    if (lines.length > 2) {
      lines[1] = lines[1].slice(0, -3) + '...'
      return lines.slice(0, 2)
    }
    
    return lines
  }

  // Создание узлов из пузырей
  const createNodes = (bubbles: Bubble[]): SimulationNode[] => {
    const sizes = calculateAdaptiveSizes(bubbles.length)
    
    return bubbles.map((bubble, index) => {
      // Используем уровень навыков для определения относительного размера
      const skillLevels = ['novice', 'intermediate', 'confident', 'expert', 'master']
      const skillIndex = skillLevels.indexOf(bubble.skillLevel)
      const sizeRatio = (skillIndex + 1) / skillLevels.length
      const baseRadius = sizes.min + (sizes.max - sizes.min) * sizeRatio
      
      // Восстанавливаем сохраненные позиции
      const savedPos = savedPositions.get(bubble.id)
      
      const node: SimulationNode = {
        ...bubble,
        radius: baseRadius,
        baseRadius,
        color: categoryColors[bubble.category as keyof typeof categoryColors] || '#667eea',
        oscillationPhase: Math.random() * Math.PI * 2,
        targetRadius: baseRadius,
        currentRadius: baseRadius,
        x: savedPos?.x ?? Math.random() * width,
        y: savedPos?.y ?? Math.random() * height,
        vx: savedPos?.vx ?? 0,
        vy: savedPos?.vy ?? 0,
        isHovered: false,
        isVisited: sessionStore.visitedBubbles.includes(bubble.id),
        textLines: wrapText(bubble.name, baseRadius)
      }
      
      return node
    })
  }

  // Отрисовка реалистичного пузыря
  const drawBubble = (context: CanvasRenderingContext2D, bubble: SimulationNode) => {
    context.save()
    
    const opacity = bubble.isVisited ? 0.3 : (bubble.isHovered ? 1 : 0.8)
    
    // Тень
    context.shadowColor = `rgba(0, 0, 0, ${opacity * 0.3})`
    context.shadowBlur = bubble.isHovered ? 20 : 10
    context.shadowOffsetX = 3
    context.shadowOffsetY = 3
    
    // Основной градиент пузыря
    const mainGradient = context.createRadialGradient(
      bubble.x, bubble.y, 0,
      bubble.x, bubble.y, bubble.currentRadius
    )
    
    const baseColor = d3.color(bubble.color)!
    mainGradient.addColorStop(0, baseColor.brighter(0.3).toString())
    mainGradient.addColorStop(0.7, baseColor.toString())
    mainGradient.addColorStop(1, baseColor.darker(0.5).toString())
    
    // Основной круг
    context.beginPath()
    context.arc(bubble.x, bubble.y, bubble.currentRadius, 0, Math.PI * 2)
    context.fillStyle = mainGradient
    context.globalAlpha = opacity
    context.fill()
    
    // Убираем тень для последующих элементов
    context.shadowColor = 'transparent'
    
    // Глянцевый отблеск
    const highlightGradient = context.createRadialGradient(
      bubble.x - bubble.currentRadius * 0.3,
      bubble.y - bubble.currentRadius * 0.3,
      0,
      bubble.x - bubble.currentRadius * 0.3,
      bubble.y - bubble.currentRadius * 0.3,
      bubble.currentRadius * 0.6
    )
    
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    context.beginPath()
    context.arc(bubble.x, bubble.y, bubble.currentRadius, 0, Math.PI * 2)
    context.fillStyle = highlightGradient
    context.fill()
    
    // Тонкая граница
    context.beginPath()
    context.arc(bubble.x, bubble.y, bubble.currentRadius, 0, Math.PI * 2)
    context.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`
    context.lineWidth = 1
    context.stroke()
    
    context.restore()
  }

  // Отрисовка текста
  const drawText = (context: CanvasRenderingContext2D, bubble: SimulationNode) => {
    if (!bubble.textLines) return
    
    context.save()
    
    const fontSize = Math.max(12, bubble.currentRadius * 0.25)
    context.font = `bold ${fontSize}px Inter, sans-serif`
    context.fillStyle = 'white'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.globalAlpha = bubble.isVisited ? 0.4 : 1
    
    // Тень для текста
    context.shadowColor = 'rgba(0, 0, 0, 0.7)'
    context.shadowBlur = 3
    context.shadowOffsetX = 1
    context.shadowOffsetY = 1
    
    const lineHeight = fontSize * 1.2
    const totalHeight = bubble.textLines.length * lineHeight
    const startY = bubble.y - totalHeight / 2 + lineHeight / 2
    
    bubble.textLines.forEach((line, index) => {
      const y = startY + index * lineHeight
      context.fillText(line, bubble.x, y)
    })
    
    context.restore()
  }

  // Обновление состояния пузырей с живой физикой
  const updateBubbleStates = () => {
    const time = Date.now() * 0.0008
    
    nodes.forEach((bubble, index) => {
      // Живые колебания радиуса (дыхание) - только не на Windows
      if (!isWindows()) {
        const oscillation = Math.sin(time * 2 + bubble.oscillationPhase) * 0.05
        bubble.currentRadius = bubble.targetRadius * (1 + oscillation)
      } else {
        bubble.currentRadius = bubble.targetRadius
      }
      
      // Постоянное броуновское движение
      const phase = index * 1.3
      const oscillationX = Math.sin(time * 0.4 + phase) * 0.3
      const oscillationY = Math.cos(time * 0.6 + phase) * 0.2
      
      // Небольшие случайные возмущения
      const randomX = (Math.random() - 0.5) * 0.05
      const randomY = (Math.random() - 0.5) * 0.05
      
      bubble.x += oscillationX + randomX
      bubble.y += oscillationY + randomY

      // Границы с учетом текущего радиуса
      const padding = bubble.currentRadius + 5
      bubble.x = Math.max(padding, Math.min(width - padding, bubble.x))
      bubble.y = Math.max(padding, Math.min(height - padding, bubble.y))
      
      // Обновляем текстовые строки при изменении размера
      if (Math.abs(bubble.currentRadius - bubble.baseRadius) > 1) {
        bubble.textLines = wrapText(bubble.name, bubble.currentRadius)
      }
    })
  }

  // Рендеринг всех пузырей
  const render = () => {
    if (!ctx || !canvasRef.value) return
    
    // Очищаем canvas
    ctx.clearRect(0, 0, width, height)
    
    // Сначала рисуем обычные пузыри
    nodes.forEach(bubble => {
      if (!bubble.isHovered) {
        drawBubble(ctx!, bubble)
        drawText(ctx!, bubble)
      }
    })
    
    // Затем рисуем hover пузырь поверх всех
    if (hoveredBubble) {
      drawBubble(ctx, hoveredBubble)
      drawText(ctx, hoveredBubble)
    }
  }

  // Основной цикл анимации
  const animate = () => {
    updateBubbleStates()
    render()
    animationId = requestAnimationFrame(animate)
  }

  // Поиск пузыря под курсором
  const findBubbleUnderCursor = (mouseX: number, mouseY: number): SimulationNode | null => {
    // Ищем в обратном порядке (сверху вниз)
    for (let i = nodes.length - 1; i >= 0; i--) {
      const bubble = nodes[i]
      const dx = mouseX - bubble.x
      const dy = mouseY - bubble.y
      if (Math.sqrt(dx * dx + dy * dy) <= bubble.currentRadius) {
        return bubble
      }
    }
    return null
  }

  // Обработка движения мыши
  const handleMouseMove = (event: MouseEvent) => {
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const newHoveredBubble = findBubbleUnderCursor(mouseX, mouseY)

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
  const handleClick = async (event: MouseEvent) => {
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const clickedBubble = findBubbleUnderCursor(mouseX, mouseY)

    if (clickedBubble && !clickedBubble.isVisited) {
      console.log('Пузырь нажат:', clickedBubble.name)
      
      // Анимация клика - плавное изменение размера
      const originalRadius = clickedBubble.targetRadius
      clickedBubble.targetRadius = originalRadius * 0.9
      
      setTimeout(() => {
        clickedBubble.targetRadius = originalRadius * 1.3
        setTimeout(() => {
          clickedBubble.targetRadius = originalRadius
        }, 150)
      }, 100)

      // Начисляем опыт
      if (clickedBubble.isEasterEgg) {
        await sessionStore.gainXP(GAME_CONFIG.XP_PER_EASTER_EGG)
      } else {
        await sessionStore.gainXP(GAME_CONFIG.XP_PER_BUBBLE)
      }

      // Отмечаем пузырь как посещенный
      await sessionStore.visitBubble(clickedBubble.id)
      clickedBubble.isVisited = true
      
      // Открываем модальное окно с деталями
      modalStore.openBubbleModal(clickedBubble)
      
      // Для простоты - удаляем пузырь сразу после клика
      setTimeout(() => {
        removeBubble(clickedBubble.id)
      }, 1000)
    }
  }

  const initSimulation = (canvasWidth: number, canvasHeight: number) => {
    if (!canvasRef.value) return

    width = canvasWidth
    height = canvasHeight
    
    ctx = canvasRef.value.getContext('2d')
    if (!ctx) return
    
    // Инициализируем симуляцию с улучшенной физикой
    simulation = d3.forceSimulation<SimulationNode>()
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.005))
      .force('collision', d3.forceCollide<SimulationNode>().radius(d => d.currentRadius + 8).strength(0.8))
      .force('charge', d3.forceManyBody().strength(-15))
      .force('attract', d3.forceRadial(0, width / 2, height / 2).strength(0.005))
      .alpha(0.3)
      .alphaDecay(0) // Бесконечное движение

    // Принудительно поддерживаем симуляцию
    restartInterval = window.setInterval(() => {
      if (simulation && simulation.alpha() < 0.1) {
        simulation.alpha(0.3).restart()
      }
    }, 3000)

    // Запускаем анимационный цикл
    animate()

    isInitialized.value = true
    console.log('Canvas симуляция инициализирована:', { width, height })
  }

  const updateBubbles = (bubbles: Bubble[]) => {
    if (!simulation || !ctx) return

    // Сохраняем позиции существующих пузырей
    nodes.forEach(node => {
      savedPositions.set(node.id, {
        x: node.x,
        y: node.y,
        vx: node.vx || 0,
        vy: node.vy || 0
      })
    })

    // Создаем новые узлы (с восстановлением позиций)
    nodes = createNodes(bubbles)
    simulation.nodes(nodes)

    // Перезапускаем симуляцию
    simulation.alpha(0.5).restart()

    console.log('Пузыри обновлены:', nodes.length)
  }

  // Удаление пузыря по ID
  const removeBubble = (bubbleId: string) => {
    const index = nodes.findIndex(node => node.id === bubbleId)
    if (index !== -1) {
      nodes.splice(index, 1)
      if (simulation) {
        simulation.nodes(nodes)
        simulation.alpha(0.3).restart()
      }
      console.log('Пузырь удален:', bubbleId)
    }
  }

  const destroySimulation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = 0
    }
    
    if (restartInterval) {
      clearInterval(restartInterval)
      restartInterval = 0
    }
    
    if (simulation) {
      simulation.stop()
      simulation = null
    }
    
    nodes = []
    savedPositions.clear()
    isInitialized.value = false
    console.log('Canvas симуляция остановлена')
  }

  return {
    initSimulation,
    updateBubbles,
    destroySimulation,
    handleMouseMove,
    handleClick,
    handleMouseLeave,
    isInitialized
  }
} 