import { Ref, ref } from 'vue'
import type { CanvasRepository as ICanvasRepository } from './types'
import type { BubbleNode } from '@/types/canvas'
import { GAME_CONFIG } from '@/config'
import { gsap } from 'gsap'

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  angle: number
  orbitRadius: number
  centerX: number
  centerY: number
  speed: number
}

export class CanvasRepository implements ICanvasRepository {
  private canvas: HTMLCanvasElement | null = null
  private centerStars = ref<Star[]>([])
  private bgStars = ref<Star[]>([])
  private fgStars = ref<Star[]>([])
  private previousWidth = 0
  private previousHeight = 0    

  constructor(canvasRef: Ref<HTMLCanvasElement | null>) {
    this.canvas = canvasRef.value
  }

  getContext(): CanvasRenderingContext2D | null {
    if (!this.canvas) {
      console.log('CanvasRepository.getContext: canvas is null/undefined')
      return null
    }
    
    const context = this.canvas.getContext('2d')
    if (!context) {
      console.log('CanvasRepository.getContext: getContext("2d") returned null for canvas:', this.canvas)
    }
    return context
  }

  clearCanvas(): void {
    const context = this.getContext()
    if (!context || !this.canvas) return

    context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawStarfield(): void {
    const context = this.getContext()
    if (!context) return

    // Проверяем, инициализированы ли звезды
    if (!this.centerStars.value || !this.bgStars.value || !this.fgStars.value) {
      console.log('CanvasRepository.drawStarfield: stars not initialized, skipping')
      return
    }

    // Рисуем центральный слой
    context.save()
    this.centerStars.value.forEach(star => {
      star.angle += star.speed
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
      
      context.beginPath()
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
      context.fill()
    })
    context.restore()

    // Рисуем задний слой
    context.save()
    this.bgStars.value.forEach(star => {
      star.angle += star.speed
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
      
      context.beginPath()
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
      context.fill()
    })
    context.restore()

    // Рисуем передний слой (без параллакса)
    context.save()
    this.fgStars.value.forEach(star => {
      star.angle += star.speed
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
      
      context.beginPath()
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
      context.fill()
    })
    context.restore()
  }

  drawBubble(bubble: BubbleNode): void {
    const context = this.getContext()
    if (!context) {
      console.log('CanvasRepository.drawBubble: no context')
      return
    }

    context.save()
    
    if (!Number.isFinite(bubble.x) || !Number.isFinite(bubble.y) || !Number.isFinite(bubble.currentRadius)) {
      console.log('CanvasRepository.drawBubble: invalid values:', bubble.x, bubble.y, bubble.currentRadius)
      context.restore()
      return
    }
    
    const radius = Math.max(0, bubble.currentRadius)
    const x = bubble.x
    const y = bubble.y
    
    // Особая отрисовка для скрытых пузырей
    if (bubble.isHidden) {
      const hiddenConfig = GAME_CONFIG.hiddenBubble
      context.globalAlpha = hiddenConfig.opacity
      if (hiddenConfig.gradientColors?.length) {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
        hiddenConfig.gradientColors.forEach((color, index) => {
          const stop = index / (hiddenConfig.gradientColors.length - 1)
          gradient.addColorStop(stop, color)
        })
        context.fillStyle = gradient
      } else {
        context.fillStyle = '#64748B11'
      }
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
      context.restore()
      return
    }
    
    // Особая отрисовка для философских пузырей
    if (bubble.isQuestion) {
      const philosophyConfig = GAME_CONFIG.questionBubble
      
      if (philosophyConfig.gradientColors.length) {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
        philosophyConfig.gradientColors.forEach((color, index) => {
          const stop = index / (philosophyConfig.gradientColors.length - 1)
          gradient.addColorStop(stop, color)
        })
        context.fillStyle = gradient
      } else {
        context.fillStyle = philosophyConfig.gradientColors[0] || '#FF0080'
      }
      
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    } else {
      // Отрисовка обычных пузырей
      const expertiseConfig = GAME_CONFIG.expertiseBubbles[bubble.skillLevel] || GAME_CONFIG.expertiseBubbles.novice
      
      if (expertiseConfig.gradientColors.length) {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
        expertiseConfig.gradientColors.forEach((color: string, index: number) => {
          const stop = index / (expertiseConfig.gradientColors!.length - 1)
          gradient.addColorStop(stop, color)
        })
        context.fillStyle = gradient
      } else {
        context.fillStyle = '#FFF'
      }
      
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }
    
    context.restore()
  }

  drawText(bubble: BubbleNode): void {
    if (bubble.isQuestion || bubble.isHidden) {
      return
    }
    
    const context = this.getContext()
    if (!context) return

    context.save()
    
    const fontSize = Math.max(8, Math.min(bubble.currentRadius * 0.3, 18))
    
    context.font = `${fontSize}px Inter, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = bubble.isPopped ? '#FFFFFF80' : '#FFFFFF'
    
    context.shadowColor = 'rgba(0, 0, 0, 0.3)'
    context.shadowBlur = 3
    context.shadowOffsetX = 0
    context.shadowOffsetY = 1
    
    context.fillText(bubble.name, bubble.x, bubble.y)
    
    context.restore()
  }

  drawFloatingTexts(): void {
    // Делегируем к EffectsRepository
    const context = this.getContext()
    if (context) {
      // EffectsRepository будет вызывать этот метод через CanvasUseCase
    }
  }

  drawDebrisEffects(): void {
    // Делегируем к EffectsRepository
    const context = this.getContext()
    if (context) {
      // EffectsRepository будет вызывать этот метод через CanvasUseCase
    }
  }

  drawHoverEffect(bubble: BubbleNode): void {
    // Делегируем к EffectsRepository
    const context = this.getContext()
    if (context) {
      // EffectsRepository будет вызывать этот метод через CanvasUseCase
    }
  }

  applyShakeOffset(offset: { x: number, y: number }): void {
    const context = this.getContext()
    if (!context) return
    context.save()
    context.translate(offset.x, offset.y)
  }

  // Методы для инициализации звездного поля
  initStarfield(width: number, height: number): void {
    this.previousWidth = width
    this.previousHeight = height
    
    const canvasCenter = { x: width / 2, y: height / 2 }
    
    // Центральный слой
    this.centerStars.value = this.createStars(400, width, height, [0.3, 1.3], [0.1, 0.4], [50, Math.max(width, height) * 0.4 + 50], [0, 0.0005], true)
    this.animateStars(this.centerStars.value, [0.1, 0.4], [3, 7])
    
    // Задний слой
    this.bgStars.value = this.createStars(70, width, height, [0.5, 1.7], [0.1, 0.5], [20, 120], [0.001, 0.003])
    this.animateStars(this.bgStars.value, [0.1, 0.5], [2, 5])
    
    // Передний слой
    this.fgStars.value = this.createStars(30, width, height, [0.8, 2.4], [0.4, 1.0], [30, 180], [0.001, 0.004])
    this.animateStars(this.fgStars.value, [0.1, 0.1], [0.8, 2.3])
  }

  updateStarfieldSize(width: number, height: number): void {
    this.updateStarPositions(this.centerStars.value, width, height, this.previousWidth, this.previousHeight, true)
    this.updateStarPositions(this.bgStars.value, width, height, this.previousWidth, this.previousHeight)
    this.updateStarPositions(this.fgStars.value, width, height, this.previousWidth, this.previousHeight)
    
    this.filterAndAddStars(this.bgStars, 70, width, height, [0.5, 1.7], [0.1, 0.5], [20, 120], [0.001, 0.003])
    this.filterAndAddStars(this.fgStars, 30, width, height, [0.8, 2.4], [0.4, 1.0], [30, 180], [0.001, 0.004])
    
    this.previousWidth = width
    this.previousHeight = height
  }

  updateCanvasSize(width: number, height: number): void {
    // Обновляем размеры канваса и звездного поля
    if (this.canvas) {
      this.canvas.width = width
      this.canvas.height = height
    }
    this.updateStarfieldSize(width, height)
  }

  private createStars(count: number, width: number, height: number, radiusRange: [number, number], opacityRange: [number, number], orbitRadiusRange: [number, number], speedRange: [number, number], isCenter: boolean = false): Star[] {
    const stars: Star[] = []
    const canvasCenter = { x: width / 2, y: height / 2 }
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const orbitRadius = Math.random() * (orbitRadiusRange[1] - orbitRadiusRange[0]) + orbitRadiusRange[0]
      const centerX = isCenter ? canvasCenter.x : Math.random() * width
      const centerY = isCenter ? canvasCenter.y : Math.random() * height
      
      stars.push({
        x: centerX + Math.cos(angle) * orbitRadius,
        y: centerY + Math.sin(angle) * orbitRadius,
        radius: Math.random() * (radiusRange[1] - radiusRange[0]) + radiusRange[0],
        opacity: Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
        angle,
        orbitRadius,
        centerX,
        centerY,
        speed: (Math.random() * (speedRange[1] - speedRange[0]) + speedRange[0]) * (Math.random() > 0.5 ? 1 : -1)
      })
    }
    
    return stars
  }

  private animateStars(stars: Star[], opacityRange: [number, number], durationRange: [number, number]): void {
    stars.forEach(star => {
      gsap.to(star, {
        opacity: Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
        duration: Math.random() * (durationRange[1] - durationRange[0]) + durationRange[0],
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
      })
    })
  }

  private updateStarPositions(stars: Star[], width: number, height: number, prevWidth: number, prevHeight: number, isCenter: boolean = false): void {
    const canvasCenter = { x: width / 2, y: height / 2 }
    const previousMaxSize = Math.max(prevWidth, prevHeight)
    const currentMaxSize = Math.max(width, height)
    const scaleRatio = previousMaxSize > 0 ? currentMaxSize / previousMaxSize : 1
    
    stars.forEach(star => {
      if (isCenter) {
        star.centerX = canvasCenter.x
        star.centerY = canvasCenter.y
        star.orbitRadius = star.orbitRadius * scaleRatio
      } else {
        const relativeX = star.centerX / prevWidth || 0.5
        const relativeY = star.centerY / prevHeight || 0.5
        star.centerX = relativeX * width
        star.centerY = relativeY * height
      }
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
    })
  }

  private filterAndAddStars(starsRef: any, count: number, width: number, height: number, radiusRange: [number, number], opacityRange: [number, number], orbitRadiusRange: [number, number], speedRange: [number, number]): void {
    starsRef.value = starsRef.value.filter((star: Star) => {
      const maxDistance = Math.sqrt(star.orbitRadius * star.orbitRadius + star.orbitRadius * star.orbitRadius)
      return (star.centerX + maxDistance >= 0 && star.centerX - maxDistance <= width &&
              star.centerY + maxDistance >= 0 && star.centerY - maxDistance <= height)
    })
    
    const needed = count - starsRef.value.length
    if (needed > 0) {
      const newStars = this.createStars(needed, width, height, radiusRange, opacityRange, orbitRadiusRange, speedRange)
      starsRef.value.push(...newStars)
    }
  }
} 