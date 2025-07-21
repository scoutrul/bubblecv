import { ref } from 'vue'
import type { ExplosionEffect, FloatingText, ShakeConfig, BubbleNode, DebrisParticle } from '@/types/canvas'
import { getBubbleColor } from '@/utils/bubble'
import { hexToRgb } from '@/utils/ui'

export function useCanvasEffects() {
  // Массивы эффектов
  const explosionEffects = ref<ExplosionEffect[]>([])
  const floatingTexts = ref<FloatingText[]>([])
  const debrisParticles = ref<DebrisParticle[]>([])

  // Параметры тряски
  const shakeConfig: ShakeConfig = {
    duration: 500, // Длительность тряски в мс
    intensity: 8,  // Максимальная амплитуда тряски в пикселях
    startTime: 0,  // Время начала тряски
    isShaking: false // Флаг активной тряски
  }

  // Создание эффекта взрыва
  const createExplosionEffect = (x: number, y: number, radius: number) => {
    const explosionEffect: ExplosionEffect = {
      x,
      y,
      radius: 0,
      maxRadius: radius * 2,
      opacity: 1,
      startTime: Date.now()
    }
    explosionEffects.value.push(explosionEffect)
  }

  // Создание эффекта плавающего текста при получении XP
  const createXPFloatingText = (x: number, y: number, xpAmount: number, bubbleColor: string = '#667eea') => {
    floatingTexts.value.push({
      id: Date.now() + Math.random(),
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
    floatingTexts.value.push({
      id: Date.now() + Math.random(),
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

  // Создание (осколков) при взрыве пузыря
  const createDebrisEffect = (x: number, y: number, radius: number, color: string = '#667eea') => {
    const particleCount = Math.floor(radius / 3) + 5 // Количество частиц зависит от размера пузыря
    const startTime = Date.now()

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
      const speed = Math.random() * 10 // Увеличиваем скорость для космоса
      const size = Math.random() * 10

      const particle: DebrisParticle = {
        id: Date.now() + Math.random() + i,
        x: x + Math.cos(angle) * (radius * 0.3),
        y: y + Math.sin(angle) * (radius * 0.3),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        opacity: 1,
        color,
        startTime,
        duration: Math.random() * 5000,
      }

      debrisParticles.value.push(particle)
    }
  }

  // Запуск тряски экрана
  const startShake = () => {
    shakeConfig.isShaking = true
    shakeConfig.startTime = Date.now()
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

  // Отрисовка плавающих текстов XP и жизней
  const drawFloatingTexts = (context: CanvasRenderingContext2D) => {
    const currentTime = Date.now()

    for (let i = floatingTexts.value.length - 1; i >= 0; i--) {
      const text = floatingTexts.value[i]
      const elapsed = currentTime - text.startTime
      const progress = elapsed / text.duration

      if (progress >= 1) {
        floatingTexts.value.splice(i, 1)
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

  // Отрисовка осколков
  const drawDebrisEffects = (context: CanvasRenderingContext2D, bubbles: BubbleNode[] = []) => {
    const currentTime = Date.now()

    // Обновляем и отрисовываем каждый осколок
    debrisParticles.value = debrisParticles.value.filter(particle => {
      const elapsed = currentTime - particle.startTime
      const progress = elapsed / particle.duration

      if (progress >= 1) {
        return false // Удаляем завершенные частицы
      }

      // Обновляем позицию без гравитации (космос)
      particle.x += particle.vx
      particle.y += particle.vy

      // Проверяем столкновения с пузырями
      for (const bubble of bubbles) {

        const dx = particle.x - bubble.x
        const dy = particle.y - bubble.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const collisionDistance = bubble.currentRadius + particle.size / 2

        if (distance < collisionDistance) {
          // Столкновение произошло - отскакиваем осколок
          const normalX = dx / distance
          const normalY = dy / distance

          // Вычисляем скорость отражения
          const dotProduct = particle.vx * normalX + particle.vy * normalY

          // Отражение с потерей энергии (коэффициент упругости 0.7)
          const elasticity = 0.7
          particle.vx = (particle.vx - 2 * dotProduct * normalX) * elasticity
          particle.vy = (particle.vy - 2 * dotProduct * normalY) * elasticity

          // Немного уменьшаем размер осколка при столкновении
          particle.size *= 0.9

          // Сдвигаем осколок за пределы пузыря чтобы избежать застревания
          const overlap = collisionDistance - distance + 1
          particle.x += normalX * overlap
          particle.y += normalY * overlap

          break // Обрабатываем только одно столкновение за кадр
        }
      }


      // Прозрачность убывает со временем
      particle.opacity = 1 - progress

      // Отрисовка осколка
      context.save()
      context.translate(particle.x, particle.y)

      const rgb = hexToRgb(particle.color)
      context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity})`

      // Рисуем осколок как круг
      const halfSize = particle.size / 2
      context.beginPath()
      context.arc(0, 0, halfSize, 0, Math.PI * 2)
      context.fill()

      context.restore()

      return true // Оставляем частицу
    })
  }

  // Отрисовка зоны воздействия при ховере
  const drawHoverEffect = (context: CanvasRenderingContext2D, bubble: BubbleNode) => {
    if (!bubble.isHovered) return

    context.save()

    // Создаем градиент для свечения
    const gradient = context.createRadialGradient(
      bubble.x, bubble.y, 0,
      bubble.x, bubble.y, bubble.currentRadius * 1.5
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    // Рисуем свечение
    context.beginPath()
    context.arc(bubble.x, bubble.y, bubble.currentRadius * 1.5, 0, Math.PI * 2)
    context.fillStyle = gradient
    context.fill()

    context.restore()
  }

  // Взрыв пузыря с эффектом
  const explodeBubble = (bubble: BubbleNode) => {
    if (!bubble || bubble.isPopped) return

    // Помечаем пузырь как лопнутый
    bubble.isPopped = true

    // Создаем эффект взрыва с явным указанием координат и радиуса
    if (bubble.x !== undefined && bubble.y !== undefined && bubble.currentRadius !== undefined) {
      createExplosionEffect(bubble.x, bubble.y, bubble.currentRadius)

      // Создаем крепиш (осколки) с цветом пузыря
      const bubbleColor = getBubbleColor(bubble)
      createDebrisEffect(bubble.x, bubble.y, bubble.currentRadius, bubbleColor)
    }
  }

  // Очистка всех эффектов
  const clearAllEffects = () => {
    explosionEffects.value = []
    floatingTexts.value = []
    debrisParticles.value = []
    shakeConfig.isShaking = false
  }

  return {
    // Эффекты
    createExplosionEffect,
    createXPFloatingText,
    createLifeLossFloatingText,
    createDebrisEffect,
    explodeBubble,

    // Тряска
    startShake,
    calculateShakeOffset,

    drawFloatingTexts,
    drawDebrisEffects,
    drawHoverEffect,

    // Управление
    clearAllEffects,
  }
}
