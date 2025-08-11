<template>
  <form v-if="!success && !error" @submit.prevent="handleSubmit" class="contact-form">
    <div class="form-group">
      <label for="message" class="form-label">
        {{ t('contact.messageLabel') }}
      </label>
      <textarea
        id="message"
        v-model="formData.message"
        class="form-textarea"
        :placeholder="t('contact.messagePlaceholder')"
        rows="4"
        required
      ></textarea>
    </div>

    <div class="form-group">
      <label for="name" class="form-label">
        {{ t('contact.nameLabel') }}
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        class="form-input"
        :placeholder="t('contact.namePlaceholder')"
        required
      />
    </div>

    <div class="form-group">
      <label for="contact" class="form-label">
        {{ t('contact.contactLabel') }}
      </label>
      <input
        id="contact"
        v-model="formData.contact"
        type="text"
        class="form-input"
        :placeholder="t('contact.contactPlaceholder')"
        required
      />
    </div>

    <button type="submit" class="submit-button" :disabled="!isFormValid || isSubmitting">
      {{ isSubmitting ? t('contact.sending') : t('contact.send') }}
    </button>
  </form>

  <!-- Сообщение об успехе -->
  <div v-else-if="success" class="status-container success-container">
    <div class="status-icon">✅</div>
    <h3 class="status-title">{{ t('contact.successTitle') }}</h3>
    <p class="status-text">
      {{ t('contact.successText') }}
    </p>
    <button @click="resetForm" class="action-button">
      {{ t('contact.sendAnother') }}
    </button>
  </div>

  <!-- Сообщение об ошибке -->
  <div v-else-if="error" class="status-container error-container">
    <div class="status-icon">❌</div>
    <h3 class="status-title">{{ t('contact.errorTitle') }}</h3>
    <p class="status-text">
      {{ error }}
    </p>
    <button @click="resetForm" class="action-button">
      {{ t('contact.tryAgain') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useContactForm } from '@/composables/useContactForm'
import { computed, reactive, watch } from 'vue'
import type { ContactMessage } from '@/usecases/contact'
import { useI18n } from '@/composables'

interface FormData {
  message: string
  name: string
  contact: string
}

const formData = reactive<FormData>({
  message: '',
  name: '',
  contact: ''
})

const { isSubmitting, error, success, sendMessage, resetState } = useContactForm()

const { t } = useI18n()

const isFormValid = computed(() => {
  return formData.message.trim() && formData.name.trim() && formData.contact.trim()
})

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  const messageData: ContactMessage = {
    name: formData.name.trim(),
    contact: formData.contact.trim(), 
    message: formData.message.trim()
  }

  await sendMessage(messageData)
}

const resetForm = () => {
  // Очистить форму
  formData.message = ''
  formData.name = ''
  formData.contact = ''
  
  // Сбросить состояние
  resetState()
}
</script>

<style scoped>
.contact-form {
  @apply space-y-6;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium;
  color: var(--text-primary, #f1f5f9);
}

.form-input,
.form-textarea {
  @apply w-full px-3 py-2 rounded-lg border transition-colors duration-200 resize-none;
  background: var(--background, #0f172a);
  border-color: var(--border, #334155);
  color: var(--text-primary, #f1f5f9);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-secondary, #64748b);
}

.form-input:focus,
.form-textarea:focus {
  @apply outline-none ring-2;
  border-color: var(--primary);
}

.submit-button {
  @apply w-full py-3 px-4 rounded-lg font-medium transition-all duration-200;
  background: var(--primary, #3b82f6);
  color: white;
}

.submit-button:hover:not(:disabled) {
  @apply transform scale-105;
  background: var(--accent, #8b5cf6);
}

.submit-button:disabled {
  @apply opacity-50 cursor-not-allowed;
  background: var(--text-secondary, #64748b);
}

/* Общие стили для статусных контейнеров */
.status-container {
  @apply text-center space-y-6 py-8;
}

.status-icon {
  @apply text-6xl mb-4;
  animation: bounce 0.6s ease-in-out;
}

.status-title {
  @apply text-2xl font-bold mb-2;
  color: var(--text-primary, #f1f5f9);
}

.status-text {
  @apply text-lg mb-6;
  color: var(--text-secondary, #64748b);
  line-height: 1.6;
}

.action-button {
  @apply px-6 py-3 rounded-lg font-medium transition-all duration-200;
  background: var(--accent, #8b5cf6);
  color: white;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.action-button:hover {
  @apply transform scale-105;
  background: var(--primary, #3b82f6);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* Специфичные стили для ошибки */
.error-container .status-icon {
  color: #ef4444;
}

/* Специфичные стили для успеха */
.success-container .status-icon {
  color: #22c55e;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@media (max-width: 640px) {
  .status-icon {
    @apply text-5xl;
  }
  
  .status-title {
    @apply text-xl;
  }
  
  .status-text {
    @apply text-base;
  }
}
</style>
