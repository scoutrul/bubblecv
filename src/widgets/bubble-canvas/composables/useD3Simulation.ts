import { ref, type Ref } from 'vue'
import * as d3 from 'd3'
import type { Bubble } from '@shared/types'
import { GAME_CONFIG } from '@shared/config/game-config'
import { useSessionStore } from '@entities/user-session/model/session-store'
import { useModalStore } from '@shared/stores/modal-store'

interface SimulationNode extends d3.SimulationNodeDatum {
  id: string
  bubble: Bubble
  radius: number
  color: string
}

export function useD3Simulation(svgRef: Ref<SVGElement | null>) {
  const isInitialized = ref(false)
  const sessionStore = useSessionStore()
  const modalStore = useModalStore()
  
  let simulation: d3.Simulation<SimulationNode, undefined> | null = null
  let nodes: SimulationNode[] = []
  let svg: d3.Selection<SVGElement, unknown, null, undefined>
  let width = 0
  let height = 0

  // Размеры пузырей по уровню навыков
  const bubbleSizes = {
    'bubble-novice': 20,
    'bubble-intermediate': 28,
    'bubble-confident': 36,
    'bubble-expert': 44,
    'bubble-master': 52
  }

  // Цвета по категориям технологий
  const categoryColors = {
    'foundation': '#667eea',
    'framework': '#764ba2',
    'language': '#f093fb',
    'tooling': '#4facfe',
    'philosophy': '#43e97b',
    'skill': '#fa709a',
    'library': '#667eea',
    'runtime': '#4facfe',
    'preprocessor': '#f093fb',
    'optimization': '#43e97b',
    'quality': '#fa709a',
    'state-management': '#764ba2',
    'inclusive': '#667eea',
    'visualization': '#4facfe',
    'animation': '#f093fb',
    'technique': '#43e97b',
    'design': '#fa709a',
    'tool': '#764ba2',
    'soft-skill': '#667eea'
  }

  const initSimulation = (canvasWidth: number, canvasHeight: number) => {
    if (!svgRef.value) return

    width = canvasWidth
    height = canvasHeight
    
    svg = d3.select(svgRef.value)
    
    // Очищаем SVG
    svg.selectAll('*').remove()
    
    // Создаем группы для пузырей и текста
    const bubbleGroup = svg.append('g').attr('class', 'bubbles')
    const textGroup = svg.append('g').attr('class', 'bubble-labels')
    
    // Инициализируем симуляцию
    simulation = d3.forceSimulation<SimulationNode>()
      .force('charge', d3.forceManyBody().strength(GAME_CONFIG.SIMULATION.FORCE_STRENGTH))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(GAME_CONFIG.SIMULATION.CENTER_STRENGTH))
      .force('collision', d3.forceCollide<SimulationNode>().radius(d => d.radius * GAME_CONFIG.SIMULATION.COLLISION_RADIUS_MULTIPLIER))
      .velocityDecay(GAME_CONFIG.SIMULATION.VELOCITY_DECAY)
      .on('tick', () => {
        // Обновляем позиции пузырей
        bubbleGroup.selectAll<SVGCircleElement, SimulationNode>('.bubble')
          .attr('cx', d => Math.max(d.radius, Math.min(width - d.radius, d.x || 0)))
          .attr('cy', d => Math.max(d.radius, Math.min(height - d.radius, d.y || 0)))
        
        // Обновляем позиции текста
        textGroup.selectAll<SVGTextElement, SimulationNode>('.bubble-label')
          .attr('x', d => Math.max(d.radius, Math.min(width - d.radius, d.x || 0)))
          .attr('y', d => Math.max(d.radius, Math.min(height - d.radius, d.y || 0)))
      })

    isInitialized.value = true
    console.log('D3 симуляция инициализирована:', { width, height })
  }

  const updateBubbles = (bubbles: Bubble[]) => {
    if (!simulation || !svg) return

    // Преобразуем пузыри в узлы симуляции
    const newNodes: SimulationNode[] = bubbles.map(bubble => ({
      id: bubble.id,
      bubble,
      radius: bubbleSizes[bubble.size as keyof typeof bubbleSizes] || 30,
      color: categoryColors[bubble.category as keyof typeof categoryColors] || '#667eea',
      x: Math.random() * width,
      y: Math.random() * height
    }))

    // Обновляем узлы симуляции
    nodes = newNodes
    simulation.nodes(nodes)

    // Обновляем визуализацию
    const bubbleGroup = svg.select('.bubbles')
    const textGroup = svg.select('.bubble-labels')
    
    // Привязываем данные
    const bubbleSelection = bubbleGroup
      .selectAll<SVGCircleElement, SimulationNode>('.bubble')
      .data(nodes, d => d.id)

    // Удаляем старые пузыри с анимацией
    bubbleSelection.exit()
      .transition()
      .duration(GAME_CONFIG.ANIMATION.BUBBLE_HOVER)
      .attr('r', 0)
      .style('opacity', 0)
      .remove()

    // Добавляем новые пузыри
    const enterSelection = bubbleSelection.enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('r', 0)
      .attr('cx', d => d.x || 0)
      .attr('cy', d => d.y || 0)
      .style('fill', d => d.color)
      .style('stroke', '#ffffff')
      .style('stroke-width', 2)
      .style('opacity', 0)
      .style('cursor', 'pointer')

    // Анимация появления новых пузырей
    enterSelection
      .transition()
      .duration(GAME_CONFIG.ANIMATION.BUBBLE_HOVER)
      .attr('r', d => d.radius)
      .style('opacity', 0.8)

    // Объединяем новые и существующие пузыри
    const allBubbles = enterSelection.merge(bubbleSelection)

    // Добавляем интерактивность
    allBubbles
      .on('mouseenter', function(event, d) {
        // Hover эффект
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius * 1.1)
          .style('opacity', 1)
          .style('stroke-width', 3)
      })
      .on('mouseleave', function(event, d) {
        // Возврат к обычному состоянию
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius)
          .style('opacity', 0.8)
          .style('stroke-width', 2)
      })
      .on('click', async function(event, d) {
        // Клик по пузырю - получение опыта
        console.log('Пузырь нажат:', d.bubble.name)
        
        // Анимация клика
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', d.radius * 0.9)
          .transition()
          .duration(100)
          .attr('r', d.radius * 1.1)
          .transition()
          .duration(100)
          .attr('r', d.radius)

        // Начисляем опыт
        if (d.bubble.isEasterEgg) {
          await sessionStore.gainXP(GAME_CONFIG.XP_PER_EASTER_EGG)
        } else {
          await sessionStore.gainXP(GAME_CONFIG.XP_PER_BUBBLE)
        }

        // Отмечаем пузырь как посещенный
        await sessionStore.visitBubble(d.bubble.id)
        
        // Открываем модальное окно с деталями
        modalStore.openBubbleModal(d.bubble)
      })

    // Обновляем существующие пузыри
    allBubbles
      .transition()
      .duration(GAME_CONFIG.ANIMATION.BUBBLE_HOVER)
      .attr('r', d => d.radius)
      .style('fill', d => d.color)

    // Обновляем текстовые метки
    const labelSelection = textGroup
      .selectAll<SVGTextElement, SimulationNode>('.bubble-label')
      .data(nodes, d => d.id)

    // Удаляем старые метки
    labelSelection.exit().remove()

    // Добавляем новые метки
    const enterLabels = labelSelection.enter()
      .append('text')
      .attr('class', 'bubble-label')
      .attr('x', d => d.x || 0)
      .attr('y', d => d.y || 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('fill', '#ffffff')
      .style('font-size', d => `${Math.max(10, d.radius / 3)}px`)
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => {
        const maxLength = Math.floor(d.radius / 4)
        return d.bubble.name.length > maxLength 
          ? d.bubble.name.substring(0, maxLength) + '...'
          : d.bubble.name
      })

    // Объединяем новые и существующие метки
    enterLabels.merge(labelSelection)
      .style('font-size', d => `${Math.max(10, d.radius / 3)}px`)
      .text(d => {
        const maxLength = Math.floor(d.radius / 4)
        return d.bubble.name.length > maxLength 
          ? d.bubble.name.substring(0, maxLength) + '...'
          : d.bubble.name
      })

    // Перезапускаем симуляцию
    simulation.alpha(1).restart()

    console.log('Пузыри обновлены:', nodes.length)
  }

  const destroySimulation = () => {
    if (simulation) {
      simulation.stop()
      simulation = null
    }
    
    if (svg) {
      svg.selectAll('*').remove()
    }
    
    nodes = []
    isInitialized.value = false
    console.log('D3 симуляция уничтожена')
  }

  const addBreatheAnimation = () => {
    if (!svg) return
    
         // Добавляем дыхательную анимацию для пузырей
     svg.selectAll('.bubble')
       .transition()
       .duration(2000)
       .ease(d3.easeSinInOut)
       .style('opacity', 0.6)
       .transition()
       .duration(2000)
       .ease(d3.easeSinInOut)
       .style('opacity', 0.8)
      .on('end', function() {
        d3.select(this).call(function() { addBreatheAnimation() })
      })
  }

  return {
    initSimulation,
    updateBubbles,
    destroySimulation,
    addBreatheAnimation,
    isInitialized
  }
} 