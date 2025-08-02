import type { GetMemoirParams, GetMemoirResult, GetMemoirUseCase as IGetMemoirUseCase, MemoirStore } from './types'

export class GetMemoirUseCase implements IGetMemoirUseCase {
  constructor(private memoirStore: MemoirStore) {}

  async execute(params: GetMemoirParams): Promise<GetMemoirResult> {
    try {
      const { level } = params
      const memoir = this.memoirStore.getMemoirByLevel(level)

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