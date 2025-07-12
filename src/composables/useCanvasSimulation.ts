import { ref, type Ref } from 'vue'
import type { BubbleNode } from '@/types/canvas'
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
  let nodes: BubbleNode[] = []
  let ctx: CanvasRenderingContext2D | null = null
  let width = 0
  let height = 0
  let animationId: number = 0

  const bubbleManager = useBubbleManager()
  const physicsSimulation = usePhysicsSimulation()
  const canvasEffects = useCanvasEffects()
  const canvasRenderer = useCanvasRenderer(canvasRef)
  const { initStarfield, updateStarfieldSize } = canvasRenderer
  const canvasInteraction = useCanvasInteraction(canvasRef, onBubblePopped)

  const updateSimulationSize = (newWidth: number, newHeight: number) => {
    width = newWidth
    height = newHeight
    physicsSimulation.updateSimulationSize(newWidth, newHeight)
    updateStarfieldSize(newWidth, newHeight)
  }

  const updateBubbleStates = () => {
    bubbleManager.updateBubbleStates(nodes, width, height)
  }

  const render = () => {
    if (!canvasRef.value) return
    const shakeOffset = canvasEffects.calculateShakeOffset()
    canvasRenderer.render(
      nodes, 
      width, 
      height,
      shakeOffset,
      canvasInteraction.parallaxOffset.value,
      canvasEffects.drawFloatingTexts,
      canvasEffects.drawHoverEffect
    )
    const context = canvasRef.value.getContext('2d')
    if (context) {
      canvasEffects.drawExplosionEffects(context)
    }
  }

  const animate = () => {
    updateBubbleStates()
    render()
    animationId = requestAnimationFrame(animate)
  }

  const explodeBubble = (bubble: BubbleNode) => {
    const explosionRadius = bubble.baseRadius * 5
    const explosionStrength = 18
    physicsSimulation.explodeFromPoint(bubble.x, bubble.y, explosionRadius, explosionStrength, nodes, width, height)
    bubbleManager.savePositions([bubble])
    nodes = bubbleManager.removeBubble(bubble.id, nodes)
    const simulation = physicsSimulation.getSimulation()
    if (simulation) {
      simulation.nodes(nodes)
    }
    if (onBubblePopped) {
      onBubblePopped(nodes)
    }
  }

  const removeBubbleFromCanvas = (bubbleId: number, xpAmount?: number, isPhilosophyNegative?: boolean) => {
    const bubble = nodes.find(node => node.id === bubbleId)
    if (!bubble) return
    if (xpAmount && xpAmount > 0) {
      canvasEffects.createXPFloatingText(bubble.x, bubble.y, xpAmount, '#22c55e')
    }
    if (isPhilosophyNegative) {
      canvasEffects.createLifeLossFloatingText(bubble.x, bubble.y)
    }
    explodeBubble(bubble)
  }

  const initSimulation = (canvasWidth: number, canvasHeight: number) => {
    if (!canvasRef.value) return
    width = canvasWidth
    height = canvasHeight
    ctx = canvasRef.value.getContext('2d')
    if (!ctx) return
    initStarfield(width, height)
    physicsSimulation.initSimulation(width, height)
    animate()
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
    if (canvasRef.value) {
      canvasRef.value.addEventListener('mousemove', eventHandlers.mouseMoveHandler)
      canvasRef.value.addEventListener('click', eventHandlers.clickHandler)
      canvasRef.value.addEventListener('mouseleave', canvasInteraction.handleMouseLeave)
    }
    const cleanupFn = () => {
      if (canvasRef.value) {
        canvasRef.value.removeEventListener('mousemove', eventHandlers.mouseMoveHandler)
        canvasRef.value.removeEventListener('click', eventHandlers.clickHandler)
        canvasRef.value.removeEventListener('mouseleave', canvasInteraction.handleMouseLeave)
      }
      eventHandlers.removeEventListeners()
    }
    if (canvasRef.value) {
      (canvasRef.value as any)._cleanupEventListeners = cleanupFn
    }
    isInitialized.value = true
  }

  const updateBubbles = (bubbles: BubbleNode[]) => {
    const simulation = physicsSimulation.getSimulation()
    if (!simulation || !ctx) return
    bubbleManager.savePositions(nodes)
    nodes = bubbleManager.createNodes(bubbles, width, height)
    physicsSimulation.updateNodes(nodes)
    simulation.alpha(1).restart()
  }

  const removeBubble = (bubbleId: NormalizedBubble['id']) => {
    nodes = bubbleManager.removeBubble(bubbleId, nodes)
    physicsSimulation.updateNodes(nodes)
    }
  const destroySimulation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = 0
    }
    if (canvasRef.value && (canvasRef.value as any)._cleanupEventListeners) {
      (canvasRef.value as any)._cleanupEventListeners()
    }
    physicsSimulation.stopSimulation()
    canvasEffects.clearAllEffects()
    nodes = []
    bubbleManager.clearSavedPositions()
    isInitialized.value = false
  }
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
    isInitialized,
    removeBubbleFromCanvas
  }
} 