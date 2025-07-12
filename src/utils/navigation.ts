type CleanupFn = () => void

export function preventHistoryNavigation(): CleanupFn {
  // Добавим фиктивную запись в историю
  history.pushState(null, '', window.location.href)

  // Обработчик попыток навигации назад
  const onPopState = (e: PopStateEvent) => {
    history.pushState(null, '', window.location.href)
    e.preventDefault?.()
    e.stopPropagation?.()
  }

  // Обработчик клавиш навигации
  const onKeyDown = (e: KeyboardEvent) => {
    const isNavKey = (
      (e.altKey || e.metaKey) &&
      (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
    )

    if (isNavKey) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // Блокировка backspace вне полей ввода
    if (e.key === 'Backspace') {
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      const isEditable = ['input', 'textarea'].includes(tag) || target.isContentEditable

      if (!isEditable) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }

  // Подписка на события
  window.addEventListener('popstate', onPopState)
  window.addEventListener('keydown', onKeyDown)

  // Функция для отписки
  return () => {
    window.removeEventListener('popstate', onPopState)
    window.removeEventListener('keydown', onKeyDown)
  }
}
