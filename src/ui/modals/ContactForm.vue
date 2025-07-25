<template>
  <form @submit.prevent="handleSubmit" class="contact-form">
    <div class="form-group">
      <label for="message" class="form-label">
        Ваше сообщение или впечатление
      </label>
      <textarea
        id="message"
        v-model="formData.message"
        class="form-textarea"
        placeholder="Поделитесь своими мыслями о проекте..."
        rows="4"
        required
      ></textarea>
    </div>

    <div class="form-group">
      <label for="name" class="form-label">
        Ваше имя или представьтесь
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        class="form-input"
        placeholder="Как к вам обращаться?"
        required
      />
    </div>

    <div class="form-group">
      <label for="contact" class="form-label">
        Контакт для обратной связи
      </label>
      <input
        id="contact"
        v-model="formData.contact"
        type="text"
        class="form-input"
        placeholder="Email, Telegram или другой способ связи"
        required
      />
    </div>

    <button type="submit" class="submit-button" :disabled="!isFormValid || isSubmitting">
      {{ isSubmitting ? 'Отправляется...' : 'Отправить сообщение' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { useContactForm } from '@/composables/useContactForm'

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

const isFormValid = computed(() => {
  return formData.message.trim() && formData.name.trim() && formData.contact.trim()
})

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  resetState()

  await sendMessage({
    name: formData.name,
    email: formData.contact,
    message: formData.message
  })

  if (success) {
    alert('Спасибо за сообщение! Я свяжусь с вами в ближайшее время.')

    // Очистить форму
    formData.message = ''
    formData.name = ''
    formData.contact = ''
  } else if (error.value) {
    alert(error.value)
  }
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
</style>
