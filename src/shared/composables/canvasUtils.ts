import { SKILL_LEVELS, SKILL_LEVEL_SCALE_MAP, type SkillLevel } from '@shared/constants/skill-levels'

// Проверка Windows для отключения анимации дыхания
export const isWindows = (): boolean => {
  return typeof window !== 'undefined' && /Win/.test(window.navigator.platform)
}

// Адаптивный расчет размеров пузырей
export const calculateAdaptiveSizes = (bubbleCount: number, width: number, height: number): { min: number, max: number } => {
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
export const wrapText = (text: string, radius: number, skillLevel?: SkillLevel): { lines: string[], scaleFactor: number } => {
  // Добавляем отступы по краям (20% от радиуса с каждой стороны)
  const padding = radius * 0.2
  const maxWidth = (radius * 2 - padding * 2) * 0.8

  // Базовый масштаб в зависимости от уровня навыка
  let baseScale = 1.0
  if (skillLevel && SKILL_LEVEL_SCALE_MAP[skillLevel]) {
    baseScale = SKILL_LEVEL_SCALE_MAP[skillLevel]
  }
  
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

// Преобразование hex цвета в rgb для использования с alpha
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 102, g: 126, b: 234 }
}

export const calculateBubbleScale = (
  text: string,
  skillLevel?: SkillLevel,
  isHighlighted: boolean = false
): number => {
  // Базовый масштаб в зависимости от уровня навыка
  let baseScale = 1.0
  if (skillLevel && SKILL_LEVEL_SCALE_MAP[skillLevel]) {
    baseScale = SKILL_LEVEL_SCALE_MAP[skillLevel]
  }
  
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
  
  return scaleFactor
} 