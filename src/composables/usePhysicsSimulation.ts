import { ref } from 'vue'
import * as d3 from 'd3'
import type { BubbleNode } from '@/types/canvas'

export function usePhysicsSimulation() {
  let simulation: d3.Simulation<BubbleNode, undefined> | null = null
  let restartInterval: number = 0

  // Инициализация симуляции
  const initSimulation = (width: number, height: number): d3.Simulation<BubbleNode, undefined> => {
    // Высота HUD панели (примерно 80px с отступами)
    const hudHeight = 80
    const effectiveHeight = height - hudHeight
    const centerY = (effectiveHeight / 2) + hudHeight
    
    // Инициализируем симуляцию с улучшенной физикой для импульсов
    simulation = d3.forceSimulation<BubbleNode>()
      .force('center', d3.forceCenter(width / 2, centerY).strength(0.003)) // Уменьшили силу центра
      .force('collision', d3.forceCollide<BubbleNode>().radius(d => d.currentRadius + 3).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-8)) // Уменьшили отталкивание
      .force('attract', d3.forceRadial(0, width / 2, centerY).strength(0.002)) // Уменьшили притяжение к центру
      .alpha(0.3)
      .alphaDecay(0) // Бесконечное движение
      .velocityDecay(0.85) // Увеличили затухание для более плавного движения и лучшей инерции

    // Принудительно поддерживаем симуляцию
    restartInterval = window.setInterval(() => {
      if (simulation && simulation.alpha() < 0.1) {
        simulation.alpha(0.3).restart()
      }
    }, 3000)

    return simulation
  }

  // Обновление размеров симуляции при ресайзе окна
  const updateSimulationSize = (newWidth: number, newHeight: number) => {
    if (!simulation) return

    // Высота HUD панели (примерно 80px с отступами)
    const hudHeight = 80
    const effectiveHeight = newHeight - hudHeight

    // Обновляем центральную силу с учетом HUD
    simulation
      .force('center', d3.forceCenter(newWidth / 2, (effectiveHeight / 2) + hudHeight))
      .alpha(0.3)
      .restart()
  }

  // Обновление узлов симуляции
  const updateNodes = (nodes: BubbleNode[]) => {
    if (!simulation) return
    simulation.nodes(nodes)
    simulation.alpha(0.5).restart()
  }

  // Импульсное отталкивание соседей при ховере с улучшенной инерцией
  const pushNeighbors = (centerBubble: BubbleNode, pushRadius: number, pushStrength: number, nodes: BubbleNode[]) => {
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
        
        // Возвращаем более сильное отталкивание, но улучшаем обработку скорости
        const force = pushStrength * (1 - distance / pushRadius) * 3
        
        // Применяем импульс к скорости более мягко для лучшей инерции
        const currentVx = bubble.vx || 0
        const currentVy = bubble.vy || 0
        
        // Добавляем к существующей скорости, а не заменяем её
        bubble.vx = currentVx + normalizedDx * force
        bubble.vy = currentVy + normalizedDy * force
        
        // Также немного сдвигаем позицию для мгновенного эффекта
        bubble.x += normalizedDx * force * 0.5
        bubble.y += normalizedDy * force * 0.5
        
        // Более мягкое ограничение максимальной скорости для сохранения инерции
        const maxVelocity = 15 // Возвращаем более высокую скорость
        const currentVelocity = Math.sqrt(bubble.vx ** 2 + bubble.vy ** 2)
        if (currentVelocity > maxVelocity) {
          const scale = maxVelocity / currentVelocity
          bubble.vx = bubble.vx * scale
          bubble.vy = bubble.vy * scale
        }
        
        affectedCount++
      }
    })
    
    // Перезапускаем симуляцию для хорошего отклика
    if (simulation && affectedCount > 0) {
      simulation.alpha(0.5).restart()
    }
  }

  // Отталкивание от точки клика как от стены (взрыв)
  const explodeFromPoint = (clickX: number, clickY: number, explosionRadius: number, explosionStrength: number, nodes: BubbleNode[], width: number, height: number) => {
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
    
    // Сильно перезапускаем симуляцию для драматичного эффекта
    if (simulation && affectedCount > 0) {
      simulation.alpha(0.8).restart()
    }
  }

  // Остановка симуляции
  const stopSimulation = () => {
    if (restartInterval) {
      clearInterval(restartInterval)
      restartInterval = 0
    }
    
    if (simulation) {
      simulation.stop()
      simulation = null
    }
  }

  return {
    initSimulation,
    updateSimulationSize,
    updateNodes,
    pushNeighbors,
    explodeFromPoint,
    stopSimulation,
    getSimulation: () => simulation
  }
} 