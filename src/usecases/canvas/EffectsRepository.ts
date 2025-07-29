import { ref } from 'vue'
import { gsap } from 'gsap'
import type { EffectsRepository as IEffectsRepository, CreateFloatingTextParams } from './types'
import type { ExplosionEffect, FloatingText, DebrisParticle, BubbleNode } from '@/types/canvas'
import { getBubbleColor } from '@/utils/bubble'
import { hexToRgb } from '@/utils/ui'

export class EffectsRepository implements IEffectsRepository {
  private explosionEffects = ref<ExplosionEffect[]>([])
  private floatingTexts = ref<FloatingText[]>([])
  private debrisParticles = ref<DebrisParticle[]>([])
  private shakeConfig = {
    duration: 500,
    intensity: 8,
    startTime: 0,
    isShaking: false
  }

  addExplosionEffect(x: number, y: number, radius: number): void {
    if (!this.explosionEffects.value) {
      this.explosionEffects.value = []
    }
    this.createExplosionEffect(x, y, radius)
  }

  addDebrisEffect(x: number, y: number, radius: number, color: string): void {
    if (!this.debrisParticles.value) {
      this.debrisParticles.value = []
    }
    this.createDebrisEffect(x, y, radius, color)
  }

  private createExplosionEffect(x: number, y: number, radius: number): void {
    const effect = {
      x,
      y,
      radius: 1,
      maxRadius: radius * 20,
      opacity: 1,
      startTime: Date.now()
    }
    this.explosionEffects.value.push(effect)
  }

  private createDebrisEffect(x: number, y: number, radius: number, color: string): void {
    const particleCount = Math.floor(radius / 2) + 10
    const startTime = Date.now()
  
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2 // случайное направление
      const speed = Math.random() * 30
      const size = Math.random() * 8 
  
      // Создаем частицы от краев пузыря, а не из центра
      const edgeDistance = radius + Math.random() * 5 // Немного случайности для естественности
      const startX = x + Math.cos(angle) * edgeDistance
      const startY = y + Math.sin(angle) * edgeDistance
  
      // Скорость направлена наружу от центра пузыря
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed
  
      const particle = {
        id: Date.now() + Math.random() + i,
        x: startX, // Начинаем от края пузыря
        y: startY,
        vx,
        vy,
        size,
        opacity: 1,
        color,
        startTime,
        duration: Math.random() * 2000,
      }
  
      this.debrisParticles.value!.push(particle)
    }
  }

  animateToughBubbleHit(bubble: BubbleNode): void {
    gsap.killTweensOf(bubble, 'targetRadius')
    bubble.targetRadius = (bubble.targetRadius || bubble.baseRadius) * 1.5
    gsap.to(bubble, {
      targetRadius: bubble.baseRadius,
      duration: 1,
      ease: 'elastic.out(1, 0.6)',
    })
  }

  calculateBubbleJump(mouseX: number, mouseY: number, bubble: BubbleNode): { vx: number, vy: number, x: number, y: number } {
    const clickOffsetX = mouseX - bubble.x
    const clickOffsetY = mouseY - bubble.y
    const distanceToCenter = Math.sqrt(clickOffsetX * clickOffsetX + clickOffsetY * clickOffsetY)

    if (distanceToCenter > 0) {
      const dirX = clickOffsetX / distanceToCenter
      const dirY = clickOffsetY / distanceToCenter
      
      const strengthFactor = Math.min(distanceToCenter / bubble.radius, 1)
      const maxStrength = bubble.radius * 4 // Увеличиваем силу отскакивания для скрытых пузырей
      const jumpStrength = maxStrength * strengthFactor

      return {
        vx: -dirX * jumpStrength,
        vy: -dirY * jumpStrength,
        x: -dirX * jumpStrength * 0.5,
        y: -dirY * jumpStrength * 0.5
      }
    }

    return { vx: 0, vy: 0, x: 0, y: 0 }
  }

  createFloatingText(params: CreateFloatingTextParams): void {
    const { x, y, text, type, color = '#667eea' } = params
    
    // Проверяем, что floatingTexts инициализирован
    if (!this.floatingTexts.value) {
      this.floatingTexts.value = []
    }
    
    this.floatingTexts.value.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      opacity: 1,
      startTime: Date.now(),
      duration: 2000,
      color,
      type
    })
  }

  startShake(): void {
    this.shakeConfig.isShaking = true
    this.shakeConfig.startTime = Date.now()
  }

  calculateShakeOffset(): { x: number, y: number } {
    if (!this.shakeConfig.isShaking) return { x: 0, y: 0 }

    const elapsed = Date.now() - this.shakeConfig.startTime
    if (elapsed >= this.shakeConfig.duration) {
      this.shakeConfig.isShaking = false
      return { x: 0, y: 0 }
    }

    const progress = elapsed / this.shakeConfig.duration
    const decay = (1 - progress) ** 2

    const angle = Math.random() * Math.PI * 2
    const intensity = this.shakeConfig.intensity * decay

    return {
      x: Math.cos(angle) * intensity,
      y: Math.sin(angle) * intensity
    }
  }

  clearAllEffects(): void {
    this.explosionEffects.value = []
    this.floatingTexts.value = []
    this.debrisParticles.value = []
    this.shakeConfig.isShaking = false
  }

  explodeBubble(bubble: BubbleNode): void {
    if (!bubble || bubble.isPopped) return
    bubble.isPopped = true
    
    if (bubble.x !== undefined && bubble.y !== undefined && bubble.currentRadius !== undefined) {
      this.addExplosionEffect(bubble.x, bubble.y, bubble.currentRadius)
      const bubbleColor = getBubbleColor(bubble)
      this.addDebrisEffect(bubble.x, bubble.y, bubble.currentRadius, bubbleColor)
    }
  }

  // Методы для отрисовки эффектов
  drawFloatingTexts(context: CanvasRenderingContext2D): void {
    const currentTime = Date.now()

    if (!this.floatingTexts.value || this.floatingTexts.value.length === 0) {
      return
    }

    for (let i = this.floatingTexts.value.length - 1; i >= 0; i--) {
      const text = this.floatingTexts.value[i]
      const elapsed = currentTime - text.startTime
      const progress = elapsed / text.duration

      if (progress >= 1) {
        this.floatingTexts.value.splice(i, 1)
        continue
      }

      let yOffset: number
      if (text.type === 'life') {
        yOffset = progress * 40
      } else {
        yOffset = -(progress * 40)
      }

      const opacity = 1 - progress
      const rgb = hexToRgb(text.color)

      context.save()
      context.font = text.type === 'life' ? 'bold 20px Inter, sans-serif' : 'bold 16px Inter, sans-serif'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`

      if (text.type === 'life') {
        context.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`
        context.lineWidth = 2
        context.strokeText(text.text, text.x, text.y + yOffset)
      }

      context.fillText(text.text, text.x, text.y + yOffset)
      context.restore()
    }
  }

  drawDebrisEffects(context: CanvasRenderingContext2D, bubbles: BubbleNode[] = []): void {
    const currentTime = Date.now()

    if (!this.debrisParticles.value || this.debrisParticles.value.length === 0) {
      return
    }


    this.debrisParticles.value = this.debrisParticles.value.filter(particle => {
      const elapsed = currentTime - particle.startTime
      const progress = elapsed / particle.duration

      if (progress >= 1) {
        return false
      }

      // Обновляем позицию частицы
      particle.x += particle.vx
      particle.y += particle.vy

      // Проверяем столкновения с пузырями
      for (const bubble of bubbles) {
        const dx = particle.x - bubble.x
        const dy = particle.y - bubble.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const collisionDistance = bubble.currentRadius + particle.size / 2

        if (distance < collisionDistance) {
          const normalX = dx / distance
          const normalY = dy / distance
          const dotProduct = particle.vx * normalX + particle.vy * normalY
          const elasticity = 0.7
          
          particle.vx = (particle.vx - 2 * dotProduct * normalX) * elasticity
          particle.vy = (particle.vy - 2 * dotProduct * normalY) * elasticity
          particle.size *= 0.9

          const overlap = collisionDistance - distance + 1
          particle.x += normalX * overlap
          particle.y += normalY * overlap
          break
        }
      }

      particle.opacity = 1 - progress

      context.save()
      context.translate(particle.x, particle.y)

      const rgb = hexToRgb(particle.color)
      context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity})`

      const halfSize = particle.size / 2
      context.beginPath()
      context.arc(0, 0, halfSize, 0, Math.PI * 2)
      context.fill()

      context.restore()

      return true
    })
  }

  drawHoverEffect(context: CanvasRenderingContext2D, bubble: BubbleNode): void {
    if (!bubble.isHovered) return

    context.save()

    const gradient = context.createRadialGradient(
      bubble.x, bubble.y, 0,
      bubble.x, bubble.y, bubble.currentRadius * 1.5
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    context.beginPath()
    context.arc(bubble.x, bubble.y, bubble.currentRadius * 1.5, 0, Math.PI * 2)
    context.fillStyle = gradient
    context.fill()

    context.restore()
  }
} 