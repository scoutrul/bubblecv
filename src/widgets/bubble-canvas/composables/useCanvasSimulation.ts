import { ref, type Ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import type { Bubble } from '../../../shared/types'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import { useSessionStore } from '../../../entities/user-session/model/session-store'
import { useModalStore } from '../../../shared/stores/modal-store'
import { useBubbleStore } from '@entities/bubble/model/bubble-store'
import { useGameStore } from '@features/gamification/model/game-store'
import philosophyQuestions from '@shared/data/philosophyQuestions.json'

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
  textScaleFactor?: number
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
  const gameStore = useGameStore()
  const bubbleStore = useBubbleStore()
  
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

  // Умная обрезка текста на несколько строк с адаптивным размером
  const wrapText = (text: string, radius: number, skillLevel: string): { lines: string[], scaleFactor: number } => {
    // Добавляем отступы по краям (20% от радиуса с каждой стороны)
    const padding = radius * 0.2
    const maxWidth = (radius * 2 - padding * 2) * 0.8

    // Базовый масштаб в зависимости от уровня навыка
    let baseScale = 1.0
    if (skillLevel === 'novice') baseScale = 0.85
    else if (skillLevel === 'intermediate') baseScale = 0.9
    
    // Дополнительное уменьшение масштаба для длинных слов
    const longestWord = text.split(' ').reduce((max, word) => 
      word.length > max.length ? word : max
    , '')
    
    // Если самое длинное слово больше 8 символов, начинаем уменьшать масштаб
    const longWordScale = longestWord.length > 8 
      ? Math.max(0.7, 1 - (longestWord.length - 8) * 0.05)
      : 1.0
    
    // Итоговый масштаб
    const scaleFactor = baseScale * longWordScale
    
    // Пересчитываем максимальное количество символов с учетом масштаба
    const maxCharsPerLine = Math.max(4, Math.floor(maxWidth / (8 * scaleFactor)))
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
          // Если слово длиннее максимальной длины строки, разбиваем его
          const chunks = word.match(new RegExp(`.{1,${maxCharsPerLine}}`, 'g')) || []
          chunks.forEach((chunk, i) => {
            if (i < chunks.length - 1) {
              lines.push(chunk + '-')
            } else {
              currentLine = chunk
            }
          })
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    // Максимум 3 строки
    if (lines.length > 3) {
      lines[2] = lines[2].slice(0, -3) + '...'
      return { lines: lines.slice(0, 3), scaleFactor }
    }
    
    return { lines, scaleFactor }
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
      
      // Определяем цвет пузыря на основе уровня экспертизы
      let bubbleColor: string
      if (bubble.isEasterEgg) {
        // Для философских пузырей берем основной цвет из конфига
        bubbleColor = GAME_CONFIG.PHILOSOPHY_BUBBLE.gradientColors[0]
      } else {
        // Для обычных пузырей используем цвет из уровня экспертизы
        bubbleColor = expertiseConfig.color
      }
      
      // Восстанавливаем сохраненные позиции
      const savedPos = savedPositions.get(bubble.id)
      
      const node: SimulationNode = {
        ...bubble,
        radius: baseRadius,
        baseRadius,
        color: bubbleColor,
        oscillationPhase: Math.random() * Math.PI * 2,
        targetRadius: baseRadius,
        currentRadius: baseRadius,
        x: savedPos?.x ?? Math.random() * width,
        y: savedPos?.y ?? Math.random() * height,
        vx: savedPos?.vx ?? 0,
        vy: savedPos?.vy ?? 0
      }

      // Подготавливаем текст для отображения
      const textResult = wrapText(bubble.name, baseRadius, bubble.skillLevel)
      node.textLines = textResult.lines
      node.textScaleFactor = textResult.scaleFactor

      return node
    })
  }

  // Отрисовка реалистичного пузыря с градацией по уровню экспертизы
  const drawBubble = (context: CanvasRenderingContext2D, bubble: SimulationNode) => {
    // Не отрисовываем скрытые пузыри
    if (bubble.isHidden) {
      return
    }
    
    context.save()
    
    // Позиция и размер пузыря
    const x = bubble.x
    const y = bubble.y
    const radius = bubble.currentRadius
    
    // Особая отрисовка для философских пузырей
    if (bubble.isEasterEgg) {
      const philosophyConfig = GAME_CONFIG.PHILOSOPHY_BUBBLE
      
      if (philosophyConfig.hasGradient && philosophyConfig.gradientColors) {
        // Создаем радиальный градиент для философского пузыря
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
        
        // Добавляем цвета градиента из конфига
        philosophyConfig.gradientColors.forEach((color, index) => {
          const stop = index / (philosophyConfig.gradientColors.length - 1)
          gradient.addColorStop(stop, color)
        })
        
        context.fillStyle = gradient
      } else {
        context.fillStyle = bubble.color
      }
      
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    } else {
      // Отрисовка для обычных пузырей с поддержкой градиентов
      const expertiseConfig = GAME_CONFIG.EXPERTISE_LEVELS[bubble.skillLevel]
      
             if ('hasGradient' in expertiseConfig && expertiseConfig.hasGradient && 
           'gradientColors' in expertiseConfig && expertiseConfig.gradientColors) {
         // Создаем радиальный градиент
         const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
         
         // Добавляем цвета градиента из конфига
         expertiseConfig.gradientColors.forEach((color: string, index: number) => {
           const stop = index / (expertiseConfig.gradientColors!.length - 1)
           gradient.addColorStop(stop, color)
         })
         
         context.fillStyle = gradient
      } else {
        // Обычная отрисовка одним цветом
        context.fillStyle = bubble.color
      }
      
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }
    
    // Убираем обводку с крепких пузырей по просьбе пользователя
    
    context.restore()
  }

  // Отрисовка текста с адаптивным размером
  const drawText = (context: CanvasRenderingContext2D, bubble: SimulationNode) => {
    // Не отображаем текст для философских и скрытых пузырей
    if (bubble.isEasterEgg || bubble.isHidden) {
      return
    }
    
    if (!bubble.textLines) {
      // Если текстовые строки не заданы, создаем их с учетом масштаба
      const { lines, scaleFactor } = wrapText(bubble.name, bubble.baseRadius, bubble.skillLevel)
      bubble.textLines = lines
      bubble.textScaleFactor = scaleFactor
    }
    
    context.save()
    
    // Используем baseRadius вместо currentRadius для стабильности
    const expertiseConfig = GAME_CONFIG.EXPERTISE_LEVELS[bubble.skillLevel]
    const sizeMultiplier = expertiseConfig.sizeMultiplier
    
    // Ограничиваем минимальный и максимальный размер шрифта
    const minFontSize = 9
    const maxFontSize = 16
    const baseFontSize = Math.max(minFontSize, 
      Math.min(bubble.baseRadius * 0.35, maxFontSize)
    )
    
    // Применяем масштаб текста
    const scaleFactor = bubble.textScaleFactor || 1
    const fontSize = Math.floor(baseFontSize * sizeMultiplier * scaleFactor)
    
    context.font = `${fontSize}px Inter, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = 'white'
    context.globalAlpha = bubble.isVisited ? 0.4 : 1
    
    const lineHeight = fontSize * 1.2
    const totalHeight = bubble.textLines.length * lineHeight
    const startY = bubble.y - totalHeight / 2 + lineHeight / 2
    
    // Добавляем тень для лучшей читаемости
    context.shadowColor = 'rgba(0, 0, 0, 0.3)'
    context.shadowBlur = 3
    context.shadowOffsetX = 0
    context.shadowOffsetY = 1
    
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
        
        // Убрали эффект пульсации после очистки конфигурации
        
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
        bubble.textLines = wrapText(bubble.name, bubble.currentRadius, bubble.skillLevel).lines
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

  // Параметры тряски
  const shakeConfig = {
    duration: 500, // Длительность тряски в мс
    intensity: 8,  // Максимальная амплитуда тряски в пикселях
    startTime: 0,  // Время начала тряски
    isShaking: false // Флаг активной тряски
  }

  // Функция для расчета смещения тряски
  const calculateShakeOffset = (): { x: number, y: number } => {
    if (!shakeConfig.isShaking) return { x: 0, y: 0 }
    
    const elapsed = Date.now() - shakeConfig.startTime
    if (elapsed >= shakeConfig.duration) {
      shakeConfig.isShaking = false
      return { x: 0, y: 0 }
    }
    
    // Уменьшаем интенсивность со временем
    const progress = elapsed / shakeConfig.duration
    const decay = (1 - progress) ** 2 // Квадратичное затухание
    
    // Случайное смещение с затуханием
    const angle = Math.random() * Math.PI * 2
    const intensity = shakeConfig.intensity * decay
    
    return {
      x: Math.cos(angle) * intensity,
      y: Math.sin(angle) * intensity
    }
  }

  // Обновление размеров симуляции при ресайзе окна
  const updateSimulationSize = (newWidth: number, newHeight: number) => {
    if (!simulation || !ctx) return

    width = newWidth
    height = newHeight
    
    // Высота HUD панели (примерно 80px с отступами)
    const hudHeight = 80
    const effectiveHeight = height - hudHeight

    // Обновляем центральную силу с учетом HUD
    simulation
      .force('center', d3.forceCenter(width / 2, (effectiveHeight / 2) + hudHeight))
      .alpha(0.3)
      .restart()

    console.log('Размеры симуляции обновлены:', { width, height, effectiveHeight, hudHeight })
  }

  // Отрисовка всего канваса
  const render = () => {
    const context = canvasRef.value?.getContext('2d')
    if (!context) return

    // Очищаем канвас
    context.clearRect(0, 0, width, height)
    
    // Получаем смещение тряски
    const shakeOffset = calculateShakeOffset()
    
    // Применяем тряску ко всему канвасу
    context.save()
    context.translate(shakeOffset.x, shakeOffset.y)

    // Сначала отрисовываем не-ховер пузыри
    nodes.forEach(bubble => {
      if (!bubble.isHovered) {
        drawBubble(context, bubble)
        drawText(context, bubble)
      }
    })

    // Затем отрисовываем пузырь под ховером поверх остальных
    nodes.forEach(bubble => {
      if (bubble.isHovered) {
        // Добавляем небольшой сдвиг наверх при ховере
        context.save()
        context.translate(0, -2)
        
        drawBubble(context, bubble)
        drawText(context, bubble)
        drawHoverEffect(context, bubble)
        
        context.restore()
      }
    })

    // Отрисовываем плавающие XP тексты поверх всего
    drawFloatingTexts(context)

    context.restore()
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

  // Обновляем функцию explodeBubble
  const explodeBubble = (bubble: SimulationNode) => {
    // Запускаем тряску
    shakeConfig.startTime = Date.now()
    shakeConfig.isShaking = true

    // Отталкиваем соседние пузыри
    const explosionRadius = bubble.currentRadius * 4
    const explosionStrength = 20
    explodeFromPoint(bubble.x, bubble.y, explosionRadius, explosionStrength)

    // Сохраняем позиции всех пузырей
    nodes.forEach(node => {
      savedPositions.set(node.id, {
        x: node.x,
        y: node.y,
        vx: node.vx || 0,
        vy: node.vy || 0
      })
    })

    // Удаляем взорванный пузырь
    const index = nodes.findIndex(node => node.id === bubble.id)
    if (index !== -1) {
      nodes.splice(index, 1)
    }
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
      
      // Обработка крепких пузырей
      if (clickedBubble.isTough) {
        const result = bubbleStore.incrementToughBubbleClicks(clickedBubble.id)
        
        // Показываем +1 XP за каждый клик
        createXPFloatingText(clickedBubble.x, clickedBubble.y, 1, '#fbbf24')
        await sessionStore.gainXP(1)
        
        if (!result.isReady) {
          console.log(`💪 Крепкий пузырь: ${result.clicksLeft} кликов осталось`)
          
          // Анимация клика для крепкого пузыря
          const originalRadius = clickedBubble.targetRadius
          clickedBubble.targetRadius = originalRadius * 0.95
          setTimeout(() => {
            clickedBubble.targetRadius = originalRadius * 1.1
            setTimeout(() => {
              clickedBubble.targetRadius = originalRadius
            }, 100)
          }, 50)
          
          return // Не открываем модал пока пузырь не готов
        } else {
          console.log('💪 Крепкий пузырь разрушен! Получен бонус XP:', result.bonusXP)
          
          // Разблокируем достижение за первый крепкий пузырь
          await sessionStore.unlockFirstToughBubbleAchievement()
          
          // Пузырь готов - продолжаем обычную логику открытия модалки
        }
      }
      
      // Специальная обработка для скрытого пузыря
      if (clickedBubble.isHidden) {
        console.log('🕵️ Найден секретный пузырь!')
        
        // Отмечаем пузырь как посещенный
        clickedBubble.isVisited = true
        await sessionStore.visitBubble(clickedBubble.id)
        
        // Создаем мощный эффект взрыва
        const explosionRadius = clickedBubble.baseRadius * 8
        const explosionStrength = 25
        explodeFromPoint(clickedBubble.x, clickedBubble.y, explosionRadius, explosionStrength)
        
        // Начисляем XP за секретный пузырь
        const secretXP = 10
        await sessionStore.gainXP(secretXP)
        createXPFloatingText(clickedBubble.x, clickedBubble.y, secretXP, '#FFD700') // Золотой цвет для секретного XP
        
        // Разблокируем достижение
        const achievement = gameStore.unlockAchievement('secret-bubble-discoverer')
        if (achievement) {
          modalStore.openAchievementModal({
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward
          })
        }
        
        // Удаляем пузырь со сцены
        removeBubble(clickedBubble.id)
        
        return
      }
      
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
        modalStore.openPhilosophyModal(philosophyQuestion, clickedBubble.id)
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
    
    // Высота HUD панели (примерно 80px с отступами)
    const hudHeight = 80
    const effectiveHeight = height - hudHeight
    const centerY = (effectiveHeight / 2) + hudHeight
    
    // Инициализируем симуляцию с улучшенной физикой для импульсов
    simulation = d3.forceSimulation<SimulationNode>()
      .force('center', d3.forceCenter(width / 2, centerY).strength(0.005))
      .force('collision', d3.forceCollide<SimulationNode>().radius(d => d.currentRadius + 8).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-12))
      .force('attract', d3.forceRadial(0, width / 2, centerY).strength(0.003))
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
    console.log('Canvas симуляция инициализирована:', { width, height, effectiveHeight, hudHeight, centerY })
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
    const { bubbleId, isPhilosophyNegative } = customEvent.detail
    console.log('🫧 Исследуем пузырь:', bubbleId)
    
    // Находим пузырь
    const bubble = nodes.find(node => node.id === bubbleId)
    if (!bubble) {
      console.warn('❌ Пузырь не найден:', bubbleId)
      return
    }
    
    console.log('🔍 Найден пузырь:', {
      id: bubble.id,
      skillLevel: bubble.skillLevel,
      isEasterEgg: bubble.isEasterEgg,
      isPhilosophyNegative
    })
    
    // Начисляем опыт в зависимости от уровня экспертизы
    let leveledUp = false
    let xpGained = 0
    
    if (bubble.isEasterEgg) {
      console.log('🎯 Это философский пузырь (Easter Egg)')
      if (isPhilosophyNegative) {
        // Отрицательный ответ на философский вопрос - показываем потерю жизни
        createLifeLossFloatingText(bubble.x, bubble.y)
        console.log('💔 Philosophy negative: showing life loss animation')
      } else {
        // Положительный ответ - обычный XP (зеленый цвет)
        xpGained = GAME_CONFIG.XP_PER_EASTER_EGG
        console.log('💰 Начисляем XP за философский пузырь:', xpGained)
        leveledUp = await sessionStore.gainXP(xpGained)
        createXPFloatingText(bubble.x, bubble.y, xpGained, '#22c55e')
        console.log('✨ Philosophy positive: showing XP gain animation')
      }
    } else {
      console.log('🎯 Это обычный пузырь')
      const expertiseLevel = bubble.skillLevel as keyof typeof GAME_CONFIG.XP_PER_EXPERTISE_LEVEL
      const xpConfig = GAME_CONFIG.XP_PER_EXPERTISE_LEVEL[expertiseLevel]
      xpGained = xpConfig || 1
      
      console.log('💰 Начисляем XP за обычный пузырь:', {
        expertiseLevel,
        xpConfig,
        xpGained
      })
      
      leveledUp = await sessionStore.gainBubbleXP(expertiseLevel)
      
      // Создаём визуальный эффект получения XP при исчезновении (зеленый цвет)
      if (xpGained > 0) {
        createXPFloatingText(bubble.x, bubble.y, xpGained, '#22c55e')
        console.log('✨ Показываем анимацию получения XP:', xpGained)
      }
    }

    console.log('📊 Результат начисления XP:', {
      bubbleId,
      xpGained,
      leveledUp,
      currentXP: sessionStore.currentXP,
      currentLevel: sessionStore.currentLevel
    })

    // Показываем Level Up модал если уровень повысился
    if (leveledUp) {
      console.log('🎉 LEVEL UP! Показываем модал для уровня:', sessionStore.currentLevel)
      
      // Получаем иконку для уровня (такую же как в LevelDisplay)
      const getLevelIcon = (level: number): string => {
        switch (level) {
          case 1: return '👋'
          case 2: return '🤔'
          case 3: return '📚'
          case 4: return '🤝'
          case 5: return '🤜🤛'
          default: return '⭐'
        }
      }
      
      // Получаем данные нового уровня из contentLevels
      const levelData = gameStore.getLevelByNumber(sessionStore.currentLevel)
      const levelUpData = {
        level: sessionStore.currentLevel,
        title: levelData?.title || `Уровень ${sessionStore.currentLevel}`,
        description: levelData?.description || 'Новый уровень разблокирован!',
        icon: getLevelIcon(sessionStore.currentLevel),
        currentXP: sessionStore.currentXP,
        xpGained,
        unlockedFeatures: (levelData as any)?.unlockedFeatures || []
      }
      
      modalStore.openLevelUpModal(sessionStore.currentLevel, levelUpData)
    }
    
    // Отмечаем пузырь как посещенный
    console.log('✅ Отмечаем пузырь как посещенный:', bubbleId)
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

  // Эффекты плавающего текста XP и жизней
  interface FloatingText {
    x: number
    y: number
    text: string
    opacity: number
    startTime: number
    duration: number
    color: string
    type: 'xp' | 'life' // тип анимации
  }

  const floatingTexts: FloatingText[] = []

  // Создание эффекта плавающего текста при получении XP
  const createXPFloatingText = (x: number, y: number, xpAmount: number, bubbleColor: string = '#667eea') => {
    floatingTexts.push({
      x,
      y,
      text: `+${xpAmount} XP`,
      opacity: 1,
      startTime: Date.now(),
      duration: 2000, // 2 секунды
      color: bubbleColor,
      type: 'xp'
    })
  }

  // Создание эффекта плавающего текста при потере жизни
  const createLifeLossFloatingText = (x: number, y: number) => {
    floatingTexts.push({
      x,
      y,
      text: '-❤️',
      opacity: 1,
      startTime: Date.now(),
      duration: 2000, // 2 секунды
      color: '#ef4444', // Красный цвет для потери жизни
      type: 'life'
    })
  }

  // Отрисовка плавающих текстов XP и жизней
  const drawFloatingTexts = (context: CanvasRenderingContext2D) => {
    const currentTime = Date.now()
    
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const text = floatingTexts[i]
      const elapsed = currentTime - text.startTime
      const progress = elapsed / text.duration
      
      if (progress >= 1) {
        floatingTexts.splice(i, 1)
        continue
      }
      
      // Анимация зависит от типа
      let yOffset: number
      if (text.type === 'life') {
        // Жизни падают вниз
        yOffset = progress * 40 // Движение на 40px вниз
      } else {
        // XP поднимается вверх
        yOffset = -(progress * 40) // Движение на 40px вверх
      }
      
      const opacity = 1 - progress // Линейное затухание
      
      // Преобразуем hex цвет в rgb для использования с alpha
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 102, g: 126, b: 234 }
      }
      
      const rgb = hexToRgb(text.color)
      
      context.save()
      context.font = text.type === 'life' ? 'bold 20px Inter, sans-serif' : 'bold 16px Inter, sans-serif'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
      
      // Убираем обводку для XP текста, оставляем только для потери жизни
      if (text.type === 'life') {
        context.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`
        context.lineWidth = 2
        context.strokeText(text.text, text.x, text.y + yOffset)
      }
      
      context.fillText(text.text, text.x, text.y + yOffset)
      
      context.restore()
    }
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