import type {
  ModalAchievementStore,
  ModalModalStore
} from './types'
import { ProcessAchievementEventChainUseCase } from './ProcessAchievementEventChainUseCase'

export class ModalUseCaseFactory {
  constructor(
    private achievementStore: ModalAchievementStore,
    private modalStore: ModalModalStore
  ) {}

  createProcessAchievementEventChainUseCase(): ProcessAchievementEventChainUseCase {
    return new ProcessAchievementEventChainUseCase(
      this.achievementStore,
      this.modalStore
    )
  }
} 