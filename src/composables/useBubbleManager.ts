import type { Bubble } from '@/types/data'
import { GAME_CONFIG } from '@/config'
import { SKILL_LEVELS, type SkillLevel } from '@/types/skill-levels'

import type { BubbleNode, PositionData } from '@/types/canvas'

import { isWindows } from '@/utils/ui'
import type { NormalizedBubble } from '@/types/normalized'

export const calculateAdaptiveSizes = (bubbleCount: number, width: number, height: number): { min: number, max: number } => {
  // Цель: заполнить 75% экрана пузырями
  const screenArea = width * height * 0.75
  const averageAreaPerBubble = screenArea / bubbleCount
  const averageRadius = Math.sqrt(averageAreaPerBubble / Math.PI)
  
  // Учитываем соотношение сторон экрана для более равномерного распределения
  const aspectRatio = width / height
  const aspectFactor = Math.min(1.2, Math.max(0.8, aspectRatio / 1.5))
  
  // Увеличиваем минимальный размер для лучшей читаемости
  const baseMinRadius = Math.max(25, averageRadius * 0.5 * aspectFactor) 
  const baseMaxRadius = Math.min(180, averageRadius * 1.6 * aspectFactor)
  
  // Ограничиваем размеры чтобы пузыри всегда помещались на экране
  const maxAllowedRadius = Math.min(width, height) / 8
  const minRadius = Math.min(baseMinRadius, maxAllowedRadius * 0.4) 
  const maxRadius = Math.min(baseMaxRadius, maxAllowedRadius)
  
  return { min: minRadius, max: maxRadius }
}

export function useBubbleManager() {
  // Сохранение позиций между фильтрациями
  const savedPositions = new Map<number, PositionData>()

  // Создание узлов из пузырей
  const createNodes = (bubbles: BubbleNode[], width: number, height: number): BubbleNode[] => {
    const sizes = calculateAdaptiveSizes(bubbles.length, width, height)

    return bubbles.map((bubble) => {
      const expertiseConfig = bubble.skillLevel ? GAME_CONFIG.expertiseBubbles[bubble.skillLevel] : GAME_CONFIG.expertiseBubbles[SKILL_LEVELS.INTERMEDIATE]
      
      if (!expertiseConfig) {
        const defaultConfig = GAME_CONFIG.expertiseBubbles[SKILL_LEVELS.INTERMEDIATE]
        const skillIndex = Object.keys(GAME_CONFIG.expertiseBubbles).indexOf(SKILL_LEVELS.INTERMEDIATE)

        const sizeRatio = (skillIndex + 1) / Object.keys(GAME_CONFIG.expertiseBubbles).length
        const calculatedRadius = sizes.min + (sizes.max - sizes.min) * sizeRatio
        const baseRadius = calculatedRadius * defaultConfig.sizeMultiplier
        
        const savedPos = savedPositions.get(bubble.id)
        
        const node: BubbleNode = {
          ...bubble,
          radius: baseRadius,
            baseRadius,
            oscillationPhase: Math.random() * Math.PI * 2,
            targetRadius: baseRadius,
            currentRadius: baseRadius,
            x: savedPos?.x ?? Math.random() * width,
            y: savedPos?.y ?? Math.random() * height,
            vx: savedPos?.vx ?? 0,
            vy: savedPos?.vy ?? 0
          }

          return node
        }
        
        const skillLevels = Object.keys(GAME_CONFIG.expertiseBubbles) as SkillLevel[]
        const skillIndex = skillLevels.indexOf(bubble.skillLevel as SkillLevel)
        const sizeRatio = (skillIndex + 1) / skillLevels.length
        
      // Применяем множитель размера из конфигурации
      const calculatedRadius = sizes.min + (sizes.max - sizes.min) * sizeRatio
      const baseRadius = calculatedRadius * expertiseConfig.sizeMultiplier
      
      // Обертываем текст
      const savedPos = savedPositions.get(bubble.id)
      
      const node: BubbleNode = {
        ...bubble,
        radius: baseRadius,
        baseRadius,
        oscillationPhase: Math.random() * Math.PI * 2,
        targetRadius: baseRadius,
        currentRadius: baseRadius,
        x: savedPos ? savedPos.x : Math.random() * width,
        y: savedPos ? savedPos.y : Math.random() * height,
        vx: savedPos ? savedPos.vx : 0,
        vy: savedPos ? savedPos.vy : 0
      }
      
      return node
    })
  }
  
  // Обновление состояния пузырей с живой физикой
  const updateBubbleStates = (nodes: BubbleNode[], width: number, height: number) => {
    const time = Date.now() * 0.0008
    
    nodes.forEach((bubble, index) => {
      // Живые колебания радиуса (дыхание) - только не на Windows
      if (!isWindows()) {
        let oscillation = Math.sin(time * 2 + bubble.oscillationPhase) * 0.05
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
      
      // Применяем основное движение
      bubble.x += oscillationX + randomX
      bubble.y += oscillationY + randomY

      // Плавное затухание скорости для лучшей инерции (если есть скорость от физической симуляции)
      if (bubble.vx !== undefined && bubble.vy !== undefined) {
        // Применяем скорость к позиции
        bubble.x += bubble.vx * 0.1 // Уменьшили множитель для более плавного движения
        bubble.y += bubble.vy * 0.1
        
        // Плавное затухание скорости для естественной инерции
        const dampingFactor = 0.92 // Медленное затухание для долгой инерции
        bubble.vx *= dampingFactor
        bubble.vy *= dampingFactor
        
        // Очищаем очень маленькие скорости для производительности
        if (Math.abs(bubble.vx) < 0.01) bubble.vx = 0
        if (Math.abs(bubble.vy) < 0.01) bubble.vy = 0
      }

      // Границы, позволяющие пузырям немного выходить за экран
      const overlap = 30 // На сколько пикселей пузырь может выйти за границу
      // Гарантируем, что padding не отрицательный и пузыри не выходят за границы слишком сильно
      const minPadding = 20 // Минимальный отступ от края
      const padding = Math.max(minPadding, bubble.currentRadius - overlap)
      bubble.x = Math.max(padding, Math.min(width - padding, bubble.x))
      bubble.y = Math.max(padding, Math.min(height - padding, bubble.y))
    
    })
  }

  // Удаление пузыря по ID и проверка на завершение года
  const removeBubble = (bubbleId: NormalizedBubble['id'], nodes: BubbleNode[]): BubbleNode[] => {
    const index = nodes.findIndex(node => node.id === bubbleId)
    if (index !== -1) {
      const newNodes = [...nodes]
      newNodes.splice(index, 1)

      // Проверяем, нужно ли переходить на следующий год
      const hasNonSpecialBubbles = newNodes.some(n => !n.isQuestion && !n.isTough && !n.isHidden)
      if (!hasNonSpecialBubbles && newNodes.length > 0) { // Убедимся, что это не последний пузырь на текузий год
        window.dispatchEvent(new CustomEvent('year-completed'))
      }
  
      return newNodes
    }
    return nodes
  }

  // Сохраняем позиции узлов перед их заменой
  const savePositions = (nodes: BubbleNode[]) => {
    nodes.forEach(node => {
      savedPositions.set(node.id, { x: node.x, y: node.y, vx: node.vx ?? 0, vy: node.vy ?? 0 })
    })
  }

  // Поиск пузыря под курсором
  const findBubbleUnderCursor = (mouseX: number, mouseY: number, nodes: BubbleNode[]): BubbleNode | null => {
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

  // Очистка сохраненных позиций
  const clearSavedPositions = () => {
    savedPositions.clear()
  }

  return {
    createNodes,
    savePositions,
    updateBubbleStates,
    removeBubble,
    findBubbleUnderCursor,
    clearSavedPositions
  }
} 