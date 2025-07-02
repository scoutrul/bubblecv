import type { Ref } from 'vue'
import { ref } from 'vue'
import type { SimulationNode } from './types'
import { GAME_CONFIG } from '@shared/config/game-config'
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
  const bgStars = ref<Star[]>([])
  const fgStars = ref<Star[]>([])

  // Инициализация звездного поля
  const initStarfield = (width: number, height: number) => {
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
  
  // Отрисовка звездного поля
  const drawStarfield = (context: CanvasRenderingContext2D, parallaxOffset: { x: number, y: number }) => {
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
  const drawBubble = (context: CanvasRenderingContext2D, bubble: SimulationNode) => {
    context.save()
    
    // Особая отрисовка для скрытого пузыря
    if (bubble.bubbleType === 'hidden') {
      const hiddenConfig = GAME_CONFIG.hiddenBubble
      context.globalAlpha = hiddenConfig.opacity
      const x = bubble.x
      const y = bubble.y
      const radius = bubble.currentRadius * hiddenConfig.sizeMultiplier
      if (hiddenConfig.hasGradient && hiddenConfig.gradientColors) {
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
    
    // Позиция и размер пузыря
    const x = bubble.x
    const y = bubble.y
    const radius = bubble.currentRadius
    
    // Особая отрисовка для философских пузырей
    if (bubble.isEasterEgg) {
      const philosophyConfig = GAME_CONFIG.philosophyBubble
      
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
    } else if (bubble.isTough) {
      // Особая отрисовка для крепких пузырей
      const toughConfig = GAME_CONFIG.toughBubble
      
      // Сначала рисуем свечение
      context.shadowColor = toughConfig.glowColor
      context.shadowBlur = toughConfig.glowSize
      context.shadowOffsetX = 0
      context.shadowOffsetY = 0
      
      if (toughConfig.hasGradient && toughConfig.gradientColors) {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
        toughConfig.gradientColors.forEach((color, index) => {
          const stop = index / (toughConfig.gradientColors.length - 1)
          gradient.addColorStop(stop, color)
        })
        context.fillStyle = gradient
      } else {
        context.fillStyle = bubble.color
      }
      
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
      
      // Сбрасываем тень после отрисовки
      context.shadowColor = 'transparent'
      context.shadowBlur = 0
    } else {
      // Отрисовка для обычных пузырей с поддержкой градиентов
      const expertiseConfig = GAME_CONFIG.expertiseLevels[bubble.skillLevel]
      
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
    
    context.restore()
  }

  // Отрисовка текста с адаптивным размером
  const drawText = (context: CanvasRenderingContext2D, bubble: SimulationNode) => {
    // Не отображаем текст для философских и скрытых пузырей
    if (bubble.isEasterEgg || bubble.isHidden) {
      return
    }
    
    if (!bubble.textLines) {
      return
    }
    
    context.save()
    
    // Используем baseRadius вместо currentRadius для стабильности
    const expertiseConfig = GAME_CONFIG.expertiseLevels[bubble.skillLevel]
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

  // Отрисовка всего канваса
  const render = (
    nodes: SimulationNode[], 
    width: number, 
    height: number,
    shakeOffset: { x: number, y: number },
    parallaxOffset: { x: number, y: number },
    drawFloatingTexts: (context: CanvasRenderingContext2D) => void,
    drawHoverEffect?: (context: CanvasRenderingContext2D, bubble: SimulationNode) => void
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
    drawBubble,
    drawText,
    render
  }
} 