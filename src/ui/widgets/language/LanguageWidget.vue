<template>
  <div class="language-widget">
    <ToolTip :text="currentLanguageName" position="right">
      <button 
        @click="togglePanel"
        class="language-button"
        :title="currentLanguageTitle"
      >
        <span class="language-text">{{ currentLanguageText }}</span>
      </button>
    </ToolTip>

    <!-- Popup Panel -->
    <div 
      v-if="isPanelOpen" 
      class="language-panel"
      :class="{ 'panel-open': isPanelOpen }"
    >
      <div class="panel-header">
        <h3 class="panel-title">{{ t('common.language') }}</h3>
        <button @click="closePanel" class="close-button">
          <span class="close-icon">×</span>
        </button>
      </div>

      <div class="panel-content">
        <!-- Language Selection -->
        <div class="language-section">
          <h4 class="section-title">{{ t('common.selectLanguage') }}</h4>
          <div class="language-options">
            <button 
              @click="selectLanguage('ru')"
              class="language-option"
              :class="{ 'active': currentLanguage === 'ru' }"
            >
              <span class="flag">🇷🇺</span>
              <span class="name">{{ t('language.names.ru') }}</span>
            </button>
            <button 
              @click="selectLanguage('en')"
              class="language-option"
              :class="{ 'active': currentLanguage === 'en' }"
            >
              <span class="flag">🇺🇸</span>
              <span class="name">{{ t('language.names.en') }}</span>
            </button>
          </div>
        </div>

        <!-- Warning Message -->
        <div class="warning-section">
          <div class="warning-icon">⚠️</div>
          <p class="warning-text">
            {{ t('language.restartWarning') }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button 
            @click="applyLanguageChange"
            class="apply-button"
            :disabled="!hasLanguageChanged"
          >
            {{ t('common.apply') }}
          </button>
          <button 
            @click="closePanel"
            class="cancel-button"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div 
      v-if="isPanelOpen" 
      @click="closePanel"
      class="panel-backdrop"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolTip from '@/ui/shared/ToolTip.vue'
import { useI18n } from '@/i18n'
import type { Locale } from '@/i18n'
import { useApp } from '@/composables/useApp'

const { locale, setLocale, getLocaleName, t } = useI18n()
const { resetGame } = useApp()

// Panel state
const isPanelOpen = ref(false)
const currentLanguage = computed(() => locale.value)
const selectedLanguage = ref<Locale>(currentLanguage.value)

// Проверяем, изменился ли язык
const hasLanguageChanged = computed(() => selectedLanguage.value !== currentLanguage.value)

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

// Открыть/закрыть панель
const togglePanel = () => {
  isPanelOpen.value = !isPanelOpen.value
  if (isPanelOpen.value) {
    selectedLanguage.value = currentLanguage.value
  }
}

const closePanel = () => {
  isPanelOpen.value = false
}

// Выбрать язык
const selectLanguage = (lang: Locale) => {
  selectedLanguage.value = lang
}

// Применить изменение языка
const applyLanguageChange = async () => {
  if (!hasLanguageChanged.value) return
  setLocale(selectedLanguage.value)
  closePanel()
  await resetGame()
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

/* Panel Styles */
.language-panel {
  @apply absolute bottom-full left-0 mt-2 z-50;
  @apply w-80 bg-background-glass backdrop-blur-xl;
  @apply border border-border rounded-xl shadow-2xl;
  @apply transform origin-top-right;
  @apply transition-all duration-300 ease-out;
  @apply opacity-0 scale-95 translate-y-2;
}

.panel-open {
  @apply opacity-100 scale-100 translate-y-0;
}

.panel-header {
  @apply flex items-center justify-between p-4 border-b border-border/20;
}

.panel-title {
  @apply text-lg font-semibold text-text-primary;
}

.close-button {
  @apply w-6 h-6 rounded-full;
  @apply flex items-center justify-center;
  @apply text-text-secondary hover:text-text-primary;
  @apply hover:bg-background-secondary/50;
  @apply transition-all duration-200;
}

.close-icon {
  @apply text-xl font-bold;
}

.panel-content {
  @apply p-4 space-y-4;
}

.language-section {
  @apply space-y-3;
}

.section-title {
  @apply text-sm font-medium text-text-secondary uppercase tracking-wide;
}

.language-options {
  @apply space-y-2;
}

.language-option {
  @apply w-full flex items-center space-x-3 p-3 rounded-lg;
  @apply bg-background-secondary/30 hover:bg-background-secondary/50;
  @apply border border-transparent hover:border-border/30;
  @apply transition-all duration-200;
}

.language-option.active {
  @apply bg-primary/20 border-primary/40;
}

.language-option:hover:not(.active) {
  @apply bg-background-secondary/50;
}

.flag {
  @apply text-xl;
}

.name {
  @apply font-medium text-text-primary;
}

.warning-section {
  @apply flex items-start space-x-3 p-3;
  @apply bg-amber-500/10 border border-amber-500/20 rounded-lg;
}

.warning-icon {
  @apply text-lg flex-shrink-0;
}

.warning-text {
  @apply text-sm text-amber-600 dark:text-amber-400;
  @apply leading-relaxed;
}

.action-buttons {
  @apply flex space-x-3 pt-2;
}

.apply-button {
  @apply flex-1 px-4 py-2 rounded-lg;
  @apply bg-primary hover:bg-primary/80;
  @apply text-white font-medium;
  @apply transition-all duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.cancel-button {
  @apply flex-1 px-4 py-2 rounded-lg;
  @apply bg-background-secondary hover:bg-background-secondary/60;
  @apply text-text-primary font-medium;
  @apply transition-all duration-200;
}

.panel-backdrop {
  @apply fixed inset-0 z-40;
  @apply bg-black/20 backdrop-blur-sm;
}
</style> 