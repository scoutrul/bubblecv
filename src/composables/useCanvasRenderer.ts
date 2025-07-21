import type { Ref } from 'vue'
import { ref } from 'vue'
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

function createStars(count: number, width: number, height: number, radiusRange: [number, number], opacityRange: [number, number], orbitRadiusRange: [number, number], speedRange: [number, number], isCenter: boolean = false): Star[] {
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

function animateStars(stars: Star[], opacityRange: [number, number], durationRange: [number, number]) {
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

export function useCanvasRenderer(canvasRef: Ref<HTMLCanvasElement | null>) {
  const centerStars: Ref<Star[]> = ref([])
  const bgStars: Ref<Star[]> = ref([])
  const fgStars: Ref<Star[]> = ref([])
  
  let previousWidth = 0
  let previousHeight = 0

  const initStarfield = (width: number, height: number) => {
    previousWidth = width
    previousHeight = height
    // Центральный слой
    centerStars.value = createStars(400, width, height, [0.3, 1.3], [0.1, 0.4], [50, Math.max(width, height) * 0.4 + 50], [0, 0.0005], true)
    animateStars(centerStars.value, [0.1, 0.4], [3, 7])
    // Задний слой
    bgStars.value = createStars(70, width, height, [0.5, 1.7], [0.1, 0.5], [20, 120], [0.001, 0.003])
    animateStars(bgStars.value, [0.1, 0.5], [2, 5])
    // Передний слой
    fgStars.value = createStars(30, width, height, [0.8, 2.4], [0.4, 1.0], [30, 180], [0.001, 0.004])
    animateStars(fgStars.value, [0.1, 0.1], [0.8, 2.3])
  }

  function updateStarPositions(stars: Star[], width: number, height: number, prevWidth: number, prevHeight: number, isCenter: boolean = false) {
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

  const updateStarfieldSize = (width: number, height: number) => {
    updateStarPositions(centerStars.value, width, height, previousWidth, previousHeight, true)
    updateStarPositions(bgStars.value, width, height, previousWidth, previousHeight)
    updateStarPositions(fgStars.value, width, height, previousWidth, previousHeight)
    // Пересоздаём звёзды, выходящие за границы, и добавляем новые
    function filterAndAdd(stars: Ref<Star[]>, count: number, width: number, height: number, radiusRange: [number, number], opacityRange: [number, number], orbitRadiusRange: [number, number], speedRange: [number, number]) {
      stars.value = stars.value.filter(star => {
        const maxDistance = Math.sqrt(star.orbitRadius * star.orbitRadius + star.orbitRadius * star.orbitRadius)
        return (star.centerX + maxDistance >= 0 && star.centerX - maxDistance <= width &&
                star.centerY + maxDistance >= 0 && star.centerY - maxDistance <= height)
      })
      const needed = count - stars.value.length
      if (needed > 0) {
        const newStars = createStars(needed, width, height, radiusRange, opacityRange, orbitRadiusRange, speedRange)
        stars.value.push(...newStars)
      }
    }
    filterAndAdd(bgStars, 70, width, height, [0.5, 1.7], [0.1, 0.5], [20, 120], [0.001, 0.003])
    filterAndAdd(fgStars, 30, width, height, [0.8, 2.4], [0.4, 1.0], [30, 180], [0.001, 0.004])
    previousWidth = width
    previousHeight = height
  }
  
  // Отрисовка звездного поля
  const drawStarfield = (context: CanvasRenderingContext2D, parallaxOffset: { x: number, y: number }) => {
    // Рисуем центральный слой (вращение вокруг центра канваса)
    context.save()
    centerStars.value.forEach(star => {
      // Обновляем угол для вращения вокруг центра
      star.angle += star.speed
      
      // Рассчитываем новую позицию
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
      
      context.beginPath()
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
      context.fill()
    })
    context.restore()

    // Рисуем задний слой (без параллакса, но с орбитальным движением)
    context.save()
    bgStars.value.forEach(star => {
      // Обновляем угол для орбитального движения
      star.angle += star.speed
      
      // Рассчитываем новую позицию по орбите
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
      
      context.beginPath()
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
      context.fill()
    })
    context.restore()

    // Рисуем передний слой (с параллаксом и орбитальным движением)
    context.save()
    context.translate(parallaxOffset.x, parallaxOffset.y)
    fgStars.value.forEach(star => {
      // Обновляем угол для орбитального движения
      star.angle += star.speed
      
      // Рассчитываем новую позицию по орбите
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
      
      context.beginPath()
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
      context.fill()
    })
    context.restore()
  }

  // Отрисовка реалистичного пузыря с градацией по уровню экспертизы
  const drawBubble = (context: CanvasRenderingContext2D, bubble: BubbleNode) => {
    context.save()
    
    // Проверяем корректность координат и размера
    if (!Number.isFinite(bubble.x) || !Number.isFinite(bubble.y) || !Number.isFinite(bubble.currentRadius)) {
      console.warn('Invalid bubble coordinates or radius:', {
        id: bubble.id,
        name: bubble.name,
        x: bubble.x,
        y: bubble.y,
        radius: bubble.currentRadius,
        baseRadius: bubble.baseRadius,
        skillLevel: bubble.skillLevel,
        vx: bubble.vx,
        vy: bubble.vy
      })
      context.restore()
      return
    }
    
    // Защищаем от отрицательных значений радиуса
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
        context.fillStyle = '#64748B11' // fallback
      }
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
      context.restore()
      return
    }
    // Устанавливаем прозрачность для скрытых пузырей (legacy)
    if (bubble.isHidden) {
      context.globalAlpha = 0.1
    }
    
    // Особая отрисовка для философских пузырей
    if (bubble.isQuestion) {
      const philosophyConfig = GAME_CONFIG.questionBubble
      
      if (philosophyConfig.gradientColors.length) {
        // Создаем радиальный градиент для философского пузыря
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
        
        // Добавляем цвета градиента из конфига
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
        // Создаем радиальный градиент
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
        
        // Добавляем цвета градиента
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

  // Отрисовка текста с адаптивным размером
  const drawText = (context: CanvasRenderingContext2D, bubble: BubbleNode) => {
    // Не отображаем текст для философских и скрытых пузырей
    if (bubble.isQuestion || bubble.isHidden) {
      return
    }
    
    context.save()
    
    // Простой размер шрифта относительно размера пузыря
    const fontSize = Math.max(8, Math.min(bubble.currentRadius * 0.3, 18))
    
    context.font = `${fontSize}px Inter, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    
    // Цвет текста
    context.fillStyle = bubble.isPopped ? '#FFFFFF80' : '#FFFFFF' // Полупрозрачный для лопнувших
    
    // Добавляем тень для лучшей читаемости
    context.shadowColor = 'rgba(0, 0, 0, 0.3)'
    context.shadowBlur = 3
    context.shadowOffsetX = 0
    context.shadowOffsetY = 1
    
    // Отображаем название пузыря
    context.fillText(bubble.name, bubble.x, bubble.y)
    
    context.restore()
  }

  // Отрисовка всего канваса
  const render = (
    nodes: BubbleNode[], 
    width: number, 
    height: number,
    shakeOffset: { x: number, y: number },
    parallaxOffset: { x: number, y: number },
    drawFloatingTexts: (context: CanvasRenderingContext2D) => void,
    drawHoverEffect?: (context: CanvasRenderingContext2D, bubble: BubbleNode) => void
  ) => {
    const context = canvasRef.value?.getContext('2d')
    if (!context) return

    // Очищаем канвас
    context.clearRect(0, 0, width, height)
    
    // Рисуем фон (звезды) с эффектом параллакса
    drawStarfield(context, parallaxOffset)

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
        
        // Отрисовываем эффект ховера если функция предоставлена
        if (drawHoverEffect) {
          drawHoverEffect(context, bubble)
        }
        
        context.restore()
      }
    })

    // Отрисовываем плавающие XP тексты поверх всего
    drawFloatingTexts(context)

    context.restore()
  }

  return {
    initStarfield,
    updateStarfieldSize,
    drawBubble,
    drawText,
    render
  }
} 