import { computed } from 'vue'
import { useMemoirStore, useModalStore, useUiEventStore } from '@/stores'
import { MemoirUseCaseFactory } from '@/usecases/memoir'
import type { NormalizedMemoir } from '@/types/normalized'

export function useMemoirs() {
  const memoirStore = useMemoirStore()
  const modalStore = useModalStore()
  const uiEventStore = useUiEventStore()

  // Создаем фабрику use cases (без modalStore пока что)
  const factory = new MemoirUseCaseFactory(
    memoirStore,
    {} as any // TODO: добавить правильный modalStore
  )

  // Создаем экземпляры use cases
  const unlockMemoirUseCase = factory.createUnlockMemoirUseCase()
  const getMemoirUseCase = factory.createGetMemoirUseCase()
  const resetMemoirsUseCase = factory.createResetMemoirsUseCase()

  const memoirs = computed(() => memoirStore.memoirs)
  const unlockedMemoirs = computed(() => memoirStore.unlockedMemoirs)
  const isLoading = computed(() => memoirStore.isLoading)

  // UI состояния для панели мемуаров
  const showMemoirsPanel = computed(() => uiEventStore.memoirsActive)
  const unlockedMemoirsCount = computed(() => unlockedMemoirs.value.length)

  const loadMemoirs = async () => {
    await memoirStore.loadMemoirs()
    memoirStore.updateUnlockedMemoirs()
  }

  const getMemoirByLevel = async (level: number) => {
    const result = await getMemoirUseCase.execute({ level })
    return result.success ? result.memoir : undefined
  }

  // Управление панелью мемуаров
  const toggleMemoirsPanel = () => {
    uiEventStore.toggleMemoirsPanel()
  }

  const closeMemoirsPanel = () => {
    uiEventStore.closeMemoirsPanel()
  }

  const openMemoirModal = async (memoir: NormalizedMemoir) => {
    // Импортируем useModals для открытия модального окна мемуаров
    const { useModals } = await import('@/composables/useModals')
    const { openMemoirModal: openModal } = useModals()
    openModal(memoir)
  }

  const closeMemoirModal = () => {
    // TODO: добавить модалку для мемуаров
  }

  // Получить разблокированный мемуар для определенного уровня
  const getUnlockedMemoirForLevel = (level: number) => {
    return memoirStore.getMemoirByLevel(level)
  }

  // Разблокировать мемуар при повышении уровня
  const unlockMemoirForLevel = async (level: number) => {
    const result = await unlockMemoirUseCase.execute({ level })
    return result.success ? result.memoir : null
  }

  // Сброс мемуаров при рестарте игры
  const resetMemoirs = () => {
    resetMemoirsUseCase.execute({})
  }

  return {
    memoirs,
    unlockedMemoirs,
    isLoading,
    showMemoirsPanel,
    unlockedMemoirsCount,
    loadMemoirs,
    getMemoirByLevel,
    toggleMemoirsPanel,
    closeMemoirsPanel,
    openMemoirModal,
    closeMemoirModal,
    getUnlockedMemoirForLevel,
    unlockMemoirForLevel,
    resetMemoirs
  }
} 