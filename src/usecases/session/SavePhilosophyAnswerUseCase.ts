import type { 
  SaveCustomPhilosophyAnswerParams, 
  SaveSelectedPhilosophyAnswerParams, 
  SavePhilosophyAnswerResult, 
  SessionSessionStore 
} from './types'

export class SavePhilosophyAnswerUseCase {
  constructor(private sessionStore: SessionSessionStore) {}

  async executeCustomAnswer(params: SaveCustomPhilosophyAnswerParams): Promise<SavePhilosophyAnswerResult> {
    const { questionId, answer, questionText } = params

    if (!this.sessionStore.session) {
      return { success: false, error: 'Сессия не найдена' }
    }

    // Инициализируем объекты если их нет
    if (!this.sessionStore.session.customPhilosophyAnswers) {
      this.sessionStore.session.customPhilosophyAnswers = {}
    }

    if (!this.sessionStore.session.allPhilosophyAnswers) {
      this.sessionStore.session.allPhilosophyAnswers = {}
    }

    // Сохраняем кастомный ответ
    this.sessionStore.session.customPhilosophyAnswers[questionId] = answer
    this.sessionStore.session.allPhilosophyAnswers[questionId] = {
      type: 'custom',
      answer,
      questionText
    }

    return { success: true }
  }

  async executeSelectedAnswer(params: SaveSelectedPhilosophyAnswerParams): Promise<SavePhilosophyAnswerResult> {
    const { questionId, selectedOptionText, questionText } = params

    if (!this.sessionStore.session) {
      return { success: false, error: 'Сессия не найдена' }
    }

    // Инициализируем объект если его нет
    if (!this.sessionStore.session.allPhilosophyAnswers) {
      this.sessionStore.session.allPhilosophyAnswers = {}
    }

    // Сохраняем выбранный ответ
    this.sessionStore.session.allPhilosophyAnswers[questionId] = {
      type: 'selected',
      answer: selectedOptionText,
      questionText
    }

    return { success: true }
  }
} 