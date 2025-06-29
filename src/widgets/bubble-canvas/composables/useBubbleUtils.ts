export function wrapText(text: string, radius: number): string[] {
  const maxCharsPerLine = Math.max(4, Math.floor(radius / 4))
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
        lines.push(word.slice(0, maxCharsPerLine - 3) + '...')
        currentLine = ''
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }
  if (lines.length > 2) {
    lines[1] = lines[1].slice(0, -3) + '...'
    return lines.slice(0, 2)
  }
  return lines
}

export function generateBubbleId(name: string, year: number) {
  return `${name.replace(/\s+/g, '_').toLowerCase()}_${year}`
} 