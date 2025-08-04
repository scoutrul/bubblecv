import { ref, computed } from 'vue'
import ru from './locales/ru.json'
import en from './locales/en.json'

export type Locale = 'ru' | 'en'

const locales = {
  ru,
  en
} as const

// Состояние текущего языка
const currentLocale = ref<Locale>('ru')

// Функция для получения перевода с поддержкой вложенных ключей
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

// Функция для интерполяции параметров в строке
function interpolate(text: string, params: Record<string, any> = {}): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

// Composable для работы с переводами
export function useI18n() {
  // Текущие переводы
  const t = computed(() => {
    const locale = locales[currentLocale.value]
    return (key: string, params?: Record<string, any>) => {
      const translation = getNestedValue(locale, key)
      return params ? interpolate(translation, params) : translation
    }
  })

  // Текущий язык
  const locale = computed(() => currentLocale.value)

  // Доступные языки
  const availableLocales = computed(() => Object.keys(locales) as Locale[])

  // Смена языка
  const setLocale = (newLocale: Locale) => {
    if (locales[newLocale]) {
      currentLocale.value = newLocale
      // Сохраняем в localStorage
      localStorage.setItem('locale', newLocale)
    }
  }

  // Инициализация языка из localStorage
  const initLocale = () => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && locales[savedLocale]) {
      currentLocale.value = savedLocale
    }
  }

  // Получение названия языка для отображения
  const getLocaleName = (locale: Locale): string => {
    const names = {
      ru: 'Русский',
      en: 'English'
    }
    return names[locale]
  }

  // Получение флага языка
  const getLocaleFlag = (locale: Locale): string => {
    const flags = {
      ru: '🇷🇺',
      en: '🇺🇸'
    }
    return flags[locale]
  }

  return {
    t,
    locale,
    availableLocales,
    setLocale,
    initLocale,
    getLocaleName,
    getLocaleFlag
  }
}

// Инициализация при загрузке модуля
export const i18n = useI18n()
i18n.initLocale() 