import * as d3 from 'd3'
import { getExpertiseConfig, getBubbleGradient } from './useBubbleConfig'

export function drawBubble(context: CanvasRenderingContext2D, bubble: any) {
  context.save()
  const expertiseConfig = getExpertiseConfig(bubble.skillLevel)
  const opacity = bubble.isVisited ? 0.3 : (bubble.isHovered ? 1 : expertiseConfig.opacity)

  // Тень
  const shadowOpacity = opacity * (0.2 + expertiseConfig.glowIntensity * 0.3)
  context.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`
  context.shadowBlur = bubble.isHovered ? 25 : (10 + expertiseConfig.glowIntensity * 15)
  context.shadowOffsetX = 3
  context.shadowOffsetY = 3

  // Эффект свечения
  if (expertiseConfig.glowIntensity > 0) {
    const glowGradient = context.createRadialGradient(
      bubble.x, bubble.y, bubble.currentRadius * 0.8,
      bubble.x, bubble.y, bubble.currentRadius * (1.5 + expertiseConfig.glowIntensity)
    )
    const glowColor = d3.color(expertiseConfig.shadowColor)!
    glowGradient.addColorStop(0, glowColor.copy({ opacity: expertiseConfig.glowIntensity * 0.3 }).toString())
    glowGradient.addColorStop(1, glowColor.copy({ opacity: 0 }).toString())
    context.fillStyle = glowGradient
    context.beginPath()
    context.arc(bubble.x, bubble.y, bubble.currentRadius * (1.5 + expertiseConfig.glowIntensity), 0, 2 * Math.PI)
    context.fill()
  }

  // Градиентная заливка
  let mainGradient: CanvasGradient
  const grad = getBubbleGradient(bubble.skillLevel)
  if (grad) {
    mainGradient = context.createRadialGradient(
      bubble.x - bubble.currentRadius * 0.3, bubble.y - bubble.currentRadius * 0.3, 0,
      bubble.x, bubble.y, bubble.currentRadius
    )
    const color1 = d3.color(grad[0])!
    const color2 = d3.color(grad[1])!
    mainGradient.addColorStop(0, color1.brighter(0.4).toString())
    mainGradient.addColorStop(0.4, color1.toString())
    mainGradient.addColorStop(0.7, color2.toString())
    mainGradient.addColorStop(1, color2.darker(0.3).toString())
  } else {
    mainGradient = context.createRadialGradient(
      bubble.x, bubble.y, 0,
      bubble.x, bubble.y, bubble.currentRadius
    )
    const baseColor = d3.color(expertiseConfig.color)!
    mainGradient.addColorStop(0, baseColor.brighter(0.3).toString())
    mainGradient.addColorStop(0.7, baseColor.toString())
    mainGradient.addColorStop(1, baseColor.darker(0.5).toString())
  }

  // Основной круг
  context.beginPath()
  context.arc(bubble.x, bubble.y, bubble.currentRadius, 0, Math.PI * 2)
  context.fillStyle = mainGradient
  context.globalAlpha = opacity
  context.fill()

  // Убираем тень для последующих элементов
  context.shadowColor = 'transparent'

  // Глянцевый отблеск
  const highlightGradient = context.createRadialGradient(
    bubble.x - bubble.currentRadius * 0.3,
    bubble.y - bubble.currentRadius * 0.3,
    0,
    bubble.x - bubble.currentRadius * 0.3,
    bubble.y - bubble.currentRadius * 0.3,
    bubble.currentRadius * 0.6
  )
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
  highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.beginPath()
  context.arc(bubble.x, bubble.y, bubble.currentRadius, 0, Math.PI * 2)
  context.fillStyle = highlightGradient
  context.fill()

  // Граница
  context.beginPath()
  context.arc(bubble.x, bubble.y, bubble.currentRadius, 0, Math.PI * 2)
  const borderColor = d3.color(expertiseConfig.borderColor)!
  context.strokeStyle = borderColor.copy({ opacity: opacity * 0.8 }).toString()
  context.lineWidth = expertiseConfig.borderWidth
  context.stroke()
  context.restore()
}

export function drawText(context: CanvasRenderingContext2D, bubble: any) {
  if (!bubble.textLines) return
  context.save()
  const fontSize = Math.max(12, bubble.currentRadius * 0.25)
  context.font = `bold ${fontSize}px Inter, sans-serif`
  context.fillStyle = 'white'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.globalAlpha = bubble.isVisited ? 0.4 : 1
  context.shadowColor = 'rgba(0, 0, 0, 0.7)'
  context.shadowBlur = 3
  context.shadowOffsetX = 1
  context.shadowOffsetY = 1
  const lineHeight = fontSize * 1.2
  const totalHeight = bubble.textLines.length * lineHeight
  const startY = bubble.y - totalHeight / 2 + lineHeight / 2
  bubble.textLines.forEach((line: string, index: number) => {
    const y = startY + index * lineHeight
    context.fillText(line, bubble.x, y)
  })
  context.restore()
} 