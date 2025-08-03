import type { Ref } from 'vue'
import type { NormalizedMemoir } from '@/types/normalized'

// Store Interfaces
export interface MemoirStore {
  memoirs: NormalizedMemoir[]
  unlockedMemoirs: NormalizedMemoir[]
  isLoading: boolean
  loadMemoirs(): Promise<void>
  getMemoirByLevel(level: number): NormalizedMemoir | undefined
  unlockMemoirForLevel(level: number): void
  updateUnlockedMemoirs(): void
  resetMemoirs(): void
  markMemoirAsRead(memoirId: string): void
  resetReadMemoirs(): void
}

export interface SessionStore {
  currentLevel: number
}

export interface ModalStore {
  openMemoirModal(memoir: NormalizedMemoir): void
}

// Use Case Parameters
export interface GetMemoirParams {
  level: number
}

export interface UnlockMemoirParams {
  level: number
  showModal?: boolean
}

export interface ResetMemoirsParams {}

// Use Case Results
export interface GetMemoirResult {
  success: boolean
  memoir?: NormalizedMemoir
  error?: string
}

export interface UnlockMemoirResult {
  success: boolean
  memoir?: NormalizedMemoir
  error?: string
}

export interface ResetMemoirsResult {
  success: boolean
  error?: string
}

// Use Case Interfaces
export interface GetMemoirUseCase {
  execute(params: GetMemoirParams): Promise<GetMemoirResult>
}

export interface UnlockMemoirUseCase {
  execute(params: UnlockMemoirParams): Promise<UnlockMemoirResult>
}

export interface ResetMemoirsUseCase {
  execute(params: ResetMemoirsParams): Promise<ResetMemoirsResult>
}

// Factory Interface
export interface MemoirUseCaseFactory {
  createGetMemoirUseCase(): GetMemoirUseCase
  createUnlockMemoirUseCase(): UnlockMemoirUseCase
  createResetMemoirsUseCase(): ResetMemoirsUseCase
} 