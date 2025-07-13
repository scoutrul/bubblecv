import { ref } from 'vue'
import type { ExplosionEffect, FloatingText, ShakeConfig, BubbleNode } from '@/types/canvas'

import { hexToRgb } from '../utils/ui'

export function useCanvasEffects() {
  // Массивы эффектов
  const explosionEffects = ref<ExplosionEffect[]>([])
  const floatingTexts = ref<FloatingText[]>([])

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

  // Отрисовка эффектов взрыва
  const drawExplosionEffects = (context: CanvasRenderingContext2D) => {
    const currentTime = Date.now()
    
    // Обновляем и отрисовываем каждый эффект взрыва
    explosionEffects.value = explosionEffects.value.filter(effect => {
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

  // Отрисовка зоны воздействия при ховере
  const drawHoverEffect = (context: CanvasRenderingContext2D, bubble: BubbleNode) => {
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

  // Взрыв пузыря с эффектом
  const explodeBubble = (bubble: BubbleNode) => {
    if (!bubble || bubble.isPopped) return
    
    // Помечаем пузырь как лопнутый
    bubble.isPopped = true
    
    // Создаем эффект взрыва с явным указанием координат и радиуса
    if (bubble.x !== undefined && bubble.y !== undefined && bubble.currentRadius !== undefined) {
      createExplosionEffect(bubble.x, bubble.y, bubble.currentRadius)
    }
  }

  // Очистка всех эффектов
  const clearAllEffects = () => {
    explosionEffects.value = []
    floatingTexts.value = []
    shakeConfig.isShaking = false
  }

  return {
    // Эффекты
    createExplosionEffect,
    createXPFloatingText,
    createLifeLossFloatingText,
    explodeBubble,
    
    // Тряска
    startShake,
    calculateShakeOffset,
    
    // Отрисовка
    drawExplosionEffects,
    drawFloatingTexts,
    drawHoverEffect,
    
    // Управление
    clearAllEffects,
    
    // Геттеры
    getExplosionEffects: () => explosionEffects.value,
    getFloatingTexts: () => floatingTexts.value
  }
} 