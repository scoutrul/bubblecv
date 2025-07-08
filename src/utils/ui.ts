import type { NormalizedBubble } from "@/types/normalized"

// Тип RGB-цвета
export interface RGBColor {
  r: number
  g: number
  b: number
}

// Преобразование HEX в RGB
export function hexToRgb(hex: string): RGBColor {
  const cleanHex = hex.replace('#', '').trim()

  if (cleanHex.length !== 6) {
    // Fallback: синий градиент
    return { r: 102, g: 126, b: 234 }
  }

  const bigint = parseInt(cleanHex, 16)

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

// Проверка на Windows-платформу
export const isWindows = (): boolean => {
  return typeof window !== 'undefined' && /Win/.test(navigator.platform)
}

  // Generate session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}`
}

export function getYearRange(bubbles: NormalizedBubble[]) {
  if (bubbles.length === 0) {
    // Используем конфигурационный год вместо текущего
    return {
      startYear: 2015, // GAME_CONFIG.initialYear
      endYear: 2015
    }
  }
  
  const years = bubbles.map(b => b.year)
  return {
    startYear: Math.min(...years),
    endYear: Math.max(...years)
  }
}