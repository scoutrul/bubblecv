import type { Ref } from 'vue'
import type { Bubble } from '@shared/types'
import { GAME_CONFIG } from '@shared/config/game-config'
import { SKILL_LEVELS_ARRAY, SKILL_LEVELS } from '@shared/constants/skill-levels'
import { calculateAdaptiveSizes, wrapText, isWindows } from './canvasUtils'
import type { SimulationNode, PositionData } from './types'

export function useBubbleManager() {
  // Сохранение позиций между фильтрациями
  const savedPositions = new Map<string, PositionData>()
  
  // Для тестов - проверяем наличие глобальной переменной с тестовыми позициями
  if (typeof window !== 'undefined' && (window as any).__testPositions) {
    Object.entries((window as any).__testPositions).forEach(([id, pos]) => {
      savedPositions.set(id, pos as any)
    })
  }

  // Создание узлов из пузырей
  const createNodes = (bubbles: Bubble[], width: number, height: number): SimulationNode[] => {
    const sizes = calculateAdaptiveSizes(bubbles.length, width, height)

    return bubbles.map((bubble, index) => {
      // Масштабируем размер в зависимости от уровня экспертизы
      const expertiseConfig = GAME_CONFIG.expertiseLevels[bubble.skillLevel]
      
      // Проверяем, что конфигурация найдена
      if (!expertiseConfig) {
        // Используем дефолтную конфигурацию
        const defaultConfig = GAME_CONFIG.expertiseLevels[SKILL_LEVELS.INTERMEDIATE]
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
        bubbleColor = GAME_CONFIG.philosophyBubble.gradientColors[0]
      } else {
        // Для обычных пузырей используем цвет из уровня экспертизы
        bubbleColor = expertiseConfig.color
      }
      
      // Обертываем текст
      const textResult = wrapText(bubble.name, baseRadius, bubble.skillLevel)
      
      const savedPos = savedPositions.get(bubble.id)
      
      const node: SimulationNode = {
        ...bubble,
        radius: baseRadius,
        baseRadius,
        color: bubbleColor,
        oscillationPhase: Math.random() * Math.PI * 2,
        targetRadius: baseRadius,
        currentRadius: baseRadius,
        textLines: textResult.lines,
        textScaleFactor: textResult.scaleFactor,
        // Используем сохраненные позиции, если они есть
        x: savedPos ? savedPos.x : Math.random() * width,
        y: savedPos ? savedPos.y : Math.random() * height,
        vx: savedPos ? savedPos.vx : 0,
        vy: savedPos ? savedPos.vy : 0
      }
      
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

  // Сохраняем позиции узлов перед их заменой
  const savePositions = (nodes: SimulationNode[]) => {
    nodes.forEach(node => {
      savedPositions.set(node.id, { x: node.x, y: node.y, vx: node.vx ?? 0, vy: node.vy ?? 0 })
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
    savePositions,
    updateBubbleStates,
    removeBubble,
    findBubbleUnderCursor,
    clearSavedPositions
  }
} 