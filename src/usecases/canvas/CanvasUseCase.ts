import { type Ref } from 'vue'
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
import { addPendingBubbleRemoval } from '@/composables/useModals'
import { XP_CALCULATOR, GAME_CONFIG } from '@/config'
import { usePerformanceStore } from '@/stores/performance.store'
import { useClickerStore } from '@/stores/clicker.store'

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

  // Получаем текущий уровень игрока (ускоряем при активном кликере)
  private getCurrentLevel(): number {
    const clicker = useClickerStore()
    if (clicker.isActive) {
      return GAME_CONFIG.clicker.SPEED_LEVEL
    }
    return this.sessionStore.session?.currentLevel || 1
  }

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
      const currentLevel = this.getCurrentLevel()
      await this.physicsRepository.initSimulation(width, height, currentLevel)

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
    
    // Обновляем узлы без жесткого ресета инерции
    this.physicsRepository.updateNodes(this.canvasDomain.nodes)

    // Синхронизируем количество активных узлов с панелью производительности
    const performanceStore = usePerformanceStore()
    performanceStore.updateActiveNodes(this.canvasDomain.nodes.length)
  }

  async handleMouseMove(params: HandleMouseMoveParams): Promise<void> {
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
      if (this.hoveredBubble && this.hoveredBubble.baseRadius) {
        this.hoveredBubble.targetRadius = this.hoveredBubble.baseRadius
        this.hoveredBubble.isHovered = false
      }

      this.hoveredBubble = newHoveredBubble

      if (this.hoveredBubble && this.hoveredBubble.baseRadius) {
        // Сохраняем ссылку локально для защиты от race conditions
        const currentHoveredBubble = this.hoveredBubble
        
        currentHoveredBubble.targetRadius = currentHoveredBubble.baseRadius * 1.2
        currentHoveredBubble.isHovered = true

        const currentLevel = this.getCurrentLevel()
        const { PHYSICS_CALCULATOR } = await import('@/config')
        const explosionPhysics = PHYSICS_CALCULATOR.getExplosionPhysics(currentLevel)
        
        // Дополнительная проверка после асинхронной операции
        if (currentHoveredBubble && currentHoveredBubble.baseRadius) {
          const pushRadius = currentHoveredBubble.baseRadius * explosionPhysics.hoverPushRadiusMultiplier
          const pushStrength = explosionPhysics.hoverPushStrengthBase
          this.physicsRepository.pushNeighbors({
            centerBubble: currentHoveredBubble,
            pushRadius,
            pushStrength,
            nodes: this.canvasDomain.nodes // Используем актуальные узлы
          }, currentLevel)
        }
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

      const clicker = useClickerStore()
      // Block all interactions during countdown (active but not running)
      if (clicker.isActive && !clicker.isRunning) {
        return { success: true }
      }
      if (clicker.isActive && clicker.isRunning) {
        // Clicker mode: instant pop, no XP/modals, with tough gating and bounce
        if (clickedBubble) {
          if (clickedBubble.isTough) {
            // Visual feedback on each tough click
            this.effectsRepository.animateToughBubbleHit(clickedBubble)
            const currentLevel = this.getCurrentLevel()
            const jump = await this.effectsRepository.calculateBubbleJump(mouseX, mouseY, clickedBubble, 1, currentLevel)
            if (jump.vx !== 0 || jump.vy !== 0) {
              clickedBubble.vx = jump.vx
              clickedBubble.vy = jump.vy
            }
            clickedBubble.x += jump.x
            clickedBubble.y += jump.y
          }

          const shouldPop = clicker.onBubblePopped(clickedBubble.id, !!clickedBubble.isTough)
          if (shouldPop) {
            await this.explodeBubble({
              bubble: clickedBubble,
              nodes: this.canvasDomain.nodes,
              width: this.canvasDomain.width,
              height: this.canvasDomain.height
            })
          }
        } else {
          // Optional: small explosion on empty space (feedback)
          const currentLevel = this.getCurrentLevel()
          const { PHYSICS_CALCULATOR } = await import('@/config')
          const explosionPhysics = PHYSICS_CALCULATOR.getExplosionPhysics(currentLevel)
          const explosionRadius = Math.min(width, height) * explosionPhysics.explosionRadiusMultiplier
          const explosionStrength = explosionPhysics.explosionStrengthBase
          this.physicsRepository.explodeFromPoint({
            clickX: mouseX,
            clickY: mouseY,
            explosionRadius,
            explosionStrength,
            nodes: this.canvasDomain.nodes,
            width,
            height
          }, currentLevel)
        }

        return { success: true }
      }

      if (clickedBubble && !clickedBubble.isVisited) {
        const result = await this.processBubbleClick(clickedBubble, mouseX, mouseY, this.canvasDomain.nodes, width, height)
        return { success: true, bubblePopped: result.bubblePopped }
      } else if (!clickedBubble) {
        // Клик в пустое место - создаем взрыв
        const currentLevel = this.getCurrentLevel()
        const { PHYSICS_CALCULATOR } = await import('@/config')
        const explosionPhysics = PHYSICS_CALCULATOR.getExplosionPhysics(currentLevel)
        
        const explosionRadius = Math.min(width, height) * explosionPhysics.explosionRadiusMultiplier
        const explosionStrength = explosionPhysics.explosionStrengthBase
        this.physicsRepository.explodeFromPoint({
          clickX: mouseX,
          clickY: mouseY,
          explosionRadius,
          explosionStrength,
          nodes: this.canvasDomain.nodes, // Используем актуальные узлы
          width,
          height
        }, currentLevel)
      }

      return { success: true }
    } finally {
      this.isDragging = false
    }
  }

  async explodeBubble(params: ExplodeBubbleParams): Promise<ExplodeBubbleResult> {
    const { bubble, nodes, width, height } = params

    try {
      // Запускаем CSS тряску игровой сцены
      const { useUiEventStore } = await import('@/stores')
      const uiEventStore = useUiEventStore()
      uiEventStore.triggerGameSceneShake()
      
      // Создаем эффекты взрыва
      this.effectsRepository.explodeBubble(bubble)

      // СРАЗУ удаляем пузырь из списка
      const remainingNodes = this.bubbleManagerRepository.removeBubble(bubble.id, this.canvasDomain.nodes)
      this.canvasDomain.nodes = remainingNodes

      // СРАЗУ выполняем физический взрыв (синхронно)
      const currentLevel = this.getCurrentLevel()
      const { PHYSICS_CALCULATOR } = await import('@/config')
      const explosionPhysics = PHYSICS_CALCULATOR.getExplosionPhysics(currentLevel)
      
      const explosionRadius = (bubble.baseRadius || 20) * explosionPhysics.bubbleExplosionRadiusMultiplier
      const explosionStrength = explosionPhysics.bubbleExplosionStrengthBase
      
      this.physicsRepository.explodeFromPoint({
        clickX: bubble.x,
        clickY: bubble.y,
        explosionRadius,
        explosionStrength,
        nodes: remainingNodes, // Используем обновленные узлы
        width,
        height
      }, currentLevel)

      // Обновляем физику сразу после взрыва
      this.physicsRepository.updateNodes(remainingNodes)

      if (this.onBubblePopped) {
        this.onBubblePopped(remainingNodes)
      }

      // Обновляем количество активных узлов после взрыва
      const performanceStore = usePerformanceStore()
      performanceStore.updateActiveNodes(this.canvasDomain.nodes.length)

      return { success: true, remainingNodes }
    } catch (error) {
      return { success: false, remainingNodes: this.canvasDomain.nodes, error: `Failed to explode bubble: ${error}` }
    }
  }

  // Универсальный метод для удаления пузыря с эффектами
  async removeBubbleWithEffects(params: {
    bubble: BubbleNode
    xpAmount?: number
    isPhilosophyNegative?: boolean
    skipFloatingText?: boolean // Флаг для пропуска floating text (если уже создан)
  }): Promise<void> {
    const { bubble, xpAmount, isPhilosophyNegative, skipFloatingText } = params

    // Создаем floating text эффекты только если не пропускаем и передан xpAmount или isPhilosophyNegative
    if (!skipFloatingText) {
      if (xpAmount !== undefined) {
        this.effectsRepository.createFloatingText({
          x: bubble.x,
          y: bubble.y,
          text: `+${xpAmount} XP`,
          type: 'xp',
          color: '#22c55e'
        })
      }

      if (isPhilosophyNegative) {
        this.effectsRepository.createFloatingText({
          x: bubble.x,
          y: bubble.y,
          text: '💔',
          type: 'life',
          color: '#ef4444'
        })
      }
    }

    // Удаляем пузырь через explodeBubble (только эффекты взрыва)
    await this.explodeBubble({
      bubble,
      nodes: this.canvasDomain.nodes,
      width: this.canvasDomain.width,
      height: this.canvasDomain.height
    })
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

    // Обнулили активные узлы
    const performanceStore = usePerformanceStore()
    performanceStore.updateActiveNodes(0)
  }

  render(): void {
    const shakeOffset = this.effectsRepository.calculateShakeOffset()
    
    this.canvasRepository.clearCanvas()
    
    // Получаем контекст один раз
    const context = this.canvasRepository.getContext()
    if (!context) return

    const clicker = useClickerStore()

    // Применяем тряску
    if (shakeOffset.x !== 0 || shakeOffset.y !== 0) {
      context.save()
      context.translate(shakeOffset.x, shakeOffset.y)
    }

    // Прячем звезды и подписи в режиме кликера
    if (!clicker.isActive) {
      // Рисуем звездное поле
      this.canvasRepository.drawStarfield()
      this.canvasRepository.hideLabels = false
    } else {
      this.canvasRepository.hideLabels = true
    }

    // Во время отсчёта в кликере не рисуем пузыри вовсе — сцена пустая
    if (!(clicker.isActive && !clicker.isRunning)) {
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
    }

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
    // Всегда рендерим, чтобы убирать предыдущий кадр даже при пустой сцене (например, во время отсчёта)
    this.render()
    this.canvasDomain.animationId = requestAnimationFrame(() => this.animate())
  }

  // Private methods
  private setupEventListeners(canvasRef: Ref<HTMLCanvasElement | null>): void {
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
    ;(canvasRef.value as any)._cleanupEventListeners = () => {
      if (canvasRef.value) {
        canvasRef.value.removeEventListener('mousemove', mouseMoveHandler)
        canvasRef.value.removeEventListener('click', clickHandler)
        canvasRef.value.removeEventListener('mouseleave', mouseLeaveHandler)
      }
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
    const currentLevel = this.getCurrentLevel()
    
    if (bubble.isTough) {
      if (bubble.id === undefined) return { bubblePopped: false }
      const toughResult = this.bubbleStore.incrementToughBubbleClicks(bubble.id)
      
      if (toughResult.isReady) {
        bubble.isReady = true

        // Визуальный удар и физический отскок даже на финальном клике
        this.effectsRepository.animateToughBubbleHit(bubble)
        const jumpReady = await this.effectsRepository.calculateBubbleJump(mouseX, mouseY, bubble, toughResult.clicks, currentLevel)
        if (jumpReady.vx !== 0 || jumpReady.vy !== 0) {
          bubble.vx = jumpReady.vx
          bubble.vy = jumpReady.vy
        }
        // Немедленное небольшое смещение для мгновенной обратной связи на финальном клике
        bubble.x += jumpReady.x
        bubble.y += jumpReady.y
        
        // Показываем модалку с информацией о пузыре (Event Chain сам обработает достижение)
        this.modalStore.openBubbleModal(bubble)
        
        // НЕ удаляем пузырь сразу - добавляем в очередь как обычные пузыри
        // Пузырь будет удален после закрытия всех модалок
        return { bubblePopped: false }
      } else {
        // Создаем floating text при каждом клике по крепкому пузырю
        this.effectsRepository.createFloatingText({
          x: mouseX,
          y: mouseY,
          text: '+1 XP',
          type: 'xp',
          color: '#22c55e'
        })
        
        // Добавляем XP за каждый клик по крепкому пузырю
        const result = await this.useSession.gainXP(1)
        if (result.leveledUp && result.levelData && result.newLevel !== undefined) {
          this.modalStore.openLevelUpModal(result.newLevel, {
            ...result.levelData,
            title: result.levelData.title || `Уровень ${result.newLevel}`,
            description: result.levelData.description || `Поздравляем! Вы достигли ${result.newLevel} уровня!`,
            xpRequired: 0,
            isProjectTransition: result.levelData.isProjectTransition
          })
        }
        
        // Добавляем эффект отскакивания для крепкого бабла
        this.effectsRepository.animateToughBubbleHit(bubble)
        
        // Добавляем физическое отскакивание от точки клика
        const jump = await this.effectsRepository.calculateBubbleJump(mouseX, mouseY, bubble, toughResult.clicks, currentLevel)
        if (jump.vx !== 0 || jump.vy !== 0) {
          bubble.vx = jump.vx
          bubble.vy = jump.vy
        }
        // Немедленное небольшое смещение для мгновенной обратной связи
        bubble.x += jump.x
        bubble.y += jump.y
        
        return { bubblePopped: false }
      }
    }

    if (bubble.isHidden) {
      if (bubble.id === undefined) return { bubblePopped: false }
      
      const hiddenResult = this.bubbleStore.incrementHiddenBubbleClicks(bubble.id)
      
      if (hiddenResult.isReady) {
        bubble.isReady = true
        bubble.isVisited = true
        
        if (bubble.id !== undefined) {
          await this.useSession.visitBubble(bubble.id)
        }
        
        // Скрытые пузыри НЕ показывают модалку - добавляем в очередь на удаление
        const xpAmount = XP_CALCULATOR.getBubbleXP(bubble.skillLevel)
        
        // Добавляем XP за финальный взрыв скрытого пузыря
        const result = await this.useSession.gainXP(xpAmount)
        if (result.leveledUp && result.levelData && result.newLevel !== undefined) {
          this.modalStore.openLevelUpModal(result.newLevel, {
            ...result.levelData,
            title: result.levelData.title || `Уровень ${result.newLevel}`,
            description: result.levelData.description || `Поздравляем! Вы достигли ${result.newLevel} уровня!`,
            xpRequired: 0,
            isProjectTransition: result.levelData.isProjectTransition
          })
        }
        
        // Создаем floating text для финального взрыва
        this.effectsRepository.createFloatingText({
          x: bubble.x,
          y: bubble.y,
          text: `+${xpAmount} XP`,
          type: 'xp',
          color: '#22c55e'
        })

        // Выдаем ачивку за скрытый пузырь (через сессию, без модалок)
        await this.useSession.handleSecretBubbleDestroyed()
        
        // Добавляем в очередь на удаление через modalStore
        addPendingBubbleRemoval({
          bubbleId: bubble.id,
          xpAmount: 0, // XP уже добавлен выше
          isPhilosophyNegative: false
        }, false) // Скрытые пузыри удаляем сразу, без ожидания модалок
        
        return { bubblePopped: false }
      } else {
        // Добавляем XP за каждый клик по скрытому пузырю (сразу)
        const result = await this.useSession.gainXP(GAME_CONFIG.HIDDEN_BUBBLE_XP_PER_CLICK)
        if (result.leveledUp && result.levelData && result.newLevel !== undefined) {
          this.modalStore.openLevelUpModal(result.newLevel, {
            ...result.levelData,
            title: result.levelData.title || `Уровень ${result.newLevel}`,
            description: result.levelData.description || `Поздравляем! Вы достигли ${result.newLevel} уровня!`,
            xpRequired: 0,
            isProjectTransition: result.levelData.isProjectTransition
          })
        }
        
        // Создаем floating text при каждом клике по скрытому пузырю
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
        const jump = await this.effectsRepository.calculateBubbleJump(mouseX, mouseY, bubble, hiddenResult.clicks, currentLevel)
        if (jump.vx !== 0 || jump.vy !== 0) {
          bubble.vx = jump.vx
          bubble.vy = jump.vy
        }
        // Немедленное небольшое смещение для скрытого пузыря
        bubble.x += jump.x
        bubble.y += jump.y
        
        return { bubblePopped: false }
      }
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
    if (this.hoveredBubble && this.hoveredBubble.baseRadius) {
      this.hoveredBubble.targetRadius = this.hoveredBubble.baseRadius
      this.hoveredBubble.isHovered = false
    }
    this.hoveredBubble = null
    
    // Сбрасываем курсор при выходе мыши с канваса
    if (this.canvasRepository.getContext()) {
      const canvas = this.canvasRepository.getContext()?.canvas
      if (canvas) {
        canvas.style.cursor = 'default'
      }
    }
  }

  private async updateBubbleStates(): Promise<void> {
    const currentLevel = this.getCurrentLevel()
    await this.bubbleManagerRepository.updateBubbleStates(this.canvasDomain.nodes, this.canvasDomain.width, this.canvasDomain.height, currentLevel)
  }

  getCurrentBubbles(): BubbleNode[] {
    return [...this.canvasDomain.nodes]
  }
} 