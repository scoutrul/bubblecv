import type { Ref } from 'vue'
import type { SimulationNode, BubbleContinueEvent } from './types/bubble.types'
import { BubbleSimulationBaseImpl } from './useBubbleSimulation'
import { getExpertiseConfig } from './useBubbleConfig'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import * as d3 from 'd3'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  color: string
  life: number
}

export class CanvasRenderer extends BubbleSimulationBaseImpl {
  private canvasRef: Ref<HTMLCanvasElement | null>
  private ctx: CanvasRenderingContext2D | null = null
  private particles: Particle[] = []
  private readonly particlePool: Particle[] = []
  private readonly maxParticles = 50

  constructor(canvasRef: Ref<HTMLCanvasElement | null>) {
    super()
    this.canvasRef = canvasRef
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.handleBubbleContinue = this.handleBubbleContinue.bind(this)
    
    // Initialize particle pool
    for (let i = 0; i < this.maxParticles; i++) {
      this.particlePool.push({
        x: 0, y: 0, vx: 0, vy: 0,
        radius: 0, alpha: 0, color: '',
        life: 0
      })
    }
  }

  protected initRenderer(): void {
    if (!this.canvasRef.value) return

    this.ctx = this.canvasRef.value.getContext('2d')
    if (!this.ctx) return

    // Добавляем обработчики событий
    this.canvasRef.value.addEventListener('mousemove', this.handleMouseMove)
    this.canvasRef.value.addEventListener('click', this.handleClick)
    this.canvasRef.value.addEventListener('mouseleave', this.handleMouseLeave)

    // Создаем симуляцию
    this.simulation = d3.forceSimulation<SimulationNode>()
      .force('charge', d3.forceManyBody().strength(-100))
      .force('collide', d3.forceCollide<SimulationNode>().radius(d => d.currentRadius + 2))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .on('tick', () => this.render())
  }

  protected destroyRenderer(): void {
    if (!this.canvasRef.value) return

    // Удаляем обработчики событий
    this.canvasRef.value.removeEventListener('mousemove', this.handleMouseMove)
    this.canvasRef.value.removeEventListener('click', this.handleClick)
    this.canvasRef.value.removeEventListener('mouseleave', this.handleMouseLeave)

    // Очищаем контекст
    this.ctx = null
  }

  protected render(): void {
    if (!this.ctx) return

    // Очищаем холст
    this.ctx.clearRect(0, 0, this.width, this.height)

    // Отрисовываем эффекты взрыва
    this.drawExplosionEffects()

    // Отрисовываем пузыри
    this.nodes.forEach(node => {
      if (!this.ctx) return

      // Обновляем радиус с анимацией
      const expertiseConfig = getExpertiseConfig(node.skillLevel)
      node.baseRadius = expertiseConfig.sizeMultiplier * 40 // Базовый размер пузыря
      node.targetRadius = node.isHovered ? node.baseRadius * 1.2 : node.baseRadius
      node.currentRadius += (node.targetRadius - node.currentRadius) * 0.1

      // Добавляем осцилляцию
      node.oscillationPhase += 0.05
      const oscillation = Math.sin(node.oscillationPhase) * 2

      // Рисуем пузырь
      this.ctx.beginPath()
      this.ctx.arc(node.x, node.y, node.currentRadius + oscillation, 0, Math.PI * 2)
      this.ctx.fillStyle = node.color
      this.ctx.fill()

      // Рисуем текст
      if (node.isHovered && node.textLines) {
        this.ctx.font = '14px Arial'
        this.ctx.fillStyle = '#000'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        
        let yOffset = -node.textLines.length * 10
        node.textLines.forEach(line => {
          if (!this.ctx) return
          this.ctx.fillText(line, node.x, node.y + yOffset)
          yOffset += 20
        })
      }
    })
  }

  protected handleMouseMove(event: MouseEvent): void {
    if (!this.canvasRef.value) return

    const rect = this.canvasRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Находим пузырь под курсором
    const hoveredNode = this.nodes.find(node => {
      const dx = x - node.x
      const dy = y - node.y
      return Math.sqrt(dx * dx + dy * dy) <= node.currentRadius
    }) || null

    // Обновляем состояние
    if (hoveredNode !== this.hoveredBubble) {
      if (this.hoveredBubble) {
        this.hoveredBubble.isHovered = false
      }
      if (hoveredNode) {
        hoveredNode.isHovered = true
      }
      this.hoveredBubble = hoveredNode
    }
  }

  protected async handleClick(event: MouseEvent): Promise<void> {
    if (!this.canvasRef.value || !this.hoveredBubble) return

    // Создаем и диспатчим событие
    const bubbleContinueEvent = new CustomEvent('bubble-continue', {
      detail: { bubbleId: this.hoveredBubble.id }
    })
    window.dispatchEvent(bubbleContinueEvent)
  }

  protected handleMouseLeave(): void {
    if (this.hoveredBubble) {
      this.hoveredBubble.isHovered = false
      this.hoveredBubble = null
    }
  }

  private drawExplosionEffects() {
    if (!this.ctx) return

    // Update and draw particles
    this.particles = this.particles.filter(particle => {
      if (!this.ctx) return false

      // Update particle physics
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1 // Gravity
      particle.life -= 0.02
      particle.alpha = Math.max(0, particle.life)
      particle.radius *= 0.99

      // Draw particle
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      this.ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`
      this.ctx.fill()

      // Return true to keep particle alive
      if (particle.life <= 0) {
        this.particlePool.push(particle)
        return false
      }
      return true
    })

    // Обновляем и отрисовываем каждый эффект взрыва
    this.explosionEffects = this.explosionEffects.filter(effect => {
      if (!this.ctx) return false

      const duration = 1000 // 1 секунда анимации
      effect.radius += 5 // Увеличиваем радиус
      effect.alpha -= 0.02 // Уменьшаем прозрачность

      if (effect.alpha <= 0) return false

      this.ctx.save()

      // Shockwave effect
      const shockwaveGradient = this.ctx.createRadialGradient(
        effect.x, effect.y, effect.radius * 0.8,
        effect.x, effect.y, effect.radius
      )
      shockwaveGradient.addColorStop(0, `rgba(255, 255, 255, 0)`)
      shockwaveGradient.addColorStop(0.5, `rgba(255, 255, 255, ${effect.alpha * 0.3})`)
      shockwaveGradient.addColorStop(1, `rgba(255, 255, 255, 0)`)

      this.ctx.beginPath()
      this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2)
      this.ctx.fillStyle = shockwaveGradient
      this.ctx.fill()

      // Внешнее кольцо взрыва
      this.ctx.beginPath()
      this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2)
      this.ctx.strokeStyle = `rgba(255, 100, 100, ${effect.alpha * 0.8})`
      this.ctx.lineWidth = 4
      this.ctx.stroke()

      // Внутреннее кольцо взрыва
      this.ctx.beginPath()
      this.ctx.arc(effect.x, effect.y, effect.radius * 0.7, 0, Math.PI * 2)
      this.ctx.strokeStyle = `rgba(255, 200, 100, ${effect.alpha * 0.6})`
      this.ctx.lineWidth = 2
      this.ctx.stroke()

      // Центральная вспышка
      const flashGradient = this.ctx.createRadialGradient(
        effect.x, effect.y, 0,
        effect.x, effect.y, effect.radius * 0.3
      )
      flashGradient.addColorStop(0, `rgba(255, 255, 255, ${effect.alpha})`)
      flashGradient.addColorStop(1, `rgba(255, 255, 255, 0)`)

      this.ctx.beginPath()
      this.ctx.arc(effect.x, effect.y, effect.radius * 0.3, 0, Math.PI * 2)
      this.ctx.fillStyle = flashGradient
      this.ctx.fill()

      this.ctx.restore()

      return true
    })
  }

  public async handleBubbleContinue(event: BubbleContinueEvent): Promise<void> {
    const { bubbleId } = event.detail
    const bubble = this.nodes.find(node => node.id === bubbleId)
    if (!bubble) return

    // Create explosion particles
    const particleCount = Math.min(this.maxParticles - this.particles.length, 20)
    for (let i = 0; i < particleCount; i++) {
      const particle = this.particlePool.pop()
      if (!particle) break

      const angle = (Math.PI * 2 * i) / particleCount
      const speed = 2 + Math.random() * 3
      const color = this.getRGBFromColor(bubble.color)

      particle.x = bubble.x
      particle.y = bubble.y
      particle.vx = Math.cos(angle) * speed
      particle.vy = Math.sin(angle) * speed
      particle.radius = 2 + Math.random() * 3
      particle.alpha = 1
      particle.color = color
      particle.life = 0.8 + Math.random() * 0.4

      this.particles.push(particle)
    }

    // Начисляем опыт
    let leveledUp = false
    if (bubble.isEasterEgg) {
      leveledUp = await this.sessionStore.gainXP(GAME_CONFIG.XP_PER_EASTER_EGG)
    } else {
      leveledUp = await this.sessionStore.gainBubbleXP(bubble.skillLevel)
    }

    // Показываем Level Up модал
    if (leveledUp) {
      this.modalStore.openLevelUpModal(this.sessionStore.currentLevel)
    }

    // Отмечаем пузырь как посещенный
    await this.sessionStore.visitBubble(bubble.id)
    bubble.isVisited = true

    // Создаем взрыв и удаляем пузырь
    this.explodeBubble(bubble)
    setTimeout(() => {
      this.removeBubble(bubbleId)
    }, 50)
  }

  private getRGBFromColor(color: string): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return '255, 255, 255'

    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return `${r}, ${g}, ${b}`
  }

  protected pushNeighbors(centerBubble: SimulationNode, pushRadius: number, pushStrength: number): void {
    let affectedCount = 0
    
    this.nodes.forEach(bubble => {
      if (bubble.id === centerBubble.id) return
      
      const dx = bubble.x - centerBubble.x
      const dy = bubble.y - centerBubble.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < pushRadius && distance > 0) {
        const normalizedDx = dx / distance
        const normalizedDy = dy / distance
        const force = pushStrength * (1 - distance / pushRadius) * 3
        
        bubble.vx = (bubble.vx || 0) + normalizedDx * force
        bubble.vy = (bubble.vy || 0) + normalizedDy * force
        
        bubble.x += normalizedDx * force * 0.5
        bubble.y += normalizedDy * force * 0.5
        
        const maxVelocity = 15
        const currentVelocity = Math.sqrt((bubble.vx || 0) ** 2 + (bubble.vy || 0) ** 2)
        if (currentVelocity > maxVelocity) {
          const scale = maxVelocity / currentVelocity
          bubble.vx = (bubble.vx || 0) * scale
          bubble.vy = (bubble.vy || 0) * scale
        }
        
        affectedCount++
      }
    })
    
    if (this.simulation && affectedCount > 0) {
      this.simulation.alpha(0.5).restart()
    }
  }

  protected drawBubble(bubble: SimulationNode): void {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.arc(bubble.x, bubble.y, bubble.currentRadius, 0, Math.PI * 2)
    this.ctx.fillStyle = bubble.color
    this.ctx.fill()
  }

  protected drawText(bubble: SimulationNode): void {
    if (!this.ctx || !bubble.textLines) return

    this.ctx.font = '14px Arial'
    this.ctx.fillStyle = '#000'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    
    let yOffset = -bubble.textLines.length * 10
    bubble.textLines.forEach(line => {
      if (!this.ctx) return
      this.ctx.fillText(line, bubble.x, bubble.y + yOffset)
      yOffset += 20
    })
  }

  protected getContainerRect(): DOMRect | null {
    return this.canvasRef.value?.getBoundingClientRect() || null
  }

  protected setCursor(cursor: string): void {
    if (this.canvasRef.value) {
      this.canvasRef.value.style.cursor = cursor
    }
  }
} 