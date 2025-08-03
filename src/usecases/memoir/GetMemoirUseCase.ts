import type { GetMemoirParams, GetMemoirResult, GetMemoirUseCase as IGetMemoirUseCase } from './types'
import { MemoirRepository } from './MemoirRepository'

export class GetMemoirUseCase implements IGetMemoirUseCase {
  constructor(private memoirRepository: MemoirRepository) {}

  async execute(params: GetMemoirParams): Promise<GetMemoirResult> {
    try {
      const { level } = params
      const memoir = this.memoirRepository.getMemoirByLevel(level)

      if (!memoir) {
        return {
          success: false,
          error: `Мемуар для уровня ${level} не найден`
        }
      }

      return {
        success: true,
        memoir
      }
    } catch (error) {
      return {
        success: false,
        error: `Ошибка получения мемуара: ${error}`
      }
    }
  }
} 