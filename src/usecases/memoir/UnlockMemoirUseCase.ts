import type { UnlockMemoirParams, UnlockMemoirResult, UnlockMemoirUseCase as IUnlockMemoirUseCase, ModalStore } from './types'
import { MemoirRepository } from './MemoirRepository'

export class UnlockMemoirUseCase implements IUnlockMemoirUseCase {
  constructor(
    private memoirRepository: MemoirRepository,
    private modalStore: ModalStore
  ) {}

  async execute(params: UnlockMemoirParams): Promise<UnlockMemoirResult> {
    try {
      const { level, showModal = true } = params
      const memoir = this.memoirRepository.getMemoirByLevel(level)

      if (!memoir) {
        return {
          success: false,
          error: `Мемуар для уровня ${level} не найден`
        }
      }

      if (memoir.isUnlocked) {
        return {
          success: false,
          error: 'Мемуар уже разблокирован'
        }
      }

      // Разблокируем мемуар
      this.memoirRepository.unlockMemoirForLevel(level)

      // Показываем модалку если нужно
      if (showModal) {
        this.modalStore.openMemoirModal(memoir)
      }

      return {
        success: true,
        memoir
      }
    } catch (error) {
      return {
        success: false,
        error: `Ошибка разблокировки мемуара: ${error}`
      }
    }
  }
} 