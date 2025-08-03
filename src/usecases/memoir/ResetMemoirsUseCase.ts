import type { ResetMemoirsParams, ResetMemoirsResult, ResetMemoirsUseCase as IResetMemoirsUseCase } from './types'
import { MemoirRepository } from './MemoirRepository'

export class ResetMemoirsUseCase implements IResetMemoirsUseCase {
  constructor(private memoirRepository: MemoirRepository) {}

  async execute(params: ResetMemoirsParams): Promise<ResetMemoirsResult> {
    try {
      this.memoirRepository.resetMemoirs()
      this.memoirRepository.resetReadMemoirs()

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