import { Ref, ref } from 'vue'
import type { CanvasRepository as ICanvasRepository } from './types'
import type { BubbleNode } from '@/types/canvas'
import { GAME_CONFIG } from '@/config'
import { gsap } from 'gsap'
import { usePerformanceStore } from '@/stores/performance.store'
import { useBubbleStore } from '@/stores'
import { useSessionStore } from '@/stores'
import { getBubblesToRender } from '@/utils/nodes'

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
  private deepBgStars = ref<Star[]>([])
  private previousWidth = 0
  private previousHeight = 0
  
  // Система мониторинга производительности
  private frameCount = 0
  private lastTime = 0
  private fps = 60
  private performanceLevel = 0 // 0 - полная производительность, 1 - оптимизированная, 2 - минимальная
  private optimizationCheckInterval = 0

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
    if (!this.centerStars.value || !this.bgStars.value || !this.fgStars.value || !this.deepBgStars.value) {
      console.log('CanvasRepository.drawStarfield: stars not initialized, skipping')
      return
    }

    // Мониторинг производительности
    this.updatePerformanceMetrics()

    // Рисуем самый дальний фоновый слой (медленно вращающиеся звезды)
    context.save()
    this.deepBgStars.value.forEach(star => {
      star.angle += star.speed
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
      
      context.beginPath()
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
      context.fill()
    })
    context.restore()

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
    
    const config = GAME_CONFIG.performance
    const starCounts = this.getStarCountsForLevel()
    
    // Самый дальний фоновый слой (медленно вращающиеся звезды)
    if (starCounts.deepBg > 0) {
      const deepBgConfig = config.starLayers.deepBg
      const orbitRadiusRange = this.calculateOrbitRadiusRange(deepBgConfig.orbitRadiusRange, width, height)
      this.deepBgStars.value = this.createStars(starCounts.deepBg, width, height, deepBgConfig, orbitRadiusRange)
      this.animateStars(this.deepBgStars.value, deepBgConfig.opacityRange, deepBgConfig.animationDuration)
    } else {
      this.deepBgStars.value = []
    }
    
    // Центральный слой
    const centerConfig = config.starLayers.center
    const centerOrbitRadiusRange = this.calculateOrbitRadiusRange(centerConfig.orbitRadiusRange, width, height)
    this.centerStars.value = this.createStars(starCounts.center, width, height, centerConfig, centerOrbitRadiusRange)
    this.animateStars(this.centerStars.value, centerConfig.opacityRange, centerConfig.animationDuration)
    
    // Задний слой
    const bgConfig = config.starLayers.bg
    this.bgStars.value = this.createStars(starCounts.bg, width, height, bgConfig, bgConfig.orbitRadiusRange)
    this.animateStars(this.bgStars.value, bgConfig.opacityRange, bgConfig.animationDuration)
    
    // Передний слой
    const fgConfig = config.starLayers.fg
    this.fgStars.value = this.createStars(starCounts.fg, width, height, fgConfig, fgConfig.orbitRadiusRange)
    this.animateStars(this.fgStars.value, fgConfig.opacityRange, fgConfig.animationDuration)
  }

  updateStarfieldSize(width: number, height: number): void {
    this.updateStarPositions(this.deepBgStars.value, width, height, this.previousWidth, this.previousHeight, true)
    this.updateStarPositions(this.centerStars.value, width, height, this.previousWidth, this.previousHeight, true)
    this.updateStarPositions(this.bgStars.value, width, height, this.previousWidth, this.previousHeight)
    this.updateStarPositions(this.fgStars.value, width, height, this.previousWidth, this.previousHeight)
    
    const config = GAME_CONFIG.performance
    const starCounts = this.getStarCountsForLevel()
    
    if (starCounts.deepBg > 0) {
      const deepBgConfig = config.starLayers.deepBg
      const orbitRadiusRange = this.calculateOrbitRadiusRange(deepBgConfig.orbitRadiusRange, width, height)
      this.filterAndAddStars(this.deepBgStars, starCounts.deepBg, width, height, deepBgConfig, orbitRadiusRange)
    }
    
    const centerConfig = config.starLayers.center
    const centerOrbitRadiusRange = this.calculateOrbitRadiusRange(centerConfig.orbitRadiusRange, width, height)
    this.filterAndAddStars(this.centerStars, starCounts.center, width, height, centerConfig, centerOrbitRadiusRange)
    
    const bgConfig = config.starLayers.bg
    this.filterAndAddStars(this.bgStars, starCounts.bg, width, height, bgConfig, bgConfig.orbitRadiusRange)
    
    const fgConfig = config.starLayers.fg
    this.filterAndAddStars(this.fgStars, starCounts.fg, width, height, fgConfig, fgConfig.orbitRadiusRange)
    
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

  // Публичные методы для получения информации о производительности
  getPerformanceInfo(): { fps: number; performanceLevel: number; starCount: number; activeNodes: number } {
    const totalStars = this.deepBgStars.value.length + this.centerStars.value.length + this.bgStars.value.length + this.fgStars.value.length
    const bubbleStore = useBubbleStore()
    const sessionStore = useSessionStore()
    
    // Подсчитываем активные узлы для текущего года
    const activeNodesForCurrentYear = getBubblesToRender(
      bubbleStore.bubbles,
      sessionStore.currentYear,
      sessionStore.visitedBubbles,
      [],
      sessionStore.hasUnlockedFirstToughBubbleAchievement
    ).length
    
    return {
      fps: Math.round(this.fps),
      performanceLevel: this.performanceLevel,
      starCount: totalStars,
      activeNodes: activeNodesForCurrentYear
    }
  }

  getStarCounts(): { deepBg: number; center: number; bg: number; fg: number } {
    return {
      deepBg: this.deepBgStars.value.length,
      center: this.centerStars.value.length,
      bg: this.bgStars.value.length,
      fg: this.fgStars.value.length
    }
  }

  private getStarCountsForLevel() {
    const config = GAME_CONFIG.performance
    switch (this.performanceLevel) {
      case 0:
        return config.starCounts.full
      case 1:
        return config.starCounts.optimized
      case 2:
        return config.starCounts.minimal
      default:
        return config.starCounts.full
    }
  }

  private calculateOrbitRadiusRange(range: [number, number], width: number, height: number): [number, number] {
    const maxSize = Math.max(width, height)
    return [range[0] * maxSize, range[1] * maxSize]
  }

  private createStars(count: number, width: number, height: number, layerConfig: any, orbitRadiusRange: [number, number]): Star[] {
    const stars: Star[] = []
    const canvasCenter = { x: width / 2, y: height / 2 }
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const orbitRadius = Math.random() * (orbitRadiusRange[1] - orbitRadiusRange[0]) + orbitRadiusRange[0]
      const centerX = layerConfig.isCenter ? canvasCenter.x : Math.random() * width
      const centerY = layerConfig.isCenter ? canvasCenter.y : Math.random() * height
      
      stars.push({
        x: centerX + Math.cos(angle) * orbitRadius,
        y: centerY + Math.sin(angle) * orbitRadius,
        radius: Math.random() * (layerConfig.radiusRange[1] - layerConfig.radiusRange[0]) + layerConfig.radiusRange[0],
        opacity: Math.random() * (layerConfig.opacityRange[1] - layerConfig.opacityRange[0]) + layerConfig.opacityRange[0],
        angle,
        orbitRadius,
        centerX,
        centerY,
        speed: (Math.random() * (layerConfig.speedRange[1] - layerConfig.speedRange[0]) + layerConfig.speedRange[0]) * (Math.random() > 0.5 ? 1 : -1)
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

  private filterAndAddStars(starsRef: any, count: number, width: number, height: number, layerConfig: any, orbitRadiusRange: [number, number]): void {
    starsRef.value = starsRef.value.filter((star: Star) => {
      const maxDistance = Math.sqrt(star.orbitRadius * star.orbitRadius + star.orbitRadius * star.orbitRadius)
      return (star.centerX + maxDistance >= 0 && star.centerX - maxDistance <= width &&
              star.centerY + maxDistance >= 0 && star.centerY - maxDistance <= height)
    })
    
    const needed = count - starsRef.value.length
    if (needed > 0) {
      const newStars = this.createStars(needed, width, height, layerConfig, orbitRadiusRange)
      starsRef.value.push(...newStars)
    }
  }

  // Методы для мониторинга производительности
  private updatePerformanceMetrics(): void {
    this.frameCount++
    this.optimizationCheckInterval++
    
    const currentTime = performance.now()
    if (this.lastTime > 0) {
      const deltaTime = currentTime - this.lastTime
      this.fps = 1000 / deltaTime
    }
    this.lastTime = currentTime
    
    // Обновляем данные в store
    const performanceStore = usePerformanceStore()
    const bubbleStore = useBubbleStore()
    const sessionStore = useSessionStore()
    
    // Подсчитываем активные узлы для текущего года
    const activeNodesForCurrentYear = getBubblesToRender(
      bubbleStore.bubbles,
      sessionStore.currentYear,
      sessionStore.visitedBubbles,
      [],
      sessionStore.hasUnlockedFirstToughBubbleAchievement
    ).length
    
    performanceStore.updatePerformanceInfo({
      fps: Math.round(this.fps),
      performanceLevel: this.performanceLevel,
      starCount: this.deepBgStars.value.length + this.centerStars.value.length + this.bgStars.value.length + this.fgStars.value.length,
      activeNodes: activeNodesForCurrentYear
    })
    
    performanceStore.updateStarCounts({
      deepBg: this.deepBgStars.value.length,
      center: this.centerStars.value.length,
      bg: this.bgStars.value.length,
      fg: this.fgStars.value.length
    })
    
    // Проверяем производительность каждые N кадров
    const config = GAME_CONFIG.performance
    if (this.optimizationCheckInterval >= config.optimizationCheckFrequency) {
      this.optimizationCheckInterval = 0
      this.checkAndOptimizePerformance()
    }
  }

  private checkAndOptimizePerformance(): void {
    const config = GAME_CONFIG.performance
    
    if (this.fps < config.fpsThreshold && this.performanceLevel < 2) {
      // Снижаем производительность
      this.performanceLevel++
      this.applyPerformanceOptimization()
      console.log(`🔧 Производительность снижена до уровня ${this.performanceLevel}. FPS: ${this.fps.toFixed(1)}`)
    } else if (this.fps > config.fpsTarget && this.performanceLevel > 0) {
      // Повышаем производительность
      this.performanceLevel--
      this.applyPerformanceOptimization()
      console.log(`🚀 Производительность повышена до уровня ${this.performanceLevel}. FPS: ${this.fps.toFixed(1)}`)
    }
  }

  private applyPerformanceOptimization(): void {
    switch (this.performanceLevel) {
      case 0: // Полная производительность
        this.restoreFullStarfield()
        break
      case 1: // Оптимизированная производительность
        this.applyMediumOptimization()
        break
      case 2: // Минимальная производительность
        this.applyMinimalOptimization()
        break
    }
  }

  private restoreFullStarfield(): void {
    // Восстанавливаем полное количество звезд
    const currentWidth = this.canvas?.width || 1920
    const currentHeight = this.canvas?.height || 1080
    const config = GAME_CONFIG.performance
    const starCounts = config.starCounts.full
    
    // Восстанавливаем дальний фон
    if (this.deepBgStars.value.length < starCounts.deepBg) {
      const needed = starCounts.deepBg - this.deepBgStars.value.length
      const deepBgConfig = config.starLayers.deepBg
      const orbitRadiusRange = this.calculateOrbitRadiusRange(deepBgConfig.orbitRadiusRange, currentWidth, currentHeight)
      const newStars = this.createStars(needed, currentWidth, currentHeight, deepBgConfig, orbitRadiusRange)
      this.deepBgStars.value.push(...newStars)
      this.animateStars(this.deepBgStars.value, deepBgConfig.opacityRange, deepBgConfig.animationDuration)
    }
    
    // Восстанавливаем центральный слой
    if (this.centerStars.value.length < starCounts.center) {
      const needed = starCounts.center - this.centerStars.value.length
      const centerConfig = config.starLayers.center
      const orbitRadiusRange = this.calculateOrbitRadiusRange(centerConfig.orbitRadiusRange, currentWidth, currentHeight)
      const newStars = this.createStars(needed, currentWidth, currentHeight, centerConfig, orbitRadiusRange)
      this.centerStars.value.push(...newStars)
      this.animateStars(this.centerStars.value, centerConfig.opacityRange, centerConfig.animationDuration)
    }
  }

  private applyMediumOptimization(): void {
    const config = GAME_CONFIG.performance
    const starCounts = config.starCounts.optimized
    
    // Убираем дальний фон полностью
    this.deepBgStars.value = []
    
    // Сокращаем центральный слой
    if (this.centerStars.value.length > starCounts.center) {
      this.centerStars.value = this.centerStars.value.slice(0, starCounts.center)
    }
  }

  private applyMinimalOptimization(): void {
    const config = GAME_CONFIG.performance
    const starCounts = config.starCounts.minimal
    
    // Убираем дальний и центральный фон полностью
    this.deepBgStars.value = []
    this.centerStars.value = []
  }
} 