import { ref } from 'vue'
import type { 
  CanvasUseCase as ICanvasUseCase,
  InitCanvasParams,
  InitCanvasResult,
  UpdateCanvasSizeParams,
  UpdateBubblesParams,
  HandleMouseMoveParams,
  HandleClickParams,
  HandleClickResult,
  ExplodeBubbleParams,
  ExplodeBubbleResult,
  CanvasRepository,
  PhysicsRepository,
  EffectsRepository,
  BubbleManagerRepository,
  BubbleStore,
  SessionStore,
  CanvasModalStore
} from './types'
import type { BubbleNode } from '@/types/canvas'

export class CanvasUseCase implements ICanvasUseCase {
  private canvasDomain = {
    width: 0,
    height: 0,
    isInitialized: false,
    nodes: [] as BubbleNode[],
    animationId: 0
  }

  constructor(
    private canvasRepository: CanvasRepository,
    private physicsRepository: PhysicsRepository,
    private effectsRepository: EffectsRepository,
    private bubbleManagerRepository: BubbleManagerRepository,
    private bubbleStore: BubbleStore,
    private sessionStore: SessionStore,
    private modalStore: CanvasModalStore,
    private useSession: ReturnType<typeof import('@/composables/useSession').useSession>,
    private onBubblePopped?: (nodes: BubbleNode[]) => void
  ) {}

  private isDragging = false
  private hoveredBubble: BubbleNode | null = null


  async initCanvas(params: InitCanvasParams): Promise<InitCanvasResult> {
    try {
      const { width, height, canvasRef } = params
      
      if (!canvasRef.value) {
        return { success: false, error: 'Canvas element not found' }
      }

      this.canvasDomain.width = width
      this.canvasDomain.height = height

      // Инициализируем звездное поле
      this.canvasRepository.initStarfield(width, height)

      // Инициализируем физику
      this.physicsRepository.initSimulation(width, height)

      // Начинаем анимацию
      this.animate()

      // Настраиваем обработчики событий
      this.setupEventListeners(canvasRef)

      this.canvasDomain.isInitialized = true

      return { success: true }
    } catch (error) {
      return { success: false, error: `Failed to initialize canvas: ${error}` }
    }
  }

  updateCanvasSize(params: UpdateCanvasSizeParams): void {
    const { width, height } = params
    this.canvasDomain.width = width
    this.canvasDomain.height = height
    this.physicsRepository.updateSimulationSize(width, height)
    this.canvasRepository.updateCanvasSize(width, height)
  }

  updateBubbles(params: UpdateBubblesParams): void {
    const { bubbles } = params
    
    // Сохраняем позиции текущих узлов
    this.bubbleManagerRepository.savePositions(this.canvasDomain.nodes)
    // Создаем новые узлы с помощью BubbleManagerRepository
    this.canvasDomain.nodes = this.bubbleManagerRepository.createNodes(bubbles, this.canvasDomain.width, this.canvasDomain.height)
    
    this.physicsRepository.updateNodes(this.canvasDomain.nodes)
  }

  handleMouseMove(params: HandleMouseMoveParams): void {
    const { event, nodes } = params
    
    if (!nodes.length) return

    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    if (this.isDragging) return

    const newHoveredBubble = this.bubbleManagerRepository.findBubbleUnderCursor(mouseX, mouseY, nodes)

    // Обновляем курсор в зависимости от того, есть ли пузырь под курсором
    const canvas = event.target as HTMLCanvasElement
    if (newHoveredBubble) {
      canvas.style.cursor = 'pointer'
    } else {
      canvas.style.cursor = 'default'
    }

    if (newHoveredBubble !== this.hoveredBubble) {
      if (this.hoveredBubble) {
        this.hoveredBubble.targetRadius = this.hoveredBubble.baseRadius
        this.hoveredBubble.isHovered = false
      }

      this.hoveredBubble = newHoveredBubble

      if (this.hoveredBubble) {
        this.hoveredBubble.targetRadius = this.hoveredBubble.baseRadius * 1.2
        this.hoveredBubble.isHovered = true

        const pushRadius = this.hoveredBubble.baseRadius * 3
        const pushStrength = 4
        this.physicsRepository.pushNeighbors({
          centerBubble: this.hoveredBubble,
          pushRadius,
          pushStrength,
          nodes: this.canvasDomain.nodes // Используем актуальные узлы
        })
      }
    }
  }

  async handleClick(params: HandleClickParams): Promise<HandleClickResult> {
    const { event, nodes, width, height } = params
    
    if (this.isDragging) {
      return { success: false, error: 'Already processing click' }
    }

    this.isDragging = true

    try {
      const rect = (event.target as HTMLCanvasElement).getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const clickedBubble = this.bubbleManagerRepository.findBubbleUnderCursor(mouseX, mouseY, nodes)

      if (clickedBubble && !clickedBubble.isVisited) {
        const result = await this.processBubbleClick(clickedBubble, mouseX, mouseY, this.canvasDomain.nodes, width, height)
        return { success: true, bubblePopped: result.bubblePopped }
      } else if (!clickedBubble) {
        // Клик в пустое место - создаем взрыв
        const explosionRadius = Math.min(width, height) * 0.3
        const explosionStrength = 15
        this.physicsRepository.explodeFromPoint({
          clickX: mouseX,
          clickY: mouseY,
          explosionRadius,
          explosionStrength,
          nodes: this.canvasDomain.nodes, // Используем актуальные узлы
          width,
          height
        })
      }

      return { success: true }
    } finally {
      this.isDragging = false
    }
  }

  async explodeBubble(params: ExplodeBubbleParams): Promise<ExplodeBubbleResult> {
    const { bubble, nodes, width, height } = params

    try {
      // Создаем эффекты взрыва
      this.effectsRepository.explodeBubble(bubble)

      // Создаем floating text с XP (только для обычных пузырей)
      if (!bubble.isQuestion) {
        const { XP_CALCULATOR } = await import('@/config')
        const xpAmount = XP_CALCULATOR.getBubbleXP(bubble.skillLevel)
        
        this.effectsRepository.createFloatingText({
          x: bubble.x,
          y: bubble.y,
          text: `+${xpAmount} XP`,
          type: 'xp',
          color: '#22c55e'
        })
      }

      // Физический взрыв для отталкивания соседних пузырей
      const explosionRadius = bubble.baseRadius * 5
      const explosionStrength = 18
      this.physicsRepository.explodeFromPoint({
        clickX: bubble.x,
        clickY: bubble.y,
        explosionRadius,
        explosionStrength,
        nodes: this.canvasDomain.nodes, // Используем актуальные узлы
        width,
        height
      })

      // Удаляем пузырь из списка
      const remainingNodes = this.bubbleManagerRepository.removeBubble(bubble.id, this.canvasDomain.nodes)
      this.canvasDomain.nodes = remainingNodes

      // Обновляем физику
      this.physicsRepository.updateNodes(remainingNodes)

      if (this.onBubblePopped) {
        this.onBubblePopped(remainingNodes)
      }

      return { success: true, remainingNodes }
    } catch (error) {
      return { success: false, remainingNodes: this.canvasDomain.nodes, error: `Failed to explode bubble: ${error}` }
    }
  }

  // Метод для удаления философского пузыря после ответа
  async removePhilosophyBubble(bubbleId: number): Promise<void> {
    const bubble = this.canvasDomain.nodes.find(node => node.id === bubbleId)
    if (bubble && bubble.isQuestion) {
      await this.explodeBubble({ 
        bubble, 
        nodes: this.canvasDomain.nodes, 
        width: this.canvasDomain.width, 
        height: this.canvasDomain.height 
      })
    }
  }

  // Метод для поиска пузыря по ID
  findBubbleById(bubbleId: number): BubbleNode | undefined {
    return this.canvasDomain.nodes.find(node => node.id === bubbleId)
  }

  createFloatingText(params: { x: number; y: number; text: string; type: 'xp' | 'life'; color?: string }): void {
    this.effectsRepository.createFloatingText(params)
  }

  destroyCanvas(): void {
    if (this.canvasDomain.animationId) {
      cancelAnimationFrame(this.canvasDomain.animationId)
      this.canvasDomain.animationId = 0
    }

    // Очищаем обработчики событий если они есть
    const canvas = this.canvasRepository.getContext()?.canvas as any
    if (canvas && canvas._cleanupEventListeners) {
      canvas._cleanupEventListeners()
    }

    this.physicsRepository.stopSimulation()
    this.effectsRepository.clearAllEffects()
    this.bubbleManagerRepository.clearSavedPositions()
    this.canvasDomain.nodes = []
    this.canvasDomain.isInitialized = false
  }

  render(): void {
    const shakeOffset = this.effectsRepository.calculateShakeOffset()
    
    this.canvasRepository.clearCanvas()
    
    // Получаем контекст один раз
    const context = this.canvasRepository.getContext()
    if (!context) return

    // Применяем тряску
    if (shakeOffset.x !== 0 || shakeOffset.y !== 0) {
      context.save()
      context.translate(shakeOffset.x, shakeOffset.y)
    }

    // Рисуем звездное поле
    this.canvasRepository.drawStarfield()

    // Отрисовываем пузыри
    this.canvasDomain.nodes.forEach((bubble, index) => {
      if (!bubble.isHovered) {
        this.canvasRepository.drawBubble(bubble)
        this.canvasRepository.drawText(bubble)
      }
    })

    // Отрисовываем ховер пузырь поверх остальных
    this.canvasDomain.nodes.forEach(bubble => {
      if (bubble.isHovered) {
        this.canvasRepository.drawBubble(bubble)
        this.canvasRepository.drawText(bubble)
        this.effectsRepository.drawHoverEffect(context, bubble)
      }
    })

    // Отрисовываем эффекты через EffectsRepository
    this.effectsRepository.drawFloatingTexts(context)
    this.effectsRepository.drawDebrisEffects(context, this.canvasDomain.nodes)

    // Восстанавливаем контекст после тряски
    if (shakeOffset.x !== 0 || shakeOffset.y !== 0) {
      context.restore()
    }
  }

  animate(): void {
    this.updateBubbleStates()
    
    // Рендерим только если есть узлы
    if (this.canvasDomain.nodes.length > 0) {
      this.render()
    }
    
    this.canvasDomain.animationId = requestAnimationFrame(() => this.animate())
  }

  // Private methods
  private setupEventListeners(canvasRef: any): void {
    if (!canvasRef.value) return

    const mouseMoveHandler = (event: MouseEvent) => {
      this.handleMouseMove({ event, nodes: this.canvasDomain.nodes })
    }

    const clickHandler = (event: MouseEvent) => {
      this.handleClick({ 
        event, 
        nodes: this.canvasDomain.nodes,
        width: this.canvasDomain.width,
        height: this.canvasDomain.height
      })
    }

    const mouseLeaveHandler = () => {
      this.handleMouseLeave()
    }

    canvasRef.value.addEventListener('mousemove', mouseMoveHandler)
    canvasRef.value.addEventListener('click', clickHandler)
    canvasRef.value.addEventListener('mouseleave', mouseLeaveHandler)

    // Сохраняем ссылки для очистки
    canvasRef.value._cleanupEventListeners = () => {
      canvasRef.value.removeEventListener('mousemove', mouseMoveHandler)
      canvasRef.value.removeEventListener('click', clickHandler)
      canvasRef.value.removeEventListener('mouseleave', mouseLeaveHandler)
    }
  }

  private async processBubbleClick(
    bubble: BubbleNode, 
    mouseX: number, 
    mouseY: number, 
    nodes: BubbleNode[], 
    width: number, 
    height: number
  ): Promise<{ bubblePopped: boolean }> {
    
    if (bubble.isTough) {
      if (bubble.id === undefined) return { bubblePopped: false }
      const result = this.bubbleStore.incrementToughBubbleClicks(bubble.id)
      
      if (result.isReady) {
        bubble.isReady = true
        bubble.isVisited = true
        
        if (bubble.id !== undefined) {
          await this.useSession.visitBubble(bubble.id)
        }
        
        // Показываем модалку с информацией о пузыре (Event Chain сам обработает достижение)
        this.modalStore.openBubbleModal(bubble)
        
        // Разбиваем пузырь
        await this.explodeBubble({ bubble, nodes, width, height })
        return { bubblePopped: true }
      } else {
        // Обрабатываем клик по tough bubble
        this.effectsRepository.createFloatingText({
          x: mouseX,
          y: mouseY,
          text: '+1 XP',
          type: 'xp',
          color: '#22c55e'
        })
        
        // Добавляем эффект отскакивания для крепкого бабла
        this.effectsRepository.animateToughBubbleHit(bubble)
        
        // Добавляем физическое отскакивание от точки клика
        const jump = this.effectsRepository.calculateBubbleJump(mouseX, mouseY, bubble)
        if (jump.vx !== 0 || jump.vy !== 0) {
          bubble.vx = jump.vx
          bubble.vy = jump.vy
        }
        
        const result = await this.useSession.gainXP(1)
        if (result.leveledUp && result.levelData && result.newLevel !== undefined) {
          this.modalStore.openLevelUpModal(result.newLevel, result.levelData)
        }
        
        return { bubblePopped: false }
      }
    }

    if (bubble.isHidden) {
      if (bubble.id === undefined) return { bubblePopped: false }
      
      const result = this.bubbleStore.incrementHiddenBubbleClicks(bubble.id)
      
      if (result.isReady) {
        bubble.isReady = true
        bubble.isVisited = true
        
        if (bubble.id !== undefined) {
          await this.useSession.visitBubble(bubble.id)
        }
        
        // Обрабатываем ачивку
        await this.modalStore.handleSecretBubbleDestroyed()
        
        // Разбиваем пузырь
        await this.explodeBubble({ bubble, nodes, width, height })
        return { bubblePopped: true }
      } else {
        // Обрабатываем клик по скрытому пузырю
        const { GAME_CONFIG } = await import('@/config')
        
        this.effectsRepository.createFloatingText({
          x: mouseX,
          y: mouseY,
          text: `+${GAME_CONFIG.HIDDEN_BUBBLE_XP_PER_CLICK} XP`,
          type: 'xp',
          color: '#22c55e'
        })
        
        // Добавляем эффект отскакивания для скрытого пузыря
        this.effectsRepository.animateToughBubbleHit(bubble)
        
        // Добавляем физическое отскакивание от точки клика
        const jump = this.effectsRepository.calculateBubbleJump(mouseX, mouseY, bubble)
        if (jump.vx !== 0 || jump.vy !== 0) {
          bubble.vx = jump.vx
          bubble.vy = jump.vy
        }
        
        const result = await this.useSession.gainXP(GAME_CONFIG.HIDDEN_BUBBLE_XP_PER_CLICK)
        if (result.leveledUp && result.levelData && result.newLevel !== undefined) {
          this.modalStore.openLevelUpModal(result.newLevel, result.levelData)
        }
        
        return { bubblePopped: false }
      }
    }

    bubble.isVisited = true
    if (bubble.id !== undefined) {
      await this.useSession.visitBubble(bubble.id)
    }

    if (bubble.isQuestion) {
      // Открываем философский модал
      // Используем полные данные вопроса из пузыря
      const question = bubble.questionData || {
        id: bubble.questionId || '',
        type: 'philosophy',
        title: bubble.name,
        question: bubble.description || bubble.name,
        options: [],
        insight: bubble.insight || '',
        description: bubble.description || ''
      }
      if (bubble.id !== undefined) {
        this.modalStore.openPhilosophyModal(question, bubble.id)
      }
      
      // Философские пузыри не лопаются сразу, они остаются до ответа
      return { bubblePopped: false }
    } else {
      // Открываем обычный модал
      this.modalStore.openBubbleModal(bubble)
    }

    return { bubblePopped: false }
  }





  private handleMouseLeave(): void {
    if (this.hoveredBubble) {
      this.hoveredBubble.targetRadius = this.hoveredBubble.baseRadius
      this.hoveredBubble.isHovered = false
      this.hoveredBubble = null
    }
    
    // Сбрасываем курсор при выходе мыши с канваса
    if (this.canvasRepository.getContext()) {
      const canvas = this.canvasRepository.getContext()?.canvas
      if (canvas) {
        canvas.style.cursor = 'default'
      }
    }
  }

  private updateBubbleStates(): void {
    this.bubbleManagerRepository.updateBubbleStates(this.canvasDomain.nodes, this.canvasDomain.width, this.canvasDomain.height)
  }
} 