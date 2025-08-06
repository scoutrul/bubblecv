import { computed } from 'vue'
import { useSessionStore } from '@/stores/session.store'
import { GameModeUseCaseFactory } from '@/usecases/game-mode'
import { GameMode, GAME_MODE_INFO } from '@/usecases/game-mode/types'

export function useGameMode() {
  const sessionStore = useSessionStore()
  
  // Создаем фабрику use cases
  const gameModeUseCaseFactory = new GameModeUseCaseFactory(sessionStore)
  const getGameModeUseCase = gameModeUseCaseFactory.createGetGameModeUseCase()
  const shouldShowProjectTransitionModalUseCase = gameModeUseCaseFactory.createShouldShowProjectTransitionModalUseCase()

  // Определяем текущий режим
  const currentGameMode = computed(() => {
    const result = getGameModeUseCase.execute({
      currentLevel: sessionStore.currentLevel
    })
    return result.mode
  })

  // Информация о текущем режиме
  const currentGameModeInfo = computed(() => {
    return GAME_MODE_INFO[currentGameMode.value]
  })

  // Проверяем, находимся ли мы в режиме проекта
  const isProjectMode = computed(() => {
    const result = getGameModeUseCase.execute({
      currentLevel: sessionStore.currentLevel
    })
    return result.isProjectMode
  })

  // Проверяем, находимся ли мы в режиме карьеры
  const isCareerMode = computed(() => {
    const result = getGameModeUseCase.execute({
      currentLevel: sessionStore.currentLevel
    })
    return result.isCareerMode
  })

  // Проверяем, нужно ли показать модалку перехода
  const shouldShowProjectTransitionModal = computed(() => {
    const result = shouldShowProjectTransitionModalUseCase.execute({
      currentLevel: sessionStore.currentLevel
    })
    return result.shouldShow
  })

  return {
    currentGameMode,
    currentGameModeInfo,
    isProjectMode,
    isCareerMode,
    shouldShowProjectTransitionModal,
    GameMode
  }
} 