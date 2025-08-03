import type { MemoirStore } from './types'
import type { NormalizedMemoir } from '@/types/normalized'

export class MemoirRepository {
  constructor(private memoirStore: MemoirStore) {}

  /**
   * Получает все мемуары
   */
  getMemoirs(): NormalizedMemoir[] {
    return this.memoirStore.memoirs
  }

  /**
   * Получает разблокированные мемуары
   */
  getUnlockedMemoirs(): NormalizedMemoir[] {
    return this.memoirStore.unlockedMemoirs
  }

  /**
   * Получает мемуар по уровню
   */
  getMemoirByLevel(level: number): NormalizedMemoir | undefined {
    return this.memoirStore.getMemoirByLevel(level)
  }

  /**
   * Разблокирует мемуар для уровня
   */
  unlockMemoirForLevel(level: number): void {
    this.memoirStore.unlockMemoirForLevel(level)
  }

  /**
   * Обновляет разблокированные мемуары на основе текущего уровня
   */
  updateUnlockedMemoirs(): void {
    this.memoirStore.updateUnlockedMemoirs()
  }

  /**
   * Сбрасывает мемуары
   */
  resetMemoirs(): void {
    this.memoirStore.resetMemoirs()
  }

  /**
   * Отмечает мемуар как прочитанный
   */
  markMemoirAsRead(memoirId: string): void {
    this.memoirStore.markMemoirAsRead(memoirId)
  }

  /**
   * Сбрасывает статус прочитанных мемуаров
   */
  resetReadMemoirs(): void {
    this.memoirStore.resetReadMemoirs()
  }

  /**
   * Загружает мемуары
   */
  async loadMemoirs(): Promise<void> {
    await this.memoirStore.loadMemoirs()
  }

  /**
   * Получает статус загрузки
   */
  getIsLoading(): boolean {
    return this.memoirStore.isLoading
  }
} 