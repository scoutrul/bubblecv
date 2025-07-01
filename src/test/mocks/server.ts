import { setupServer } from 'msw/node'
import { apiHandlers, errorHandlers, emptyHandlers } from './api-handlers'

/**
 * MSW server для тестирования
 */
export const server = setupServer(...apiHandlers)

/**
 * Утилита для переключения на error handlers
 */
export const useErrorHandlers = () => {
  server.use(...errorHandlers)
}

/**
 * Утилита для переключения на empty handlers
 */
export const useEmptyHandlers = () => {
  server.use(...emptyHandlers)
}

/**
 * Утилита для сброса handlers к базовым
 */
export const resetToDefaultHandlers = () => {
  server.resetHandlers(...apiHandlers)
}

/**
 * Утилиты для быстрого создания кастомных handlers в тестах
 */
export { http, HttpResponse } from 'msw' 