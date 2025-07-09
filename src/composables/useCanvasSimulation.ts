import { ref, type Ref } from 'vue'
import type { BubbleNode } from '@/types/canvas'

// Импорты всех модулей
import { useBubbleManager } from './useBubbleManager'
import { usePhysicsSimulation } from './usePhysicsSimulation'
import { useCanvasEffects } from './useCanvasEffects'
import { useCanvasRenderer } from './useCanvasRenderer'
import { useCanvasInteraction } from './useCanvasInteraction'
import type { NormalizedBubble } from '@/types/normalized'

export function useCanvasSimulation(
  canvasRef: Ref<HTMLCanvasElement | null>,
  onBubblePopped?: (nodes: BubbleNode[]) => void
) {
  const isInitialized = ref(false)
  
  // Состояние canvas
  let nodes: BubbleNode[] = []
  let ctx: CanvasRenderingContext2D | null = null
  let width = 0
  let height = 0
  let animationId: number = 0
  
  // Инициализация всех модулей
  const bubbleManager = useBubbleManager()
  const physicsSimulation = usePhysicsSimulation()
  const canvasEffects = useCanvasEffects()
  const canvasRenderer = useCanvasRenderer(canvasRef)
  const { initStarfield, updateStarfieldSize } = canvasRenderer
  const canvasInteraction = useCanvasInteraction(canvasRef, onBubblePopped)

  // Обновление размеров симуляции при ресайзе окна
  const updateSimulationSize = (newWidth: number, newHeight: number) => {
    width = newWidth
    height = newHeight
    physicsSimulation.updateSimulationSize(newWidth, newHeight)
    updateStarfieldSize(newWidth, newHeight)
  }

  // Обновление состояния пузырей с живой физикой
  const updateBubbleStates = () => {
    bubbleManager.updateBubbleStates(nodes, width, height)
  }

  // Отрисовка всего канваса
  const render = () => {
    if (!canvasRef.value) return
    
    // Получаем смещение тряски
    const shakeOffset = canvasEffects.calculateShakeOffset()
    
    // Отрисовываем основной контент
    canvasRenderer.render(
      nodes, 
      width, 
      height,
      shakeOffset,
      canvasInteraction.parallaxOffset.value,
      canvasEffects.drawFloatingTexts,
      canvasEffects.drawHoverEffect
    )

    // Отрисовываем эффекты взрыва поверх всего
    const context = canvasRef.value.getContext('2d')
    if (context) {
      canvasEffects.drawExplosionEffects(context)
    }
  }

  // Основной цикл анимации
  const animate = () => {
    updateBubbleStates()
    render()
    animationId = requestAnimationFrame(animate)
  }

  // Взрыв пузыря с удалением
  const explodeBubble = (bubble: BubbleNode) => {
    // Создаем мощный эффект отталкивания от центра пузыря
    const explosionRadius = bubble.baseRadius * 5 // Радиус волны
    const explosionStrength = 18 // Сила волны
    physicsSimulation.explodeFromPoint(bubble.x, bubble.y, explosionRadius, explosionStrength, nodes, width, height)
    
    // Сохраняем позицию перед удалением
    bubbleManager.savePositions([bubble])
    
    // Удаляем пузырь из симуляции
    nodes = bubbleManager.removeBubble(bubble.id, nodes)
    const simulation = physicsSimulation.getSimulation()
    if (simulation) {
      simulation.nodes(nodes)
    }
    
    // Вызываем callback с обновленным списком узлов
    if (onBubblePopped) {
      onBubblePopped(nodes)
    }
  }

  // Инициализация симуляции
  const initSimulation = (canvasWidth: number, canvasHeight: number) => {
    if (!canvasRef.value) return

    width = canvasWidth
    height = canvasHeight
    
    ctx = canvasRef.value.getContext('2d')
    if (!ctx) return
    
    // Инициализируем звездное поле
    initStarfield(width, height)

    // Инициализируем физическую симуляцию
    physicsSimulation.initSimulation(width, height)

    // Запускаем анимационный цикл
    animate()

    // Настраиваем обработчики событий
    const eventHandlers = canvasInteraction.setupEventListeners(
      () => nodes,
      () => width,
      () => height,
      bubbleManager.findBubbleUnderCursor,
      physicsSimulation.pushNeighbors,
      physicsSimulation.explodeFromPoint,
      canvasEffects.createXPFloatingText,
      canvasEffects.createLifeLossFloatingText,
      explodeBubble,
      (bubbleId: NormalizedBubble['id'], currentNodes: BubbleNode[]) => {
        const newNodes = bubbleManager.removeBubble(bubbleId, currentNodes)
        physicsSimulation.updateNodes(newNodes)
        nodes = newNodes
        return newNodes
      },
      physicsSimulation.getSimulation
    )

    // Добавляем обработчики событий мыши к canvas
    if (canvasRef.value) {
      canvasRef.value.addEventListener('mousemove', eventHandlers.mouseMoveHandler)
      canvasRef.value.addEventListener('click', eventHandlers.clickHandler)
      canvasRef.value.addEventListener('mouseleave', canvasInteraction.handleMouseLeave)
    }

    // Сохраняем функцию очистки для использования при уничтожении
    const cleanupFn = () => {
      if (canvasRef.value) {
        canvasRef.value.removeEventListener('mousemove', eventHandlers.mouseMoveHandler)
        canvasRef.value.removeEventListener('click', eventHandlers.clickHandler)
        canvasRef.value.removeEventListener('mouseleave', canvasInteraction.handleMouseLeave)
      }
      eventHandlers.removeEventListeners()
    }

    // Сохраняем функцию очистки в canvas элементе
    if (canvasRef.value) {
      (canvasRef.value as any)._cleanupEventListeners = cleanupFn
    }

    isInitialized.value = true

  }

  // Обновление пузырей
  const updateBubbles = (bubbles: BubbleNode[]) => {
    const simulation = physicsSimulation.getSimulation()
    if (!simulation || !ctx) return

    // Сохраняем позиции существующих пузырей
    bubbleManager.savePositions(nodes)

    // Создаем новые узлы (с восстановлением позиций)
    nodes = bubbleManager.createNodes(bubbles, width, height)

    // Обновляем физическую симуляцию с новыми узлами
    physicsSimulation.updateNodes(nodes)

    // Принудительно запускаем симуляцию для новых узлов
    simulation.alpha(1).restart()
  }

  // Удаление пузыря по ID
  const removeBubble = (bubbleId: NormalizedBubble['id']) => {
    nodes = bubbleManager.removeBubble(bubbleId, nodes)
    physicsSimulation.updateNodes(nodes)
    }
    
  // Остановка симуляции
  const destroySimulation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = 0
    }
    
    // Очищаем обработчики событий
    if (canvasRef.value && (canvasRef.value as any)._cleanupEventListeners) {
      (canvasRef.value as any)._cleanupEventListeners()
    }
    
    // Останавливаем физическую симуляцию
    physicsSimulation.stopSimulation()
    
    // Очищаем эффекты
    canvasEffects.clearAllEffects()
    
    // Очищаем данные пузырей
    nodes = []
    bubbleManager.clearSavedPositions()
    
    isInitialized.value = false

  }

  // Обработчики событий для совместимости с существующим API
  const handleMouseMove = (event: MouseEvent) => {
    canvasInteraction.handleMouseMove(
      event, 
      nodes, 
      bubbleManager.findBubbleUnderCursor, 
      physicsSimulation.pushNeighbors
    )
  }

  const handleClick = (event: MouseEvent) => {
    canvasInteraction.handleClick(
      event,
      nodes,
      width,
      height,
      bubbleManager.findBubbleUnderCursor,
      physicsSimulation.explodeFromPoint,
      canvasEffects.createXPFloatingText,
      canvasEffects.createLifeLossFloatingText,
      (bubbleId: NormalizedBubble['id']) => {
        nodes = bubbleManager.removeBubble(bubbleId, nodes)
        physicsSimulation.updateNodes(nodes)
        return nodes
      }
    )
  }

  const handleMouseLeave = () => {
    canvasInteraction.handleMouseLeave()
  }

  return {
    initSimulation,
    updateBubbles,
    updateSimulationSize,
    destroySimulation,
    handleMouseMove,
    handleClick,
    handleMouseLeave,
    isInitialized
  }
} 