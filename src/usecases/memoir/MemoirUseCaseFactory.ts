import type { MemoirUseCaseFactory as IMemoirUseCaseFactory, MemoirStore, ModalStore } from './types'
import { GetMemoirUseCase } from './GetMemoirUseCase'
import { UnlockMemoirUseCase } from './UnlockMemoirUseCase'
import { ResetMemoirsUseCase } from './ResetMemoirsUseCase'
import { MemoirRepository } from './MemoirRepository'

export class MemoirUseCaseFactory implements IMemoirUseCaseFactory {
  private memoirRepository: MemoirRepository

  constructor(
    private memoirStore: MemoirStore,
    private modalStore: ModalStore
  ) {
    this.memoirRepository = new MemoirRepository(memoirStore)
  }

  createGetMemoirUseCase(): GetMemoirUseCase {
    return new GetMemoirUseCase(this.memoirRepository)
  }

  createUnlockMemoirUseCase(): UnlockMemoirUseCase {
    return new UnlockMemoirUseCase(this.memoirRepository, this.modalStore)
  }

  createResetMemoirsUseCase(): ResetMemoirsUseCase {
    return new ResetMemoirsUseCase(this.memoirRepository)
  }
} 