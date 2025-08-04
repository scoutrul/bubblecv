<template>
  <ToolTip :text="currentLanguageName" position="right">
    <div class="language-widget">
      <button 
        @click="toggleLanguage"
        class="language-button"
        :title="currentLanguageTitle"
      >
        <span class="language-text">{{ currentLanguageText }}</span>
      </button>
    </div>
  </ToolTip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ToolTip from '@/ui/global/ToolTip.vue'
import { useI18n } from '@/i18n'

const { locale, setLocale, getLocaleName, t } = useI18n()

// Текущий язык
const currentLanguage = computed(() => locale.value)

// Название текущего языка
const currentLanguageName = computed(() => getLocaleName(currentLanguage.value))

// Текстовое обозначение языка
const currentLanguageText = computed(() => {
  return currentLanguage.value === 'ru' ? 'En' : 'Ru'
})

// Заголовок для кнопки
const currentLanguageTitle = computed(() => {
  const nextLanguage = currentLanguage.value === 'ru' ? 'en' : 'ru'
  const nextLanguageName = getLocaleName(nextLanguage)
  return t.value('common.language') + ': ' + nextLanguageName
})

// Переключение языка
const toggleLanguage = () => {
  const newLanguage = currentLanguage.value === 'ru' ? 'en' : 'ru'
  setLocale(newLanguage)
}
</script>

<style scoped>
.language-widget {
  @apply relative;
}

.language-button {
  @apply w-8 h-8 sm:w-12 sm:h-12 rounded-full;
  @apply flex items-center justify-center;
  @apply bg-background-glass backdrop-blur-md border-[0.5px] border-border;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-all duration-300;
  @apply hover:scale-110;
  @apply active:scale-95;
}

.language-button:hover {
  @apply shadow-xl shadow-primary/30;
}

.language-text {
  @apply text-sm sm:text-base font-semibold transition-transform duration-300;
}

.language-button:hover .language-text {
  @apply scale-110;
}
</style> 