import { useI18n } from '@/composables'

// Маппинг уровней для переводов
const LEVEL_TRANSLATIONS = {
  1: 'visitor',
  2: 'interested', 
  3: 'studying',
  4: 'partner',
  5: 'bro'
} as const

/**
 * Получает переведенное название уровня
 * @param levelNumber - номер уровня
 * @returns переведенное название уровня
 */
export function getTranslatedLevelTitle(levelNumber: number): string {
  const { t } = useI18n()
  const translationKey = LEVEL_TRANSLATIONS[levelNumber as keyof typeof LEVEL_TRANSLATIONS]
  
  if (translationKey) {
    return t.value(`levels.${translationKey}`)
  }
  
  // Fallback для неизвестных уровней
  return t.value('levels.visitor')
}

/**
 * Получает переведенное название уровня по оригинальному названию
 * @param originalTitle - оригинальное название уровня
 * @returns переведенное название уровня
 */
export function getTranslatedLevelTitleByOriginal(originalTitle: string): string {
  const { t } = useI18n()
  
  // Маппинг оригинальных названий на ключи переводов
  const titleMapping: Record<string, string> = {
    'Посетитель': 'visitor',
    'Заинтересованный': 'interested',
    'Изучающий': 'studying', 
    'Партнёр': 'partner',
    'BRO': 'bro'
  }
  
  const translationKey = titleMapping[originalTitle]
  
  if (translationKey) {
    return t.value(`levels.${translationKey}`)
  }
  
  // Если не найдено соответствие, возвращаем оригинальное название
  return originalTitle
} 