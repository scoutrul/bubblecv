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

export function useCanvasRenderer(canvasRef: Ref<HTMLCanvasElement | null>) {
  const centerStars: Ref<Star[]> = ref([])
  const bgStars: Ref<Star[]> = ref([])
  const fgStars: Ref<Star[]> = ref([])
  
  // Сохраняем предыдущие размеры canvas для правильного ресайза
  let previousWidth = 0
  let previousHeight = 0

  // Инициализация звездного поля
  const initStarfield = (width: number, height: number) => {
    // Сохраняем размеры
    previousWidth = width
    previousHeight = height
    
    // Центральный, вращающийся слой
    const centerStarArray: Star[] = []
    const canvasCenter = { x: width / 2, y: height / 2 }
    
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2
      const orbitRadius = Math.random() * (Math.max(width, height) * 0.4) + 50 // Радиус орбиты относительно максимальной стороны
      
      centerStarArray.push({
        x: canvasCenter.x + Math.cos(angle) * orbitRadius,
        y: canvasCenter.y + Math.sin(angle) * orbitRadius,
        radius: Math.random() * 1 + 0.3, // Мелкие звезды
        opacity: Math.random() * 0.3 + 0.1, // Тусклые (0.1 - 0.4)
        angle,
        orbitRadius,
        centerX: canvasCenter.x, // Центр всегда в середине канваса
        centerY: canvasCenter.y,
        speed: (Math.random() * 0.0005) // Медленное вращение
      })
    }
    centerStars.value = centerStarArray
    centerStars.value.forEach(star => {
      gsap.to(star, {
        opacity: Math.random() * 0.3 + 0.1,
        duration: Math.random() * 4 + 3,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
      })
    })

    // Задний, статичный слой
    const bgStarArray: Star[] = []
    for (let i = 0; i < 70; i++) { // Больше тусклых звезд
      const centerX = Math.random() * width
      const centerY = Math.random() * height
      const orbitRadius = Math.random() * 100 + 20
      const angle = Math.random() * Math.PI * 2
      
      bgStarArray.push({
        x: centerX + Math.cos(angle) * orbitRadius,
        y: centerY + Math.sin(angle) * orbitRadius,
        radius: Math.random() * 1.2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1, // (0.1 - 0.5)
        angle,
        orbitRadius,
        centerX,
        centerY,
        speed: (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1) // Случайное направление
      })
    }
    bgStars.value = bgStarArray
    bgStars.value.forEach(star => {
      gsap.to(star, {
        opacity: Math.random() * 0.5,
        duration: Math.random() * 3 + 2,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
      })
    })

    // Передний, подвижный слой
    const fgStarArray: Star[] = []
    for (let i = 0; i < 30; i++) { // Меньше ярких звезд
      const centerX = Math.random() * width
      const centerY = Math.random() * height
      const orbitRadius = Math.random() * 150 + 30
      const angle = Math.random() * Math.PI * 2
      
      fgStarArray.push({
        x: centerX + Math.cos(angle) * orbitRadius,
        y: centerY + Math.sin(angle) * orbitRadius,
        radius: Math.random() * 1.6 + 0.8, // Крупнее
        opacity: Math.random() * 0.6 + 0.4, // Ярче (0.4 - 1.0)
        angle,
        orbitRadius,
        centerX,
        centerY,
        speed: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1) // Быстрее и случайное направление
      })
    }
    fgStars.value = fgStarArray
    fgStars.value.forEach(star => {
      gsap.to(star, {
        opacity: 0.1,
        duration: Math.random() * 1.5 + 0.8,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
      })
    })
  }
  
  // Обновление размеров звездного поля при ресайзе
  const updateStarfieldSize = (width: number, height: number) => {
    // Обновляем центральные позиции для центрального слоя звезд
    const canvasCenter = { x: width / 2, y: height / 2 }
    
    // Вычисляем коэффициент масштабирования для радиусов орбит
    const previousMaxSize = Math.max(previousWidth, previousHeight)
    const currentMaxSize = Math.max(width, height)
    const scaleRatio = previousMaxSize > 0 ? currentMaxSize / previousMaxSize : 1
    
    centerStars.value.forEach(star => {
      star.centerX = canvasCenter.x
      star.centerY = canvasCenter.y
      
      // Масштабируем радиус орбиты пропорционально изменению размера экрана
      star.orbitRadius = star.orbitRadius * scaleRatio
      
      // Пересчитываем текущую позицию звезды с новым радиусом
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
    })

    // Обновляем позиции центров орбит для bgStars - перераспределяем по новому экрану
    bgStars.value.forEach(star => {
      // Сохраняем относительную позицию центра орбиты
      const relativeX = star.centerX / previousWidth || 0.5 // fallback если нет старых размеров
      const relativeY = star.centerY / previousHeight || 0.5
      
      // Обновляем на новые размеры
      star.centerX = relativeX * width
      star.centerY = relativeY * height
      
      // Пересчитываем текущую позицию звезды
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
    })

    // Обновляем позиции центров орбит для fgStars - перераспределяем по новому экрану  
    fgStars.value.forEach(star => {
      // Сохраняем относительную позицию центра орбиты
      const relativeX = star.centerX / previousWidth || 0.5 // fallback если нет старых размеров
      const relativeY = star.centerY / previousHeight || 0.5
      
      // Обновляем на новые размеры
      star.centerX = relativeX * width
      star.centerY = relativeY * height
      
      // Пересчитываем текущую позицию звезды
      star.x = star.centerX + Math.cos(star.angle) * star.orbitRadius
      star.y = star.centerY + Math.sin(star.angle) * star.orbitRadius
    })

    // Пересоздаем звезды которые выходят за новые границы
    bgStars.value = bgStars.value.filter(star => {
      const maxDistance = Math.sqrt(star.orbitRadius * star.orbitRadius + star.orbitRadius * star.orbitRadius)
      return (star.centerX + maxDistance >= 0 && star.centerX - maxDistance <= width &&
              star.centerY + maxDistance >= 0 && star.centerY - maxDistance <= height)
    })

    fgStars.value = fgStars.value.filter(star => {
      const maxDistance = Math.sqrt(star.orbitRadius * star.orbitRadius + star.orbitRadius * star.orbitRadius)
      return (star.centerX + maxDistance >= 0 && star.centerX - maxDistance <= width &&
              star.centerY + maxDistance >= 0 && star.centerY - maxDistance <= height)
    })

    // Добавляем новые звезды если нужно покрыть новые области
    const neededBgStars = 70 - bgStars.value.length
    for (let i = 0; i < neededBgStars; i++) {
      const centerX = Math.random() * width
      const centerY = Math.random() * height
      const orbitRadius = Math.random() * 100 + 20
      const angle = Math.random() * Math.PI * 2
      
      const newStar = {
        x: centerX + Math.cos(angle) * orbitRadius,
        y: centerY + Math.sin(angle) * orbitRadius,
        radius: Math.random() * 1.2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        angle,
        orbitRadius,
        centerX,
        centerY,
        speed: (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1)
      }
      bgStars.value.push(newStar)
      
      gsap.to(newStar, {
        opacity: Math.random() * 0.5,
        duration: Math.random() * 3 + 2,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
      })
    }

    const neededFgStars = 30 - fgStars.value.length
    for (let i = 0; i < neededFgStars; i++) {
      const centerX = Math.random() * width
      const centerY = Math.random() * height
      const orbitRadius = Math.random() * 150 + 30
      const angle = Math.random() * Math.PI * 2
      
      const newStar = {
        x: centerX + Math.cos(angle) * orbitRadius,
        y: centerY + Math.sin(angle) * orbitRadius,
        radius: Math.random() * 1.6 + 0.8,
        opacity: Math.random() * 0.6 + 0.4,
        angle,
        orbitRadius,
        centerX,
        centerY,
        speed: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1)
      }
      fgStars.value.push(newStar)
      
      gsap.to(newStar, {
        opacity: 0.1,
        duration: Math.random() * 1.5 + 0.8,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
      })
    }
    
    // Сохраняем новые размеры для следующего ресайза
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
      if (hiddenConfig.gradientColors.length) {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius * hiddenConfig.sizeMultiplier)
        hiddenConfig.gradientColors.forEach((color, index) => {
          const stop = index / (hiddenConfig.gradientColors.length - 1)
          gradient.addColorStop(stop, color)
        })
        context.fillStyle = gradient
      } else {
        context.fillStyle = '#64748B11' // fallback
      }
      context.beginPath()
      context.arc(x, y, radius * hiddenConfig.sizeMultiplier, 0, Math.PI * 2)
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
    } else if (bubble.isTough) {     
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()

      context.shadowBlur = 0
      context.shadowColor = 'transparent'
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
        context.fillStyle = expertiseConfig.color
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