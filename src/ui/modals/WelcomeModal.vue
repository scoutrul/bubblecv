<template>
  <BaseModal :is-open="isOpen" :allow-escape-close="allowEscapeClose" :is-closing="isClosing" @close="close" class-name="welcome-modal-container">
    <!-- Закрытие -->
    <button @click="close" class="close-button" :aria-label="t('common.close')">
      ×
    </button>

    <!-- Аватар загадочной личности -->
    <div class="mystery-avatar">
      <div class="avatar-circle">
        <span class="avatar-icon">🕵️‍♂️</span>
      </div>
      <div class="avatar-glow"></div>
    </div>

    <!-- Заголовок -->
    <div class="welcome-header">
      <h2 class="mystery-title">{{ t('welcome.title') }}</h2>
      <p class="mystery-subtitle">{{ t('welcome.subtitle') }}</p>
    </div>

    <!-- Основное сообщение -->
    <div class="welcome-content">
      <p class="intro-text">
        {{ t('welcome.intro') }}
      </p>

      <p class="twist-text">
        {{ t('welcome.twist') }}
      </p>

      <p class="quest-text">
        {{ t('welcome.quest') }}
      </p>
    </div>

    <!-- Инструкции -->
    <div class="instructions">
      <div class="instruction-item">
        <span class="instruction-icon">🔍</span>
        <span class="instruction-text">{{ t('welcome.instructions.explore') }}</span>
      </div>
      <div class="instruction-item">
        <span class="instruction-icon">🏆</span>
        <span class="instruction-text">{{ t('welcome.instructions.achieve') }}</span>
      </div>
      <div class="instruction-item">
        <span class="instruction-icon">💬</span>
        <span class="instruction-text">{{ t('welcome.instructions.unlock') }}</span>
      </div>
    </div>

    <!-- Финальное сообщение -->
    <div class="finale-message">
      <p>
        {{ t('welcome.finale') }}
      </p>
    </div>

    <!-- Призыв к действию -->
    <div class="call-to-action">
      <h3 class="ready-title">{{ t('welcome.ready') }}</h3>
      <p class="start-hint">{{ t('welcome.startHint') }}</p>

      <button @click="close" class="start-button">
        <span class="button-icon">🚀</span>
        {{ t('welcome.startButton') }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/shared/BaseModal.vue'
import { useI18n } from '@/composables'

interface Props {
  isOpen: boolean
  allowEscapeClose?: boolean
  isClosing?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const close = () => {
  emit('close')
}
</script>

<style scoped>
:deep(.final-modal-container) { /* keep style scoping compatibility */ }
:deep(.welcome-modal-container) {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 2px solid #3b82f6;
  width: 100%;
  max-width: 600px;
  @apply p-0 sm:p-4;
}

/* Vue Transition классы */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.2s ease-in;
}

.modal-enter-from {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.modal-enter-from .welcome-modal {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.modal-leave-to .welcome-modal {
  opacity: 0;
  transform: scale(0.95);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  color: #64748b;
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.25rem;
}

.close-button:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.1);
}

/* Аватар */
.mystery-avatar {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.avatar-circle {
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  animation: pulse 2s ease-in-out infinite;
}

.avatar-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.avatar-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  opacity: 0.7;
  animation: glow 1s ease-in-out infinite alternate;
  z-index: 1;
}

/* Заголовок */
.welcome-header {
  text-align: center;
  margin-bottom: 2rem;
}

.mystery-title {
  font-size: 1.75rem;
  font-weight: 900;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.mystery-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  font-style: italic;
}

/* Контент */
.welcome-content {
  margin-bottom: 2rem;
  line-height: 1.7;
}

.intro-text {
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.twist-text {
  color: #f59e0b;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
  font-style: italic;
}

.quest-text {
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.quest-text strong {
  color: #3b82f6;
  font-weight: 700;
}

/* Инструкции */
.instructions {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.instruction-item:last-child {
  margin-bottom: 0;
}

.instruction-icon {
  font-size: 1.25rem;
  width: 1.5rem;
  text-align: center;
}

.instruction-text {
  color: #e2e8f0;
  font-weight: 500;
}

/* Финальное сообщение */
.finale-message {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 2rem;
  text-align: center;
}

.finale-message p {
  color: #cbd5e1;
  margin: 0;
}

.finale-message em {
  color: #a78bfa;
  font-style: italic;
  font-weight: 600;
}

/* Призыв к действию */
.call-to-action {
  text-align: center;
}

.ready-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
}

.start-hint {
  color: #94a3b8;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.start-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.start-button:hover {
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.button-icon {
  font-size: 1.1rem;
}


@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes glow {
  from {
    box-shadow: 0 0 20px rgba(59, 130, 246, 1);
  }

  to {
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
  }
}
</style>
