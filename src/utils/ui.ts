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
