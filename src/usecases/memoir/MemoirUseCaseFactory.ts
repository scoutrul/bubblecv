import type { MemoirUseCaseFactory as IMemoirUseCaseFactory, MemoirStore, ModalStore } from './types'
import { GetMemoirUseCase } from './GetMemoirUseCase'
import { UnlockMemoirUseCase } from './UnlockMemoirUseCase'
import { ResetMemoirsUseCase } from './ResetMemoirsUseCase'

export class MemoirUseCaseFactory implements IMemoirUseCaseFactory {
  constructor(
    private memoirStore: MemoirStore,
    private modalStore: ModalStore
  ) {}

  createGetMemoirUseCase(): GetMemoirUseCase {
    return new GetMemoirUseCase(this.memoirStore)
  }

  createUnlockMemoirUseCase(): UnlockMemoirUseCase {
    return new UnlockMemoirUseCase(this.memoirStore, this.modalStore)
  }

  createResetMemoirsUseCase(): ResetMemoirsUseCase {
    return new ResetMemoirsUseCase(this.memoirStore)
  }
} 