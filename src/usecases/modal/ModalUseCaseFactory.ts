import type {
  ModalSessionStore,
  ModalLevelStore,
  ModalAchievementStore,
  ModalModalStore
} from './types'
import { ProcessAchievementEventChainUseCase } from './ProcessAchievementEventChainUseCase'

export class ModalUseCaseFactory {
  constructor(
    private sessionStore: ModalSessionStore,
    private levelStore: ModalLevelStore,
    private achievementStore: ModalAchievementStore,
    private modalStore: ModalModalStore
  ) {}

  createProcessAchievementEventChainUseCase(): ProcessAchievementEventChainUseCase {
    return new ProcessAchievementEventChainUseCase(
      this.sessionStore,
      this.achievementStore,
      this.modalStore,
      this.levelStore
    )
  }
} 