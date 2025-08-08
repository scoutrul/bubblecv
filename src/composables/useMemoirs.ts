import { computed } from 'vue'
import { useMemoirStore } from '@/stores'
import type { NormalizedMemoir } from '@/types/normalized'

export function useMemoirs() {
  const memoirStore = useMemoirStore()

  const memoirs = computed(() => memoirStore.memoirs)
  const unlockedMemoirs = computed(() => memoirStore.unlockedMemoirs)
  const isLoading = computed(() => memoirStore.isLoading)

  const unlockedMemoirsCount = computed(() => {
    if (memoirs.value.length > 0) {
      return unlockedMemoirs.value.length
    }
    return 0
  })

  const loadMemoirs = async () => {
    await memoirStore.loadMemoirs()
    memoirStore.updateUnlockedMemoirs()
  }

  // Получить разблокированный мемуар для определенного уровня
  const getUnlockedMemoirForLevel = (level: number) => {
    return memoirStore.getMemoirByLevel(level)
  }

  // Разблокировать мемуар для определенного уровня
  const unlockMemoirForLevel = (level: number) => {
    memoirStore.unlockMemoirForLevel(level)
  }

  // Проверяем, был ли мемуар прочитан
  const isMemoirRead = (memoirId: string): boolean => {
    return memoirStore.isMemoirRead(memoirId)
  }

  // Сброс мемуаров при рестарте игры
  const resetMemoirs = () => {
    memoirStore.resetMemoirs()
    memoirStore.resetReadMemoirs()
  }

  return {
    memoirs,
    unlockedMemoirs,
    isLoading,
    unlockedMemoirsCount,
    loadMemoirs,
    getUnlockedMemoirForLevel,
    unlockMemoirForLevel,
    isMemoirRead,
    resetMemoirs
  }
} 