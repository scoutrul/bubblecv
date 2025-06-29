export function findBubbleUnderCursor(nodes: any[], mouseX: number, mouseY: number) {
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

export function handleResize(canvasRef: HTMLCanvasElement | null, width: number, height: number, updateSimulationSize: (w: number, h: number) => void) {
  if (!canvasRef) return
  const dpr = window.devicePixelRatio || 1
  canvasRef.style.width = `${width}px`
  canvasRef.style.height = `${height}px`
  canvasRef.width = width * dpr
  canvasRef.height = height * dpr
  const ctx = canvasRef.getContext('2d')
  if (ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
  }
  updateSimulationSize(width, height)
} 