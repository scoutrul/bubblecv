import type { Bubble } from '../../../shared/types'
import type { SimulationNode, PositionData } from './types'
import { GAME_CONFIG } from '../../../shared/config/game-config'
import { SKILL_LEVELS_ARRAY, SKILL_LEVELS } from '../../../shared/constants/skill-levels'
import { calculateAdaptiveSizes, wrapText, isWindows } from './canvasUtils'

export function useBubbleManager() {
  // Сохранение позиций между фильтрациями
  const savedPositions = new Map<string, PositionData>()

  // Создание узлов из пузырей
  const createNodes = (bubbles: Bubble[], width: number, height: number): SimulationNode[] => {
    const sizes = calculateAdaptiveSizes(bubbles.length, width, height)
    
    return bubbles.map((bubble, index) => {
      // Если это скрытый пузырь, используем специальную конфигурацию
      if (bubble.bubbleType === 'hidden') {
        const baseRadius = sizes.min * 0.8 // Делаем скрытые пузыри немного меньше
        const savedPos = savedPositions.get(bubble.id)
        
        const node: SimulationNode = {
          ...bubble,
          radius: baseRadius,
          baseRadius,
          color: bubble.color,
          oscillationPhase: Math.random() * Math.PI * 2,
          targetRadius: baseRadius,
          currentRadius: baseRadius,
          x: savedPos?.x ?? Math.random() * width,
          y: savedPos?.y ?? Math.random() * height,
          vx: savedPos?.vx ?? 0,
          vy: savedPos?.vy ?? 0
        }
        
        const textResult = wrapText(bubble.name, baseRadius, SKILL_LEVELS.NOVICE)
        node.textLines = textResult.lines
        node.textScaleFactor = textResult.scaleFactor
        
        return node
      }

      // Используем конфигурацию уровня экспертизы для определения размера
      const expertiseConfig = GAME_CONFIG.EXPERTISE_LEVELS[bubble.skillLevel]
      
      // Проверяем, что конфигурация найдена
      if (!expertiseConfig) {
        // Используем дефолтную конфигурацию
        const defaultConfig = GAME_CONFIG.EXPERTISE_LEVELS[SKILL_LEVELS.INTERMEDIATE]
        const skillIndex = SKILL_LEVELS_ARRAY.indexOf(SKILL_LEVELS.INTERMEDIATE)
        const sizeRatio = (skillIndex + 1) / SKILL_LEVELS_ARRAY.length
        const calculatedRadius = sizes.min + (sizes.max - sizes.min) * sizeRatio
        const baseRadius = calculatedRadius * defaultConfig.sizeMultiplier
        
        const savedPos = savedPositions.get(bubble.id)
        
        const node: SimulationNode = {
          ...bubble,
          radius: baseRadius,
          baseRadius,
          color: defaultConfig.color,
          oscillationPhase: Math.random() * Math.PI * 2,
          targetRadius: baseRadius,
          currentRadius: baseRadius,
          x: savedPos?.x ?? Math.random() * width,
          y: savedPos?.y ?? Math.random() * height,
          vx: savedPos?.vx ?? 0,
          vy: savedPos?.vy ?? 0
        }
        
        const textResult = wrapText(bubble.name, baseRadius, SKILL_LEVELS.INTERMEDIATE)
        node.textLines = textResult.lines
        node.textScaleFactor = textResult.scaleFactor
        
        return node
      }
      
      const skillLevels = SKILL_LEVELS_ARRAY
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

  // Обновление состояния пузырей с живой физикой
  const updateBubbleStates = (nodes: SimulationNode[], width: number, height: number) => {
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

  // Удаление пузыря по ID
  const removeBubble = (bubbleId: string, nodes: SimulationNode[]): SimulationNode[] => {
    const index = nodes.findIndex(node => node.id === bubbleId)
    if (index !== -1) {
      const newNodes = [...nodes]
      newNodes.splice(index, 1)
  
      return newNodes
    }
    return nodes
  }

  // Сохранение позиций пузырей
  const savePositions = (nodes: SimulationNode[]) => {
    nodes.forEach(node => {
      savedPositions.set(node.id, {
        x: node.x,
        y: node.y,
        vx: node.vx || 0,
        vy: node.vy || 0
      })
    })
  }

  // Поиск пузыря под курсором
  const findBubbleUnderCursor = (mouseX: number, mouseY: number, nodes: SimulationNode[]): SimulationNode | null => {
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
    updateBubbleStates,
    removeBubble,
    savePositions,
    findBubbleUnderCursor,
    clearSavedPositions
  }
} 