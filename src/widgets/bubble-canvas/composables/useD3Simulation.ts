import { ref, type Ref } from 'vue'
import * as d3 from 'd3'
import type { Bubble } from '../../../shared/types'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import { useSessionStore } from '../../../entities/user-session/model/session-store'
import { useModalStore } from '../../../shared/stores/modal-store'

interface ExtendedBubble extends Bubble {
  radius: number
  color: string
  oscillationPhase: number
  targetRadius: number
  currentRadius: number
  baseRadius: number
}

interface SimulationNode extends d3.SimulationNodeDatum, ExtendedBubble {}

export function useD3Simulation(svgRef: Ref<SVGElement | null>) {
  const isInitialized = ref(false)
  const sessionStore = useSessionStore()
  const modalStore = useModalStore()
  
  let simulation: d3.Simulation<SimulationNode, undefined> | null = null
  let nodes: SimulationNode[] = []
  let svg: d3.Selection<SVGElement, unknown, null, undefined>
  let width = 0
  let height = 0
  let animationId: number = 0
  let hoveredBubble: SimulationNode | null = null
  let restartInterval: number = 0

  // Размеры пузырей по уровню навыков
  const bubbleSizes = {
    'bubble-novice': 20,
    'bubble-intermediate': 28,
    'bubble-confident': 36,
    'bubble-expert': 44,
    'bubble-master': 52
  }

  // Цвета по категориям технологий (более яркие для лучшего вида)
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

  // Создание узлов из пузырей
  const createNodes = (bubbles: Bubble[]): SimulationNode[] => {
    return bubbles.map((bubble, index) => {
      const baseRadius = bubbleSizes[bubble.size as keyof typeof bubbleSizes] || 30
      
      return {
        ...bubble,
        radius: baseRadius,
        baseRadius,
        color: categoryColors[bubble.category as keyof typeof categoryColors] || '#667eea',
        oscillationPhase: Math.random() * Math.PI * 2,
        targetRadius: baseRadius,
        currentRadius: baseRadius,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0
      }
    })
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
      
      // Убеждаемся что позиции инициализированы
      if (bubble.x === undefined) bubble.x = width / 2
      if (bubble.y === undefined) bubble.y = height / 2
      
      // Постоянное броуновское движение
      const phase = index * 1.3
      const oscillationX = Math.sin(time * 0.4 + phase) * 0.5
      const oscillationY = Math.cos(time * 0.6 + phase) * 0.3
      
      // Небольшие случайные возмущения
      const randomX = (Math.random() - 0.5) * 0.1
      const randomY = (Math.random() - 0.5) * 0.1
      
      bubble.x += oscillationX + randomX
      bubble.y += oscillationY + randomY

      // Границы с учетом текущего радиуса
      const minPadding = 2
      const paddingX = bubble.currentRadius + minPadding
      const paddingY = bubble.currentRadius + minPadding
      
      bubble.x = Math.max(paddingX, Math.min(width - paddingX, bubble.x))
      bubble.y = Math.max(paddingY, Math.min(height - paddingY, bubble.y))
    })
  }

  // Создание градиентов для пузырей
  const createGradients = () => {
    const defs = svg.select('defs')
      .empty() ? svg.append('defs') : svg.select('defs')

    nodes.forEach(bubble => {
      const gradientId = `gradient-${bubble.id}`
      
      // Удаляем существующий градиент
      defs.select(`#${gradientId}`).remove()
      
      // Создаем новый радиальный градиент
      const gradient = defs.append('radialGradient')
        .attr('id', gradientId)
        .attr('cx', '30%')
        .attr('cy', '30%')
        .attr('r', '70%')

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', bubble.color)
        .attr('stop-opacity', 1)

      gradient.append('stop')
        .attr('offset', '70%')
        .attr('stop-color', bubble.color)
        .attr('stop-opacity', 0.8)

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.rgb(bubble.color).darker(0.5).toString())
        .attr('stop-opacity', 0.9)
    })
  }

  // Рендеринг пузырей
  const renderBubbles = () => {
    if (!svg) return

    const bubbleGroup = svg.select('.bubbles')
    const textGroup = svg.select('.bubble-labels')
    
    // Получаем актуальные selections с обновленными данными
    const bubbleSelection = bubbleGroup.selectAll<SVGCircleElement, SimulationNode>('.bubble')
      .data(nodes, d => d.id)
    
    const textSelection = textGroup.selectAll<SVGTextElement, SimulationNode>('.bubble-label')
      .data(nodes, d => d.id)
    
    // Обновляем позиции и размеры пузырей
    bubbleSelection
      .attr('cx', d => d.x || 0)
      .attr('cy', d => d.y || 0)
      .attr('r', d => d.currentRadius)
      .style('filter', d => d === hoveredBubble ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))')

    // Обновляем позиции текста СИНХРОННО с теми же данными
    textSelection
      .attr('x', d => d.x || 0)
      .attr('y', d => d.y || 0)
      .style('font-size', d => `${Math.max(10, d.currentRadius * 0.25)}px`)
      .text(d => {
        // Динамически обрезаем текст в зависимости от текущего размера
        const maxLength = Math.max(3, Math.floor(d.currentRadius / 4))
        return d.name.length > maxLength ? d.name.slice(0, maxLength) + '...' : d.name
      })
  }

  // Основной цикл анимации
  const animate = () => {
    updateBubbleStates()
    renderBubbles()
    animationId = requestAnimationFrame(animate)
  }

  // Поиск пузыря под курсором
  const findBubbleUnderCursor = (mouseX: number, mouseY: number): SimulationNode | null => {
    return nodes.find(bubble => {
      const dx = mouseX - (bubble.x || 0)
      const dy = mouseY - (bubble.y || 0)
      return Math.sqrt(dx * dx + dy * dy) <= bubble.currentRadius
    }) || null
  }

  // Обработка движения мыши
  const handleMouseMove = (event: MouseEvent) => {
    if (!svgRef.value) return

    const rect = svgRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const newHoveredBubble = findBubbleUnderCursor(mouseX, mouseY)

    if (newHoveredBubble !== hoveredBubble) {
      // Сброс предыдущего ховера
      if (hoveredBubble) {
        hoveredBubble.targetRadius = hoveredBubble.baseRadius
      }

      hoveredBubble = newHoveredBubble

      // Применение нового ховера
      if (hoveredBubble) {
        hoveredBubble.targetRadius = hoveredBubble.baseRadius * 1.3
        svgRef.value!.style.cursor = 'pointer'
      } else {
        svgRef.value!.style.cursor = 'default'
      }
    }
  }

  // Обработка кликов
  const handleClick = async (event: MouseEvent) => {
    if (!svgRef.value) return

    const rect = svgRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const clickedBubble = findBubbleUnderCursor(mouseX, mouseY)

    if (clickedBubble) {
      console.log('Пузырь нажат:', clickedBubble.name)
      
      // Анимация клика - увеличение и уменьшение
      const originalRadius = clickedBubble.targetRadius
      clickedBubble.targetRadius = originalRadius * 0.8
      
      setTimeout(() => {
        clickedBubble.targetRadius = originalRadius * 1.4
        setTimeout(() => {
          clickedBubble.targetRadius = originalRadius
        }, 100)
      }, 100)

      // Начисляем опыт
      if (clickedBubble.isEasterEgg) {
        await sessionStore.gainXP(GAME_CONFIG.XP_PER_EASTER_EGG)
      } else {
        await sessionStore.gainXP(GAME_CONFIG.XP_PER_BUBBLE)
      }

      // Отмечаем пузырь как посещенный
      await sessionStore.visitBubble(clickedBubble.id)
      
      // Открываем модальное окно с деталями
      modalStore.openBubbleModal(clickedBubble)
    }
  }

  const initSimulation = (canvasWidth: number, canvasHeight: number) => {
    if (!svgRef.value) return

    width = canvasWidth
    height = canvasHeight
    
    svg = d3.select(svgRef.value)
    
    // Очищаем SVG
    svg.selectAll('*').remove()
    
    // Создаем группы для пузырей и текста
    svg.append('g').attr('class', 'bubbles')
    svg.append('g').attr('class', 'bubble-labels')
    
    // Инициализируем симуляцию с улучшенной физикой
    simulation = d3.forceSimulation<SimulationNode>()
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.01))
      .force('collision', d3.forceCollide<SimulationNode>().radius(d => d.currentRadius + 5).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-10)) // Очень слабое отталкивание
      .force('attract', d3.forceRadial(0, width / 2, height / 2).strength(0.01)) // Слабое притяжение к центру
      .alpha(0.2)
      .alphaDecay(0) // Бесконечное движение - отключаем затухание

    // Добавляем обработчики событий
    svgRef.value.addEventListener('mousemove', handleMouseMove)
    svgRef.value.addEventListener('click', handleClick)

    // Принудительно поддерживаем симуляцию
    restartInterval = window.setInterval(() => {
      if (simulation && simulation.alpha() < 0.1) {
        simulation.alpha(0.3).restart()
      }
    }, 2000)

    // Запускаем анимационный цикл
    animate()

    isInitialized.value = true
    console.log('D3 симуляция инициализирована:', { width, height })
  }

  const updateBubbles = (bubbles: Bubble[]) => {
    if (!simulation || !svg) return

    // Останавливаем старую анимацию
    if (animationId) {
      cancelAnimationFrame(animationId)
    }

    // Создаем новые узлы
    nodes = createNodes(bubbles)
    simulation.nodes(nodes)

    // Создаем градиенты
    createGradients()

    // Обновляем визуализацию
    const bubbleGroup = svg.select('.bubbles')
    const textGroup = svg.select('.bubble-labels')
    
    // Привязываем данные к пузырям с ключом
    const bubbleSelection = bubbleGroup
      .selectAll<SVGCircleElement, SimulationNode>('.bubble')
      .data(nodes, d => d.id)

    // Удаляем старые пузыри
    bubbleSelection.exit().remove()

    // Добавляем новые пузыри
    const enterBubbles = bubbleSelection.enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('cx', d => d.x || 0)
      .attr('cy', d => d.y || 0)
      .attr('r', d => d.currentRadius)
      .style('fill', d => `url(#gradient-${d.id})`)
      .style('stroke', '#ffffff')
      .style('stroke-width', 1)
      .style('opacity', 0.9)

    // Объединяем новые и существующие пузыри
    enterBubbles.merge(bubbleSelection)

    // Привязываем данные к тексту с ТЕМ ЖЕ ключом
    const textSelection = textGroup
      .selectAll<SVGTextElement, SimulationNode>('.bubble-label')
      .data(nodes, d => d.id)

    // Удаляем старый текст
    textSelection.exit().remove()

    // Добавляем новый текст
    const enterText = textSelection.enter()
      .append('text')
      .attr('class', 'bubble-label')
      .attr('x', d => d.x || 0)
      .attr('y', d => d.y || 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', 'white')
      .style('font-family', 'Inter, sans-serif')
      .style('font-weight', 'bold')
      .style('font-size', d => `${Math.max(10, d.currentRadius * 0.25)}px`)
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => {
        // Динамически обрезаем текст в зависимости от текущего размера
        const maxLength = Math.max(3, Math.floor(d.currentRadius / 4))
        return d.name.length > maxLength ? d.name.slice(0, maxLength) + '...' : d.name
      })

    // Объединяем новый и существующий текст
    enterText.merge(textSelection)

    // Перезапускаем симуляцию
    simulation.alpha(1).restart()
    
    // Запускаем анимационный цикл
    animate()

    console.log('Пузыри обновлены:', nodes.length)
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

    if (svgRef.value) {
      svgRef.value.removeEventListener('mousemove', handleMouseMove)
      svgRef.value.removeEventListener('click', handleClick)
    }
    
    nodes = []
    isInitialized.value = false
    console.log('D3 симуляция остановлена')
  }

  return {
    initSimulation,
    updateBubbles,
    destroySimulation,
    isInitialized
  }
} 