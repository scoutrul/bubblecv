import type { BubbleNode } from '@/types/canvas'
import type { Question } from '@/types/data'
import { gsap } from 'gsap'

export const getLevelIcon = (level: number): string => {
  switch (level) {
    case 1: return '👋'
    case 2: return '🤔'
    case 3: return '📚'
    case 4: return '🤝'
    case 5: return '🤜🤛'
    default: return '⭐'
  }
}

export const createQuestionData = (clickedBubble: BubbleNode): Question => ({
  id: `question-${clickedBubble.id}`,
  title: clickedBubble.name,   
  description: clickedBubble.description,
  question: clickedBubble.description,
  type: 'string',
  insight: 'string',
  options: [
    {
      id: 1,
      text: 'Я согласен с этим подходом и готов работать в этом стиле.',
      response: 'string',
      agreementLevel: 100,
      livesLost: 1
    },
    {
      id: 2,
      text: 'Я предпочитаю работать по-другому и не согласен с этим подходом.',
      response: 'string',
      agreementLevel: 100,
      livesLost: 1
    },
  ],
})

export const animateParallax = (
  parallaxOffset: { x: number, y: number },
  mouseX: number,
  mouseY: number,
  centerX: number,
  centerY: number
) => {
  const strength = 0.008
  const targetX = (mouseX - centerX) * strength * -1
  const targetY = (mouseY - centerY) * strength * -1

  gsap.to(parallaxOffset, {
    x: targetX,
    y: targetY,
    duration: 1.2,
    ease: 'power2.out'
  })
}

export const animateBubbleClick = (bubble: BubbleNode) => {
  const originalRadius = bubble.targetRadius
  bubble.targetRadius = originalRadius * 0.9
  
  setTimeout(() => {
    bubble.targetRadius = originalRadius * 1.3
    setTimeout(() => {
      bubble.targetRadius = originalRadius
    }, 150)
  }, 100)
}

export const animateToughBubbleHit = (bubble: BubbleNode) => {
  gsap.killTweensOf(bubble, 'targetRadius')
  bubble.targetRadius = (bubble.targetRadius || bubble.baseRadius) * 1.08
  gsap.to(bubble, {
    targetRadius: bubble.baseRadius,
    duration: 1.2,
    ease: 'elastic.out(1, 0.6)',
    delay: 0.1
  })
}

export const calculateBubbleJump = (
  mouseX: number,
  mouseY: number,
  bubble: BubbleNode
) => {
  const clickOffsetX = mouseX - bubble.x
  const clickOffsetY = mouseY - bubble.y
  const distanceToCenter = Math.sqrt(clickOffsetX * clickOffsetX + clickOffsetY * clickOffsetY)

  if (distanceToCenter > 0) {
    const dirX = clickOffsetX / distanceToCenter
    const dirY = clickOffsetY / distanceToCenter
    
    const strengthFactor = Math.min(distanceToCenter / bubble.radius, 1)
    const maxStrength = bubble.radius * 1.5
    const jumpStrength = maxStrength * strengthFactor

    return {
      vx: -dirX * jumpStrength,
      vy: -dirY * jumpStrength,
      x: -dirX * jumpStrength * 0.5,
      y: -dirY * jumpStrength * 0.5
    }
  }

  return { vx: 0, vy: 0, x: 0, y: 0 }
}