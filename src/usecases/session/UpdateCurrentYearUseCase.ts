import type { 
  UpdateCurrentYearParams, 
  UpdateCurrentYearResult, 
  SessionSessionStore 
} from './types'

export class UpdateCurrentYearUseCase {
  constructor(private sessionStore: SessionSessionStore) {}

  execute(params: UpdateCurrentYearParams): void {
    const { year, triggerAnimation } = params

    if (this.sessionStore.session) {
      this.sessionStore.setCurrentYear(year)
    }
  }
} 