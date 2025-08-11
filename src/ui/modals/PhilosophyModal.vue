<template>
  <BaseModal
    :is-open="isOpen && !!question"
    :allow-escape-close="allowEscapeClose"
    :is-closing="isClosing"
    class-name="philosophy-modal-container"
  >
    <!-- Header -->
    <div class="modal-header">
      <div class="header-icon">
        <span class="icon-emoji">🤔</span>
      </div>
      <h2 class="header-title">
        {{ t('philosophy.title') }}
      </h2>
      <p class="header-subtitle">
        {{ t('philosophy.subtitle') }}
      </p>
    </div>

    <!-- Question -->
    <div class="question-container">
      <h3 class="question-title">
        {{ question?.question }}
      </h3>
      <p class="question-insight">
        {{ question?.insight }}
      </p>
    </div>

    <!-- Options -->
    <div class="options-container">
      <button
        v-for="option in shuffledOptions"
        :key="option.id"
        @click="handleAnswer(String(option.id))"
        class="option-button group"
      >
        <span class="option-content">
          <span class="option-emoji">🤔</span>
          <p class="option-text">
            {{ option.text }}
          </p>
        </span>

        <span class="option-overlay"></span>
      </button>

      <!-- Кастомный ответ -->
      <div class="custom-answer-section">
        <div class="custom-answer-header">
          <span class="custom-answer-emoji">✍️</span>
          <span class="custom-answer-title">{{ t('philosophy.customAnswerTitle') }}</span>
        </div>

        <textarea
          v-model="customAnswer"
          :placeholder="t('philosophy.placeholder')"
          class="custom-answer-textarea"
          rows="3"
        ></textarea>

        <button
          @click="handleCustomAnswer"
          :disabled="!customAnswer.trim()"
          class="custom-answer-button"
        >
          {{ t('philosophy.answerButton', { xp: customAnswerXP }) }}
        </button>
      </div>
    </div>

    <!-- Warning -->
    <div class="warning-container">
      <div class="warning-header">
        <span>⚠️</span>
        <span class="warning-title">{{ t('philosophy.warningTitle') }}</span>
      </div>
      <p class="warning-text">
        {{ t('philosophy.warningText') }}
      </p>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Question } from '@/types/data'
import BaseModal from '@/ui/shared/BaseModal.vue'
import { XP_CALCULATOR } from '@/config'
import { computed, ref } from 'vue'
import { useI18n } from '@/composables'

interface Props {
  isOpen: boolean
  question: Question | null
  allowEscapeClose?: boolean
  isClosing?: boolean
}

interface Emits {
  (e: 'answer', optionId: string): void
  (e: 'customAnswer', answer: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const customAnswer = ref('')

// Перемешиваем варианты ответов в случайном порядке
const shuffledOptions = computed(() => {
  if (!props.question?.options) return []

  const options = [...props.question.options]
  // Простое перемешивание Fisher-Yates
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]]
  }

  return options
})

const customAnswerXP = computed(() => XP_CALCULATOR.getPhilosophyBubbleXP({isCustom: true}))

const handleAnswer = (optionId: string) => {
  emit('answer', optionId)
}

const handleCustomAnswer = () => {
  if (customAnswer.value.trim()) {
    emit('customAnswer', customAnswer.value.trim())
    customAnswer.value = ''
  }
}

const { t } = useI18n()
</script>

<style scoped>
:deep(.philosophy-modal-container) {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 2px solid #8b5cf6;
  @apply p-0 sm:p-8;
  max-width: 800px;
}

.modal-header {
  @apply text-center mb-6;
}

.header-icon {
  @apply w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-4;
}

.icon-emoji {
  @apply text-3xl;
}

.header-title {
  @apply text-2xl font-bold text-text-primary mb-2;
}

.header-subtitle {
  @apply text-text-secondary;
}

.question-container {
  @apply bg-background-secondary/50 rounded-lg p-6 mb-6;
}

.question-title {
  @apply text-lg font-semibold text-text-primary mb-3;
}

.question-insight {
  @apply text-text-secondary leading-relaxed;
}

.options-container {
  @apply space-y-3;
}

.option-button {
  @apply relative p-4 w-full rounded-xl transition-all duration-200 text-left;
  @apply focus:outline-none focus:ring-2 bg-purple-500/10 hover:bg-purple-500/20;
  @apply border border-purple-500/30 hover:border-purple-500/50 focus:ring-purple-500/50;
}

.option-content {
  @apply flex items-start gap-3;
}

.option-emoji {
  @apply text-xl flex-shrink-0;
}

.option-text {
  @apply text-sm text-text-primary leading-relaxed;
}

.option-overlay {
  @apply absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-purple-500/5;
}

.warning-container {
  @apply mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg;
}

.warning-header {
  @apply flex items-center gap-2 text-yellow-400;
}

.warning-title {
  @apply font-medium;
}

.warning-text {
  @apply text-sm text-yellow-400/80 mt-1;
}

.custom-answer-section {
  @apply mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl;
}

.custom-answer-header {
  @apply flex items-center gap-2 mb-3;
}

.custom-answer-emoji {
  @apply text-lg;
}

.custom-answer-title {
  @apply text-sm font-medium text-blue-400;
}

.custom-answer-textarea {
  @apply w-full p-3 rounded-lg border transition-colors duration-200 resize-none;
  @apply bg-blue-100/5 border-blue-500/30 text-text-primary;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50;
  @apply placeholder:text-text-secondary;
}

.custom-answer-button {
  @apply mt-3 px-4 py-2 rounded-lg font-medium transition-all duration-200;
  @apply bg-blue-500 hover:bg-blue-600 text-white;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/50;
}

/* Добавляем декоративный фоновый эффект */
:deep(.philosophy-modal-container)::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  border-radius: inherit;
  pointer-events: none;
}
</style>
