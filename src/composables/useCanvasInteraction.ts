import { type Ref, ref } from 'vue'
import type { Simulation } from 'd3-force'
import type { BubbleNode } from '@/types/canvas'

import { useBubbleStore } from '@/stores/bubble.store'

import type { NormalizedBubble } from '@/types/normalized'
import { XP_CALCULATOR } from '@/config'
import { useAchievement, useSession, useModals } from '@/composables'
import { 
  createQuestionData, 
  animateParallax, 
  animateBubbleClick, 
  animateToughBubbleHit, 
  calculateBubbleJump 
} from '@/utils/canvas-interaction'

export function useCanvasInteraction(
  canvasRef: Ref<HTMLCanvasElement | null>,
  onBubblePopped?: (nodes: BubbleNode[]) => void
) {

  const bubbleStore = useBubbleStore()


  const { gainXP, visitBubble, unlockFirstToughBubbleAchievement } = useSession()
  const { openLevelUpModal, openBubbleModal, openPhilosophyModal, openAchievementModal } = useModals()
  const { unlockAchievement } = useAchievement()
  
  const isDragging = ref(false)
  const hoveredBubble = ref<BubbleNode | null>(null)
  const parallaxOffset = ref({ x: 0, y: 0 })



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

    animateParallax(parallaxOffset.value, mouseX, mouseY, rect.width / 2, rect.height / 2)

    if (isDragging.value) return

    const newHoveredBubble = findBubbleUnderCursor(mouseX, mouseY, nodes)

    if (newHoveredBubble !== hoveredBubble.value) {
      if (hoveredBubble.value) {
        hoveredBubble.value.targetRadius = hoveredBubble.value.baseRadius
        hoveredBubble.value.isHovered = false
      }

      hoveredBubble.value = newHoveredBubble

      if (hoveredBubble.value) {
        hoveredBubble.value.targetRadius = hoveredBubble.value.baseRadius * 1.2
        hoveredBubble.value.isHovered = true
        canvasRef.value!.style.cursor = 'pointer'
        
        const pushRadius = hoveredBubble.value.baseRadius * 3
        const pushStrength = 4
        pushNeighbors(hoveredBubble.value, pushRadius, pushStrength, nodes)
      } else {
        canvasRef.value!.style.cursor = 'default'
      }
    }
  }

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
        if (clickedBubble.isTough) {
          const result = bubbleStore.incrementToughBubbleClicks(clickedBubble.id)
          
          if (result.isReady) {
            await visitBubble(clickedBubble.id)
          } else {
            createXPFloatingText(mouseX, mouseY, 1, '#22c55e')
            const result = await gainXP(1)

            if (result.leveledUp && result.levelData) {
              openLevelUpModal(result.newLevel!, result.levelData)
            }

            const jump = calculateBubbleJump(mouseX, mouseY, clickedBubble)
            clickedBubble.vx += jump.vx
            clickedBubble.vy += jump.vy
            clickedBubble.x += jump.x
            clickedBubble.y += jump.y

            const simulation = getSimulation ? getSimulation() : null
            if (simulation) {
              simulation.alpha(1).restart()
            }
            
            animateToughBubbleHit(clickedBubble)
            return
          }
        }
        
        clickedBubble.isVisited = true
        await visitBubble(clickedBubble.id)
        
        if (clickedBubble.isHidden) {
          const explosionRadius = clickedBubble.baseRadius * 8
          const explosionStrength = 25
          explodeFromPoint(clickedBubble.x, clickedBubble.y, explosionRadius, explosionStrength, nodes, width, height)
          
          const secretXP = XP_CALCULATOR.getSecretBubbleXP()
          const result = await gainXP(secretXP)
          createXPFloatingText(clickedBubble.x, clickedBubble.y, secretXP, '#22c55e')
          
          if (result.leveledUp && result.levelData) {
            openLevelUpModal(result.newLevel!, result.levelData)
          }
          
          const achievement = await unlockAchievement('secret-bubble-discoverer')
          if (achievement) {
            const achievementResult = await gainXP(achievement.xpReward)
            
            if (achievementResult.leveledUp && achievementResult.levelData) {
              openLevelUpModal(achievementResult.newLevel!, achievementResult.levelData)
            }
            
            openAchievementModal({
              title: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              xpReward: achievement.xpReward
            })
          }
          
          removeBubble(clickedBubble.id, nodes)
          return
        }
        
        animateBubbleClick(clickedBubble)
        
        if (clickedBubble.isQuestion) {
          const question = createQuestionData(clickedBubble)
          openPhilosophyModal(question, clickedBubble.id)
        } else {
          openBubbleModal(clickedBubble)
        }
      } else if (!clickedBubble) {
        const explosionRadius = Math.min(width, height) * 0.3
        const explosionStrength = 15
        explodeFromPoint(mouseX, mouseY, explosionRadius, explosionStrength, nodes, width, height)
      }
    } finally {
      isDragging.value = false
    }
  }

  const handleBubbleContinue = async (
    event: Event,
    nodes: BubbleNode[],
    createXPFloatingText: (x: number, y: number, xpAmount: number, color?: string) => void,
    createLifeLossFloatingText: (x: number, y: number) => void,
    explodeBubble: (bubble: BubbleNode) => void,
    removeBubble: (bubbleId: NormalizedBubble['id'], nodes: BubbleNode[]) => BubbleNode[]
  ) => {
    const customEvent = event as CustomEvent
    const { bubbleId, isPhilosophyNegative, skipXP } = customEvent.detail
    
    const bubble = nodes.find(node => node.id === bubbleId)
    if (!bubble) return
    
    let leveledUp = false
    let xpGained = 0
    
    if (bubble.isTough) {
      await unlockFirstToughBubbleAchievement()
      explodeBubble(bubble)
      const remainingNodes = removeBubble(bubble.id, nodes)
      if (onBubblePopped) {
        onBubblePopped(remainingNodes)
      }
      return
    } else if (bubble.isQuestion) {
      if (!isPhilosophyNegative) {
        xpGained = XP_CALCULATOR.getPhilosophyBubbleXP()
        const result = await gainXP(xpGained)
        leveledUp = result.leveledUp
        createXPFloatingText(bubble.x, bubble.y, xpGained, '#22c55e')
        
        if (result.leveledUp && result.levelData) {
          openLevelUpModal(result.newLevel!, result.levelData)
        }
      } else {
        createLifeLossFloatingText(bubble.x, bubble.y)
      }
    } else if (!skipXP) {
      // Обрабатываем XP только если не было уже обработано в useModals
      xpGained = XP_CALCULATOR.getBubbleXP(bubble.skillLevel || 'novice')
      const result = await gainXP(xpGained)
      leveledUp = result.leveledUp
      
      if (xpGained > 0) {
        createXPFloatingText(bubble.x, bubble.y, xpGained, '#22c55e')
      }
      
      if (result.leveledUp && result.levelData) {
        console.log('Opening level up modal for bubble:', result)
        openLevelUpModal(result.newLevel!, result.levelData)
      }
    }
    
    await visitBubble(bubble.id)
    bubble.isVisited = true
    
    // Achievement логика перенесена в useModals.continueBubbleModal
    // чтобы избежать дублирования при multiple событиях
    
    explodeBubble(bubble)
    
    setTimeout(() => {
      const remainingNodes = removeBubble(bubbleId, nodes)
      if (onBubblePopped) {
        onBubblePopped(remainingNodes)
      }
    }, 50)
  }

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

    return {
      mouseMoveHandler,
      clickHandler,
      bubbleContinueHandler,
      removeEventListeners: () => {
        // No event listeners to remove anymore
      }
    }
  }

  const executeBubbleContinue = (
    bubbleId: number,
    nodes: BubbleNode[],
    createXPFloatingText: (x: number, y: number, xpAmount: number, color?: string) => void,
    createLifeLossFloatingText: (x: number, y: number) => void,
    explodeBubble: (bubble: BubbleNode) => void,
    removeBubble: (bubbleId: NormalizedBubble['id'], nodes: BubbleNode[]) => BubbleNode[],
    isPhilosophyNegative?: boolean,
    skipXP?: boolean
  ) => {
    const customEvent = {
      detail: { bubbleId, isPhilosophyNegative, skipXP }
    } as CustomEvent
    
    return handleBubbleContinue(customEvent, nodes, createXPFloatingText, createLifeLossFloatingText, explodeBubble, removeBubble)
  }

  return {
    isDragging,
    hoveredBubble,
    handleMouseMove,
    handleClick,
    handleMouseLeave,
    setupEventListeners,
    handleBubbleContinue,
    executeBubbleContinue,
    parallaxOffset
  }
} 