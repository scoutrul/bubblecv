import type { UnlockMemoirParams, UnlockMemoirResult, UnlockMemoirUseCase as IUnlockMemoirUseCase, MemoirStore, ModalStore } from './types'

export class UnlockMemoirUseCase implements IUnlockMemoirUseCase {
  constructor(
    private memoirStore: MemoirStore,
    private modalStore: ModalStore
  ) {}

  async execute(params: UnlockMemoirParams): Promise<UnlockMemoirResult> {
    try {
      const { level, showModal = true } = params
      const memoir = this.memoirStore.getMemoirByLevel(level)

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
      this.memoirStore.unlockMemoirForLevel(level)

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