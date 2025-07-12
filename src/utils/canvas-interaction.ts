import type { BubbleNode } from '@/types/canvas'
import type { Question } from '@/types/data'
import questionsData from '@/data/questions.json'

export const createQuestionData = (clickedBubble: BubbleNode): Question => {
  // Если у пузыря есть questionId, используем его
  if (clickedBubble.questionId) {
    const question = questionsData.questions.find(q => q.id === clickedBubble.questionId)
    if (question) {
      return {
        ...question,
        title: 'Философский вопрос',
        description: 'Ваш взгляд на разработку важен для понимания совместимости'
      }
    }
  }
  
  // Иначе берем случайный вопрос
  const randomQuestion = questionsData.questions[Math.floor(Math.random() * questionsData.questions.length)]
  return {
    ...randomQuestion,
    title: 'Философский вопрос',
    description: 'Ваш взгляд на разработку важен для понимания совместимости'
  }
}

// Функция перенесена в @/utils/animations
export { animateParallax } from '@/utils/animations'

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

// Функция перенесена в @/utils/animations
export { animateToughBubbleHit } from '@/utils/animations'

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