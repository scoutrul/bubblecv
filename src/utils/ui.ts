// Преобразование hex цвета в rgb для использования с alpha
export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 102, g: 126, b: 234 }
}

export const isWindows = (): boolean => {
  return typeof window !== 'undefined' && /Win/.test(window.navigator.platform)
}
  