import type { ResetMemoirsParams, ResetMemoirsResult, ResetMemoirsUseCase as IResetMemoirsUseCase, MemoirStore } from './types'

export class ResetMemoirsUseCase implements IResetMemoirsUseCase {
  constructor(private memoirStore: MemoirStore) {}

  async execute(params: ResetMemoirsParams): Promise<ResetMemoirsResult> {
    try {
      this.memoirStore.resetMemoirs()

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: `Ошибка сброса мемуаров: ${error}`
      }
    }
  }
} 