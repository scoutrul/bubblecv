import type { 
  VisitBubbleParams, 
  VisitBubbleResult, 
  SessionSessionStore 
} from './types'

export class VisitBubbleUseCase {
  constructor(private sessionStore: SessionSessionStore) {}

  async execute(params: VisitBubbleParams): Promise<VisitBubbleResult> {
    const { bubbleId } = params

    if (this.sessionStore.session) {
      const visitedBubbles = this.sessionStore.session.visitedBubbles
      const wasNewVisit = !visitedBubbles.includes(bubbleId)
      
      if (wasNewVisit) {
        this.sessionStore.addVisitedBubble(bubbleId)
      }
      
      return { success: true, wasNewVisit }
    }

    return { success: false, wasNewVisit: false, error: 'Сессия не найдена' }
  }
} 