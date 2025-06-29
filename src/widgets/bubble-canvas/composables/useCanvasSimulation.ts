import { ref, type Ref } from 'vue'
import * as d3 from 'd3'
import type { Bubble } from '../../../shared/types'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import { useSessionStore } from '../../../entities/user-session/model/session-store'
import { useModalStore } from '../../../shared/stores/modal-store'

interface CanvasBubble extends Bubble {
  radius: number
  color: string
  oscillationPhase: number
  targetRadius: number
  currentRadius: number
  baseRadius: number
  isHovered?: boolean
  isVisited?: boolean
  textLines?: string[]
}

interface SimulationNode extends CanvasBubble {
  x: number
  y: number
  vx?: number
  vy?: number
}

export function useCanvasSimulation(canvasRef: Ref<HTMLCanvasElement | null>) {
  const isInitialized = ref(false)
  const sessionStore = useSessionStore()
  const modalStore = useModalStore()
  
  let simulation: d3.Simulation<SimulationNode, undefined> | null = null
  let nodes: SimulationNode[] = []
  let ctx: CanvasRenderingContext2D | null = null
  let width = 0
  let height = 0
  let animationId: number = 0
  let hoveredBubble: SimulationNode | null = null
  let restartInterval: number = 0
  
  // Сохранение позиций между фильтрациями
  const savedPositions = new Map<string, { x: number, y: number, vx: number, vy: number }>()
  
  // Визуальные эффекты взрыва
  interface ExplosionEffect {
    x: number
    y: number
    radius: number
    maxRadius: number
    opacity: number
    startTime: number
  }
  
  let explosionEffects: ExplosionEffect[] = []

  // Цвета по категориям технологий
  const categoryColors = {
    'foundation': '#3b82f6',
    'framework': '#8b5cf6', 
    'language': '#ec4899',
    'tooling': '#0ea5e9',
    'philosophy': '#10b981',
    'skill': '#f59e0b',
    'library': '#6366f1',
    'runtime': '#06b6d4',
    'preprocessor': '#a855f7',
    'optimization': '#059669',
    'quality': '#dc2626',
    'state-management': '#7c3aed',
    'inclusive': '#2563eb',
    'visualization': '#0891b2',
    'animation': '#be185d',
    'technique': '#16a34a',
    'design': '#ea580c',
    'tool': '#9333ea',
    'soft-skill': '#4f46e5'
  }

  // Проверка Windows для отключения анимации дыхания
  const isWindows = (): boolean => {
    return typeof window !== 'undefined' && /Win/.test(window.navigator.platform)
  }

  // Адаптивный расчет размеров пузырей
  const calculateAdaptiveSizes = (bubbleCount: number): { min: number, max: number } => {
    // Цель: заполнить 75% экрана пузырями
    const screenArea = width * height * 0.75
    const averageAreaPerBubble = screenArea / bubbleCount
    const averageRadius = Math.sqrt(averageAreaPerBubble / Math.PI)
    
    // Учитываем соотношение сторон экрана для более равномерного распределения
    const aspectRatio = width / height
    const aspectFactor = Math.min(1.2, Math.max(0.8, aspectRatio / 1.5))
    
    // Диапазон размеров на основе среднего с учетом соотношения сторон
    const baseMinRadius = Math.max(20, averageRadius * 0.5 * aspectFactor)
    const baseMaxRadius = Math.min(100, averageRadius * 1.5 * aspectFactor)
    
    // Ограничиваем размеры чтобы пузыри всегда помещались на экране
    const maxAllowedRadius = Math.min(width, height) / 8
    const minRadius = Math.min(baseMinRadius, maxAllowedRadius * 0.3)
    const maxRadius = Math.min(baseMaxRadius, maxAllowedRadius)
    
    return { min: minRadius, max: maxRadius }
  }

  // Умная обрезка текста на несколько строк
  const wrapText = (text: string, radius: number): string[] => {
    const maxCharsPerLine = Math.max(4, Math.floor(radius / 4))
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine
      } else {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          // Слово слишком длинное, обрезаем
          lines.push(word.slice(0, maxCharsPerLine - 3) + '...')
          currentLine = ''
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    // Максимум 2 строки
    if (lines.length > 2) {
      lines[1] = lines[1].slice(0, -3) + '...'
      return lines.slice(0, 2)
    }
    
    return lines
  }

  // Создание узлов из пузырей
  const createNodes = (bubbles: Bubble[]): SimulationNode[] => {
    const sizes = calculateAdaptiveSizes(bubbles.length)
    
    return bubbles.map((bubble, index) => {
      // Используем конфигурацию уровня экспертизы для определения размера
      const expertiseConfig = GAME_CONFIG.EXPERTISE_LEVELS[bubble.skillLevel]
      const skillLevels = ['novice', 'intermediate', 'confident', 'expert', 'master']
      const skillIndex = skillLevels.indexOf(bubble.skillLevel)
      const sizeRatio = (skillIndex + 1) / skillLevels.length
      
      // Применяем множитель размера из конфигурации
      const calculatedRadius = sizes.min + (sizes.max - sizes.min) * sizeRatio
      const baseRadius = calculatedRadius * expertiseConfig.sizeMultiplier
      
      // Восстанавливаем сохраненные позиции
      const savedPos = savedPositions.get(bubble.id)
      
      const node: SimulationNode = {
        ...bubble,
        radius: baseRadius,
        baseRadius,
        color: categoryColors[bubble.category as keyof typeof categoryColors] || '#667eea',
        oscillationPhase: Math.random() * Math.PI * 2,
        targetRadius: baseRadius,
        currentRadius: baseRadius,
        x: savedPos?.x ?? Math.random() * width,
        y: savedPos?.y ?? Math.random() * height,
        vx: savedPos?.vx ?? 0,
        vy: savedPos?.vy ?? 0,
        isHovered: false,
        isVisited: sessionStore.visitedBubbles.includes(bubble.id),
        textLines: wrapText(bubble.name, baseRadius)
      }
      
      return node
    })
  }

  // Отрисовка реалистичного пузыря с градацией по уровню экспертизы
  const drawBubble = (context: CanvasRenderingContext2D, bubble: SimulationNode) => {
    context.save()
    
    // Получаем конфигурацию для уровня экспертизы
    const expertiseConfig = GAME_CONFIG.EXPERTISE_LEVELS[bubble.skillLevel]
    
    const opacity = bubble.isVisited ? 0.3 : (bubble.isHovered ? 1 : expertiseConfig.opacity)
    
    // Тень с учетом уровня экспертизы
    const shadowOpacity = opacity * (0.2 + expertiseConfig.glowIntensity * 0.3)
    context.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`
    context.shadowBlur = bubble.isHovered ? 25 : (10 + expertiseConfig.glowIntensity * 15)
    context.shadowOffsetX = 3
    context.shadowOffsetY = 3
    
    // Эффект свечения для высоких уровней
    if (expertiseConfig.glowIntensity > 0) {
      const glowGradient = context.createRadialGradient(
        bubble.x, bubble.y, bubble.currentRadius * 0.8,
        bubble.x, bubble.y, bubble.currentRadius * (1.5 + expertiseConfig.glowIntensity)
      )
      const glowColor = d3.color(expertiseConfig.shadowColor)!
      glowGradient.addColorStop(0, glowColor.copy({ opacity: expertiseConfig.glowIntensity * 0.3 }).toString())
      glowGradient.addColorStop(1, glowColor.copy({ opacity: 0 }).toString())
      
      context.fillStyle = glowGradient
      context.beginPath()
      context.arc(bubble.x, bubble.y, bubble.currentRadius * (1.5 + expertiseConfig.glowIntensity), 0, 2 * Math.PI)
      context.fill()
    }
    
    // Основной градиент пузыря с использованием цветов из конфигурации
    let mainGradient: CanvasGradient
    
    if ('hasGradient' in expertiseConfig && expertiseConfig.hasGradient && 'gradientColors' in expertiseConfig && expertiseConfig.gradientColors) {
      // Градиентная заливка для мастер-уровня
      mainGradient = context.createRadialGradient(
        bubble.x - bubble.currentRadius * 0.3, bubble.y - bubble.currentRadius * 0.3, 0,
        bubble.x, bubble.y, bubble.currentRadius
      )
      const color1 = d3.color(expertiseConfig.gradientColors[0])!
      const color2 = d3.color(expertiseConfig.gradientColors[1])!
      mainGradient.addColorStop(0, color1.brighter(0.4).toString())
      mainGradient.addColorStop(0.4, color1.toString())
      mainGradient.addColorStop(0.7, color2.toString())
      mainGradient.addColorStop(1, color2.darker(0.3).toString())
    } else {
      // Стандартный градиент с цветами уровня экспертизы
      mainGradient = context.createRadialGradient(
        bubble.x, bubble.y, 0,
        bubble.x, bubble.y, bubble.currentRadius
      )
      const baseColor = d3.color(expertiseConfig.color)!
      mainGradient.addColorStop(0, baseColor.brighter(0.3).toString())
      mainGradient.addColorStop(0.7, baseColor.toString())
      mainGradient.addColorStop(1, baseColor.darker(0.5).toString())
    }
    
    // Основной круг
    context.beginPath()
    context.arc(bubble.x, bubble.y, bubble.currentRadius, 0, Math.PI * 2)
    context.fillStyle = mainGradient
    context.globalAlpha = opacity
    context.fill()
    
    // Убираем тень для последующих элементов
    context.shadowColor = 'transparent'
    
    // Глянцевый отблеск
    const highlightGradient = context.createRadialGradient(
      bubble.x - bubble.currentRadius * 0.3,
      bubble.y - bubble.currentRadius * 0.3,
      0,
      bubble.x - bubble.currentRadius * 0.3,
      bubble.y - bubble.currentRadius * 0.3,
      bubble.currentRadius * 0.6
    )
    
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    context.beginPath()
    context.arc(bubble.x, bubble.y, bubble.currentRadius, 0, Math.PI * 2)
    context.fillStyle = highlightGradient
    context.fill()
    
    // Граница с учетом уровня экспертизы
    context.beginPath()
    context.arc(bubble.x, bubble.y, bubble.currentRadius, 0, Math.PI * 2)
    const borderColor = d3.color(expertiseConfig.borderColor)!
    context.strokeStyle = borderColor.copy({ opacity: opacity * 0.8 }).toString()
    context.lineWidth = expertiseConfig.borderWidth
    context.stroke()
    
    context.restore()
  }

  // Отрисовка текста
  const drawText = (context: CanvasRenderingContext2D, bubble: SimulationNode) => {
    if (!bubble.textLines) return
    
    context.save()
    
    const fontSize = Math.max(12, bubble.currentRadius * 0.25)
    context.font = `bold ${fontSize}px Inter, sans-serif`
    context.fillStyle = 'white'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.globalAlpha = bubble.isVisited ? 0.4 : 1
    
    // Тень для текста
    context.shadowColor = 'rgba(0, 0, 0, 0.7)'
    context.shadowBlur = 3
    context.shadowOffsetX = 1
    context.shadowOffsetY = 1
    
    const lineHeight = fontSize * 1.2
    const totalHeight = bubble.textLines.length * lineHeight
    const startY = bubble.y - totalHeight / 2 + lineHeight / 2
    
    bubble.textLines.forEach((line, index) => {
      const y = startY + index * lineHeight
      context.fillText(line, bubble.x, y)
    })
    
    context.restore()
  }

  // Обновление состояния пузырей с живой физикой
  const updateBubbleStates = () => {
    const time = Date.now() * 0.0008
    
    nodes.forEach((bubble, index) => {
      const expertiseConfig = GAME_CONFIG.EXPERTISE_LEVELS[bubble.skillLevel]
      
      // Живые колебания радиуса (дыхание) - только не на Windows
      if (!isWindows()) {
        let oscillation = Math.sin(time * 2 + bubble.oscillationPhase) * 0.05
        
        // Эффект пульсации для мастер-уровня
        if ('hasPulse' in expertiseConfig && expertiseConfig.hasPulse) {
          const pulseSpeed = time * (GAME_CONFIG.ANIMATION.MASTER_PULSE / 3000)
          const pulseAmplitude = 0.15 // Более заметная пульсация
          oscillation += Math.sin(pulseSpeed + bubble.oscillationPhase) * pulseAmplitude
        }
        
        bubble.currentRadius = bubble.targetRadius * (1 + oscillation)
      } else {
        bubble.currentRadius = bubble.targetRadius
      }
      
      // Постоянное броуновское движение
      const phase = index * 1.3
      const oscillationX = Math.sin(time * 0.4 + phase) * 0.3
      const oscillationY = Math.cos(time * 0.6 + phase) * 0.2
      
      // Небольшие случайные возмущения
      const randomX = (Math.random() - 0.5) * 0.05
      const randomY = (Math.random() - 0.5) * 0.05
      
      bubble.x += oscillationX + randomX
      bubble.y += oscillationY + randomY

      // Границы с учетом текущего радиуса
      const padding = bubble.currentRadius + 5
      bubble.x = Math.max(padding, Math.min(width - padding, bubble.x))
      bubble.y = Math.max(padding, Math.min(height - padding, bubble.y))
      
      // Обновляем текстовые строки при изменении размера
      if (Math.abs(bubble.currentRadius - bubble.baseRadius) > 1) {
        bubble.textLines = wrapText(bubble.name, bubble.currentRadius)
      }
    })
  }

  // Отрисовка зоны воздействия при ховере
  const drawHoverEffect = (context: CanvasRenderingContext2D, bubble: SimulationNode) => {
    const pushRadius = bubble.baseRadius * 4
    
    context.save()
    
    // Градиентный эффект расходящихся волн (без пунктирной линии)
    const gradient = context.createRadialGradient(
      bubble.x, bubble.y, bubble.currentRadius,
      bubble.x, bubble.y, pushRadius
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    context.beginPath()
    context.arc(bubble.x, bubble.y, pushRadius, 0, Math.PI * 2)
    context.fillStyle = gradient
    context.fill()
    
    context.restore()
  }

  // Отрисовка эффектов взрыва
  const drawExplosionEffects = (context: CanvasRenderingContext2D) => {
    const currentTime = Date.now()
    
    // Обновляем и отрисовываем каждый эффект взрыва
    explosionEffects = explosionEffects.filter(effect => {
      const elapsed = currentTime - effect.startTime
      const duration = 1000 // 1 секунда анимации
      
      if (elapsed > duration) {
        return false // Удаляем завершенные эффекты
      }
      
      // Прогресс анимации от 0 до 1
      const progress = elapsed / duration
      
      // Радиус расширяется от 0 до maxRadius
      effect.radius = effect.maxRadius * progress
      
      // Прозрачность убывает от 1 до 0
      effect.opacity = 1 - progress
      
      context.save()
      
      // Сбрасываем линию пунктира если была установлена
      context.setLineDash([])
      
      // Внешнее кольцо взрыва
      context.beginPath()
      context.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2)
      context.strokeStyle = `rgba(255, 100, 100, ${effect.opacity * 0.8})`
      context.lineWidth = 4
      context.stroke()
      
      // Внутреннее кольцо взрыва
      context.beginPath()
      context.arc(effect.x, effect.y, effect.radius * 0.7, 0, Math.PI * 2)
      context.strokeStyle = `rgba(255, 200, 100, ${effect.opacity * 0.6})`
      context.lineWidth = 2
      context.stroke()
      
      // Центральная вспышка
      if (progress < 0.3) {
        const flashOpacity = effect.opacity * (1 - progress / 0.3)
        const flashGradient = context.createRadialGradient(
          effect.x, effect.y, 0,
          effect.x, effect.y, effect.radius * 0.3
        )
        flashGradient.addColorStop(0, `rgba(255, 255, 255, ${flashOpacity})`)
        flashGradient.addColorStop(1, `rgba(255, 255, 255, 0)`)
        
        context.beginPath()
        context.arc(effect.x, effect.y, effect.radius * 0.3, 0, Math.PI * 2)
        context.fillStyle = flashGradient
        context.fill()
      }
      
      context.restore()
      
      return true // Оставляем эффект
    })
  }

  // Рендеринг всех пузырей
  const render = () => {
    if (!ctx || !canvasRef.value) return
    
    // Очищаем canvas
    ctx.clearRect(0, 0, width, height)
    
    // Затем рисуем зону воздействия для hover пузыря
    if (hoveredBubble) {
      drawHoverEffect(ctx, hoveredBubble)
    }
    
    // Затем рисуем обычные пузыри
    nodes.forEach(bubble => {
      if (!bubble.isHovered) {
        drawBubble(ctx!, bubble)
        drawText(ctx!, bubble)
      }
    })
    
    // Наконец рисуем hover пузырь поверх всех
    if (hoveredBubble) {
      drawBubble(ctx, hoveredBubble)
      drawText(ctx, hoveredBubble)
    }
  }

  // Основной цикл анимации
  const animate = () => {
    updateBubbleStates()
    render()
    animationId = requestAnimationFrame(animate)
  }

  // Поиск пузыря под курсором
  const findBubbleUnderCursor = (mouseX: number, mouseY: number): SimulationNode | null => {
    // Ищем в обратном порядке (сверху вниз)
    for (let i = nodes.length - 1; i >= 0; i--) {
      const bubble = nodes[i]
      const dx = mouseX - bubble.x
      const dy = mouseY - bubble.y
      if (Math.sqrt(dx * dx + dy * dy) <= bubble.currentRadius) {
        return bubble
      }
    }
    return null
  }

  // Импульсное отталкивание соседей при ховере
  const pushNeighbors = (centerBubble: SimulationNode, pushRadius: number, pushStrength: number) => {
    let affectedCount = 0
    
    nodes.forEach(bubble => {
      if (bubble.id === centerBubble.id) return
      
      const dx = bubble.x - centerBubble.x
      const dy = bubble.y - centerBubble.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Если пузырь в радиусе воздействия
      if (distance < pushRadius && distance > 0) {
        // Нормализуем вектор направления
        const normalizedDx = dx / distance
        const normalizedDy = dy / distance
        
        // Увеличиваем силу и делаем её более заметной
        const force = pushStrength * (1 - distance / pushRadius) * 3
        
        // Применяем импульс к скорости более агрессивно
        bubble.vx = (bubble.vx || 0) + normalizedDx * force
        bubble.vy = (bubble.vy || 0) + normalizedDy * force
        
        // Также немного сдвигаем позицию для мгновенного эффекта
        bubble.x += normalizedDx * force * 0.5
        bubble.y += normalizedDy * force * 0.5
        
        // Ограничиваем максимальную скорость
        const maxVelocity = 15 // Увеличили максимальную скорость
        const currentVelocity = Math.sqrt((bubble.vx || 0) ** 2 + (bubble.vy || 0) ** 2)
        if (currentVelocity > maxVelocity) {
          const scale = maxVelocity / currentVelocity
          bubble.vx = (bubble.vx || 0) * scale
          bubble.vy = (bubble.vy || 0) * scale
        }
        
        affectedCount++
      }
    })
    
    // Перезапускаем симуляцию для лучшего отклика
    if (simulation && affectedCount > 0) {
      simulation.alpha(0.5).restart()
    }
    
    console.log(`💥 Оттолкнуто ${affectedCount} пузырей от ${centerBubble.name}`)
  }

  // Отталкивание от точки клика как от стены (взрыв)
  const explodeFromPoint = (clickX: number, clickY: number, explosionRadius: number, explosionStrength: number) => {
    let affectedCount = 0
    
    nodes.forEach(bubble => {
      const dx = bubble.x - clickX
      const dy = bubble.y - clickY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Если пузырь в радиусе взрыва
      if (distance < explosionRadius) {
        // Если пузырь прямо в центре клика, отталкиваем в случайном направлении
        let normalizedDx, normalizedDy
        if (distance < 5) {
          const randomAngle = Math.random() * Math.PI * 2
          normalizedDx = Math.cos(randomAngle)
          normalizedDy = Math.sin(randomAngle)
        } else {
          // Нормализуем вектор направления от центра взрыва
          normalizedDx = dx / distance
          normalizedDy = dy / distance
        }
        
        // Сила взрыва убывает с расстоянием (как от стены)
        const force = explosionStrength * (1 - distance / explosionRadius) * 4
        
        // Применяем мощный импульс для эффекта взрыва
        bubble.vx = (bubble.vx || 0) + normalizedDx * force
        bubble.vy = (bubble.vy || 0) + normalizedDy * force
        
        // Немедленно сдвигаем позицию для мгновенного эффекта
        bubble.x += normalizedDx * force * 0.8
        bubble.y += normalizedDy * force * 0.8
        
        // Ограничиваем максимальную скорость для контроля
        const maxVelocity = 20 // Высокая скорость для эффекта взрыва
        const currentVelocity = Math.sqrt((bubble.vx || 0) ** 2 + (bubble.vy || 0) ** 2)
        if (currentVelocity > maxVelocity) {
          const scale = maxVelocity / currentVelocity
          bubble.vx = (bubble.vx || 0) * scale
          bubble.vy = (bubble.vy || 0) * scale
        }
        
        // Убеждаемся что пузыри не выходят за границы экрана
        const padding = bubble.currentRadius + 5
        bubble.x = Math.max(padding, Math.min(width - padding, bubble.x))
        bubble.y = Math.max(padding, Math.min(height - padding, bubble.y))
        
        affectedCount++
      }
    })
    
    // Визуальный эффект не нужен - только физическое отталкивание
    
    // Сильно перезапускаем симуляцию для драматичного эффекта
    if (simulation && affectedCount > 0) {
      simulation.alpha(0.8).restart()
    }
    
    // Эффект взрыва создан
  }

  // Мощный взрыв пузыря при удалении
  const explodeBubble = (bubble: SimulationNode) => {
    
    // Параметры локального взрыва - только слегка за пределы радиуса пузыря
    const explosionRadius = bubble.baseRadius * 2.5 // Более локальный эффект
    const explosionStrength = 30 // Очень мощный но локальный взрыв
    
    // Отталкиваем все соседние пузыри
    let affectedCount = 0
    nodes.forEach(otherBubble => {
      if (otherBubble.id === bubble.id) return
      
      const dx = otherBubble.x - bubble.x
      const dy = otherBubble.y - bubble.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Если пузырь в радиусе взрыва
      if (distance < explosionRadius) {
        // Нормализуем вектор направления от взрывающегося пузыря
        let normalizedDx, normalizedDy
        if (distance < 5) {
          const randomAngle = Math.random() * Math.PI * 2
          normalizedDx = Math.cos(randomAngle)
          normalizedDy = Math.sin(randomAngle)
        } else {
          normalizedDx = dx / distance
          normalizedDy = dy / distance
        }
        
        // Очень мощная сила взрыва
        const force = explosionStrength * (1 - distance / explosionRadius) * 5
        
        // Применяем импульс
        otherBubble.vx = (otherBubble.vx || 0) + normalizedDx * force
        otherBubble.vy = (otherBubble.vy || 0) + normalizedDy * force
        
        // Немедленный сдвиг для драматичного эффекта
        otherBubble.x += normalizedDx * force * 1.2
        otherBubble.y += normalizedDy * force * 1.2
        
        // Ограничиваем скорость
        const maxVelocity = 30 // Очень высокая скорость для взрыва
        const currentVelocity = Math.sqrt((otherBubble.vx || 0) ** 2 + (otherBubble.vy || 0) ** 2)
        if (currentVelocity > maxVelocity) {
          const scale = maxVelocity / currentVelocity
          otherBubble.vx = (otherBubble.vx || 0) * scale
          otherBubble.vy = (otherBubble.vy || 0) * scale
        }
        
        // Границы экрана
        const padding = otherBubble.currentRadius + 5
        otherBubble.x = Math.max(padding, Math.min(width - padding, otherBubble.x))
        otherBubble.y = Math.max(padding, Math.min(height - padding, otherBubble.y))
        
        affectedCount++
      }
    })
    
    // Мощный перезапуск симуляции
    if (simulation && affectedCount > 0) {
      simulation.alpha(1.0).restart() // Максимальная энергия
    }
    
    // Взрыв пузыря завершен
  }

  // Обработка движения мыши
  const handleMouseMove = (event: MouseEvent) => {
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const newHoveredBubble = findBubbleUnderCursor(mouseX, mouseY)

    if (newHoveredBubble !== hoveredBubble) {
      // Сброс предыдущего ховера
      if (hoveredBubble) {
        hoveredBubble.targetRadius = hoveredBubble.baseRadius
        hoveredBubble.isHovered = false
      }

      hoveredBubble = newHoveredBubble

      // Применение нового ховера
      if (hoveredBubble) {
        hoveredBubble.targetRadius = hoveredBubble.baseRadius * 1.2
        hoveredBubble.isHovered = true
        canvasRef.value!.style.cursor = 'pointer'
        
        // Отталкиваем соседей при начале ховера
        const pushRadius = hoveredBubble.baseRadius * 4 // Увеличили радиус воздействия
        const pushStrength = 8 // Увеличили силу отталкивания
        pushNeighbors(hoveredBubble, pushRadius, pushStrength)
        
        console.log('🫧 Пузырь увеличен, соседи оттолкнуты:', hoveredBubble.name)
      } else {
        canvasRef.value!.style.cursor = 'default'
      }
    }
  }

  // Обработка ухода мыши
  const handleMouseLeave = () => {
    if (hoveredBubble) {
      hoveredBubble.targetRadius = hoveredBubble.baseRadius
      hoveredBubble.isHovered = false
      hoveredBubble = null
    }
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'default'
    }
  }

  // Обработка кликов
  const handleClick = async (event: MouseEvent) => {
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const clickedBubble = findBubbleUnderCursor(mouseX, mouseY)

    if (clickedBubble && !clickedBubble.isVisited) {
      console.log('Пузырь нажат:', clickedBubble.name)
      
      // Анимация клика - плавное изменение размера
      const originalRadius = clickedBubble.targetRadius
      clickedBubble.targetRadius = originalRadius * 0.9
      
      setTimeout(() => {
        clickedBubble.targetRadius = originalRadius * 1.3
        setTimeout(() => {
          clickedBubble.targetRadius = originalRadius
        }, 150)
      }, 100)
      
      // Открываем модальное окно с деталями
      if (clickedBubble.isEasterEgg) {
        // Для философских пузырей открываем философский модал
        const philosophyQuestion = {
          id: `question-${clickedBubble.id}`,
          question: clickedBubble.name,
          context: clickedBubble.description,
          agreeText: 'Я согласен с этим подходом и готов работать в этом стиле.',
          disagreeText: 'Я предпочитаю работать по-другому и не согласен с этим подходом.',
          livePenalty: GAME_CONFIG.PHILOSOPHY_WRONG_LIVES,
          isEasterEgg: true
        }
        modalStore.openPhilosophyModal(philosophyQuestion)
      } else {
        modalStore.openBubbleModal(clickedBubble)
      }
    } else {
      // Клик по пустому месту - создаем взрыв отталкивания
      const explosionRadius = Math.min(width, height) * 0.3 // 30% от размера экрана
      const explosionStrength = 15 // Сильный взрыв
      
      // Создаем эффект взрыва от точки клика
      explodeFromPoint(mouseX, mouseY, explosionRadius, explosionStrength)
    }
  }

  const initSimulation = (canvasWidth: number, canvasHeight: number) => {
    if (!canvasRef.value) return

    width = canvasWidth
    height = canvasHeight
    
    ctx = canvasRef.value.getContext('2d')
    if (!ctx) return
    
    // Инициализируем симуляцию с улучшенной физикой для импульсов
    simulation = d3.forceSimulation<SimulationNode>()
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.005))
      .force('collision', d3.forceCollide<SimulationNode>().radius(d => d.currentRadius + 8).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-12))
      .force('attract', d3.forceRadial(0, width / 2, height / 2).strength(0.003))
      .alpha(0.3)
      .alphaDecay(0) // Бесконечное движение
      .velocityDecay(0.75) // Уменьшили затухание для более заметного движения

    // Принудительно поддерживаем симуляцию
    restartInterval = window.setInterval(() => {
      if (simulation && simulation.alpha() < 0.1) {
        simulation.alpha(0.3).restart()
      }
    }, 3000)

    // Запускаем анимационный цикл
    animate()

    // Добавляем слушатель события удаления пузыря
    window.addEventListener('bubble-continue', handleBubbleContinue)

    isInitialized.value = true
    console.log('Canvas симуляция инициализирована:', { width, height })
  }

  const updateBubbles = (bubbles: Bubble[]) => {
    if (!simulation || !ctx) return

    // Сохраняем позиции существующих пузырей
    nodes.forEach(node => {
      savedPositions.set(node.id, {
        x: node.x,
        y: node.y,
        vx: node.vx || 0,
        vy: node.vy || 0
      })
    })

    // Создаем новые узлы (с восстановлением позиций)
    nodes = createNodes(bubbles)
    simulation.nodes(nodes)

    // Перезапускаем симуляцию
    simulation.alpha(0.5).restart()

    console.log('Пузыри обновлены:', nodes.length)
  }

  // Удаление пузыря по ID
  const removeBubble = (bubbleId: string) => {
    const index = nodes.findIndex(node => node.id === bubbleId)
    if (index !== -1) {
      nodes.splice(index, 1)
      if (simulation) {
        simulation.nodes(nodes)
        simulation.alpha(0.3).restart()
      }
      console.log('Пузырь удален:', bubbleId)
    }
  }

  // Обработчик события удаления пузыря при нажатии "Продолжить"
  const handleBubbleContinue = async (event: Event) => {
    const customEvent = event as CustomEvent
    const { bubbleId } = customEvent.detail
    console.log('🫧 Исследуем пузырь:', bubbleId)
    
    // Находим пузырь
    const bubble = nodes.find(node => node.id === bubbleId)
    if (!bubble) {
      console.warn('Пузырь не найден:', bubbleId)
      return
    }
    
    // Начисляем опыт в зависимости от уровня экспертизы
    let leveledUp = false
    if (bubble.isEasterEgg) {
      leveledUp = await sessionStore.gainXP(GAME_CONFIG.XP_PER_EASTER_EGG)
    } else {
      leveledUp = await sessionStore.gainBubbleXP(bubble.skillLevel)
    }
    
    // Показываем Level Up модал если уровень повысился
    if (leveledUp) {
      modalStore.openLevelUpModal(sessionStore.currentLevel)
    }
    
    // Отмечаем пузырь как посещенный
    await sessionStore.visitBubble(bubble.id)
    bubble.isVisited = true
    
    // Создаем мощный взрыв пузыря и сразу удаляем
    explodeBubble(bubble)
    
    // Удаляем пузырь сразу - резкий эффект
    setTimeout(() => {
      removeBubble(bubbleId)
    }, 50) // Минимальная задержка для применения физики
  }

  const destroySimulation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = 0
    }
    
    if (restartInterval) {
      clearInterval(restartInterval)
      restartInterval = 0
    }
    
    if (simulation) {
      simulation.stop()
      simulation = null
    }
    
    // Удаляем слушатель события
    window.removeEventListener('bubble-continue', handleBubbleContinue)
    
    nodes = []
    savedPositions.clear()
    isInitialized.value = false
    console.log('Canvas симуляция остановлена')
  }

  // Обновление размеров симуляции при ресайзе окна
  const updateSimulationSize = (newWidth: number, newHeight: number) => {
    if (!simulation) return
    
    width = newWidth
    height = newHeight
    
    // Обновляем центральные силы с новыми размерами
    simulation
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.005))
      .force('attract', d3.forceRadial(0, width / 2, height / 2).strength(0.005))
    
    // Пересчитываем адаптивные размеры пузырей для нового экрана
    const currentBubbles = nodes.map(node => ({
      id: node.id,
      name: node.name,
      category: node.category,
      skillLevel: node.skillLevel,
      yearStarted: node.yearStarted,
      yearEnded: node.yearEnded,
      description: node.description,
      isActive: node.isActive,
      isEasterEgg: node.isEasterEgg,
      position: node.position,
      projects: node.projects,
      size: node.size,
      color: node.color
    }))
    
    // Пересоздаем узлы с новыми размерами (сохраняя позиции)
    const updatedNodes = createNodes(currentBubbles)
    
    // Обновляем существующие узлы с новыми размерами, сохраняя позиции
    nodes.forEach((node, index) => {
      if (updatedNodes[index]) {
        // Сохраняем текущие позиции
        const currentX = node.x
        const currentY = node.y
        const currentVx = node.vx || 0
        const currentVy = node.vy || 0
        
        // Обновляем размеры
        node.baseRadius = updatedNodes[index].baseRadius
        node.targetRadius = updatedNodes[index].baseRadius
        node.currentRadius = updatedNodes[index].baseRadius
        node.textLines = updatedNodes[index].textLines
        
        // Корректируем позиции если они выходят за новые границы
        const padding = node.baseRadius + 5
        node.x = Math.max(padding, Math.min(width - padding, currentX))
        node.y = Math.max(padding, Math.min(height - padding, currentY))
        node.vx = currentVx
        node.vy = currentVy
        
        // Обновляем сохраненные позиции
        savedPositions.set(node.id, {
          x: node.x,
          y: node.y,
          vx: node.vx,
          vy: node.vy
        })
      }
    })
    
    // Обновляем collision detection с новыми радиусами
    simulation.force('collision', d3.forceCollide<SimulationNode>().radius(d => d.currentRadius + 8).strength(0.8))
    
    // Мягкий перезапуск симуляции
    simulation.alpha(0.3).restart()
    
    console.log('Симуляция обновлена для новых размеров:', { width, height, bubbles: nodes.length })
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