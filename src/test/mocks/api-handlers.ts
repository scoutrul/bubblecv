import { http, HttpResponse } from 'msw'
import { mockBubbles, mockHiddenBubble } from '../fixtures/bubbles'
import { mockPhilosophyQuestions } from '../fixtures/philosophy-questions'
import { mockAchievements } from '../fixtures/achievements'

/**
 * MSW handlers для мокирования API endpoint'ов
 */
export const apiHandlers = [
  // GET /api/bubbles - получение всех пузырей
  http.get('/api/bubbles', () => {
    return HttpResponse.json({
      success: true,
      data: mockBubbles
    })
  }),

  // GET /api/bubbles/:id - получение отдельного пузыря
  http.get('/api/bubbles/:id', ({ params }) => {
    const { id } = params
    const bubble = [...mockBubbles, mockHiddenBubble].find(b => b.id === id)
    
    if (!bubble) {
      return HttpResponse.json(
        { success: false, error: 'Bubble not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: bubble
    })
  }),

  // GET /api/philosophy-questions - получение философских вопросов
  http.get('/api/philosophy-questions', () => {
    return HttpResponse.json({
      success: true,
      data: mockPhilosophyQuestions
    })
  }),

  // GET /api/philosophy-questions/:id - получение отдельного вопроса
  http.get('/api/philosophy-questions/:id', ({ params }) => {
    const { id } = params
    const question = mockPhilosophyQuestions.find(q => q.id === id)
    
    if (!question) {
      return HttpResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: question
    })
  }),

  // GET /api/achievements - получение достижений
  http.get('/api/achievements', () => {
    return HttpResponse.json({
      success: true,
      data: mockAchievements
    })
  }),

  // GET /api/content-levels - получение уровней контента
  http.get('/api/content-levels', () => {
    return HttpResponse.json({
      levels: [
        { level: 1, title: 'Новичок', xpRequired: 0, description: 'Начальный уровень' },
        { level: 2, title: 'Изучающий', xpRequired: 100, description: 'Второй уровень' },
        { level: 3, title: 'Практик', xpRequired: 250, description: 'Третий уровень' }
      ]
    })
  }),

  // POST /api/progress - сохранение прогресса пользователя
  http.post('/api/progress', async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      success: true,
      data: {
        saved: true,
        timestamp: new Date().toISOString(),
        progress: body
      }
    })
  }),

  // POST /api/philosophy-answers - отправка ответа на философский вопрос
  http.post('/api/philosophy-answers', async ({ request }) => {
    const body = await request.json() as { questionId: string, option: string }
    
    const question = mockPhilosophyQuestions.find(q => q.id === body.questionId)
    
    if (!question) {
      return HttpResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      )
    }

    const optionIsValid = question.options.includes(body.option)
    
    if (!optionIsValid) {
      return HttpResponse.json(
        { success: false, error: 'Invalid option' },
        { status: 400 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        points: question.points,
        insight: question.insight,
        explanation: question.explanation
      }
    })
  }),

  // GET /api/stats - получение статистики игры
  http.get('/api/stats', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalBubbles: mockBubbles.length,
        totalQuestions: mockPhilosophyQuestions.length,
        totalAchievements: mockAchievements.length,
        playerStats: {
          level: 5,
          xp: 1250,
          bubblesExplored: 15,
          questionsAnswered: 8,
          achievementsUnlocked: 3
        }
      }
    })
  }),

  // POST /api/bubble-interaction - регистрация взаимодействия с пузырем
  http.post('/api/bubble-interaction', async ({ request }) => {
    const body = await request.json() as { bubbleId: string, action: string }
    
    return HttpResponse.json({
      success: true,
      data: {
        bubbleId: body.bubbleId,
        action: body.action,
        xpGained: 10,
        timestamp: new Date().toISOString()
      }
    })
  }),

  // Error handlers for testing error scenarios
  
  // Simulate network error
  http.get('/api/error/network', () => {
    return HttpResponse.error()
  }),

  // Simulate server error
  http.get('/api/error/server', () => {
    return HttpResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }),

  // Simulate timeout (delayed response)
  http.get('/api/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 3000))
    return HttpResponse.json({
      success: true,
      data: { message: 'Slow response' }
    })
  }),

  // Simulate rate limiting
  http.get('/api/rate-limited', () => {
    return HttpResponse.json(
      { success: false, error: 'Rate limited' },
      { status: 429 }
    )
  })
]

/**
 * Handlers for specific test scenarios
 */
export const errorHandlers = [
  // Override normal handlers to simulate errors
  http.get('/api/bubbles', () => {
    return HttpResponse.json(
      { success: false, error: 'Failed to fetch bubbles' },
      { status: 500 }
    )
  }),
  
  http.get('/api/content-levels', () => {
    return HttpResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }),
  
  http.get('/api/philosophy-questions', () => {
    return HttpResponse.error()
  })
]

/**
 * Empty/loading state handlers
 */
export const emptyHandlers = [
  http.get('/api/bubbles', () => {
    return HttpResponse.json({
      success: true,
      data: []
    })
  }),
  
  http.get('/api/philosophy-questions', () => {
    return HttpResponse.json({
      success: true,
      data: []
    })
  }),
  
  http.get('/api/achievements', () => {
    return HttpResponse.json({
      success: true,
      data: []
    })
  })
] 