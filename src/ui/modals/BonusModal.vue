<template>
  <BaseModal
    :is-open="isOpen"
    @close="close"
    class-name="bonus-modal-container"
  >
    <!-- Крестик для закрытия -->
    <button
      @click="close"
      class="close-button"
      :aria-label="t('common.close')"
    >
      ×
    </button>

    <!-- Заголовок с иконкой -->
    <div class="bonus-header">
      <div class="bonus-icon-large">{{ bonus?.icon }}</div>
      <h2 class="bonus-title">{{ bonus?.title }}</h2>
      <div class="bonus-level-badge">
        {{ t('hud.level', { level: bonus?.level }) }}
      </div>
    </div>

    <!-- Контент бонуса -->
    <div class="bonus-content">
      <div
        v-if="bonus?.content"
        v-html="bonus.content"
        class="bonus-html-content"
      ></div>

      <!-- Форма связи для бонусов типа "form" -->
      <ContactForm v-if="bonus?.type === 'form'" class="contact-form-container" />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/global/BaseModal.vue'
import ContactForm from './ContactForm.vue'
import { useModalStore } from '@/stores'
import { useI18n } from '@/composables'
import { computed } from 'vue'

interface Props {
  isClosing?: boolean
  isOpen: boolean
  allowEscapeClose?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  allowEscapeClose: true
})

const emit = defineEmits<Emits>()
const modalStore = useModalStore()
const { t } = useI18n()

const bonus = computed(() => modalStore.data.currentBonus)

const close = () => {
  emit('close')
}
</script>

<style scoped>
:deep(.bonus-modal-container) {
  background: var(--background-secondary);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 2rem;
  width: 100%;
  max-width: 32rem;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  cursor: default;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  color: var(--text-secondary);
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.bonus-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.bonus-icon-large {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.bonus-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.bonus-level-badge {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent);
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 1rem;
  padding: 0.25rem 0.75rem;
}

.bonus-content {
  line-height: 1.6;
}

.bonus-html-content {
  color: var(--text-secondary);
}

/* Стилизация HTML контента */
.bonus-html-content :deep(h1),
.bonus-html-content :deep(h2),
.bonus-html-content :deep(h3),
.bonus-html-content :deep(h4),
.bonus-html-content :deep(h5),
.bonus-html-content :deep(h6) {
  color: var(--text-primary);
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.bonus-html-content :deep(h1) {
  font-size: 2rem;
}

.bonus-html-content :deep(h2) {
  font-size: 1.5rem;
}

.bonus-html-content :deep(h3) {
  font-size: 1.25rem;
}

.bonus-html-content :deep(h4) {
  font-size: 1.125rem;
}

.bonus-html-content :deep(h5),
.bonus-html-content :deep(h6) {
  font-size: 1rem;
}

.bonus-html-content :deep(h1:first-child),
.bonus-html-content :deep(h2:first-child),
.bonus-html-content :deep(h3:first-child),
.bonus-html-content :deep(h4:first-child),
.bonus-html-content :deep(h5:first-child),
.bonus-html-content :deep(h6:first-child) {
  margin-top: 0;
}

.bonus-html-content :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.bonus-html-content :deep(p:last-child) {
  margin-bottom: 0;
}

.bonus-html-content :deep(a) {
  color: var(--primary);
  text-decoration: underline;
  transition: color 0.2s;
}

.bonus-html-content :deep(a:hover) {
  color: var(--accent);
}

.bonus-html-content :deep(strong),
.bonus-html-content :deep(b) {
  color: var(--text-primary);
  font-weight: 600;
}

.bonus-html-content :deep(em),
.bonus-html-content :deep(i) {
  font-style: italic;
  color: var(--text-secondary);
}

.bonus-html-content :deep(ul),
.bonus-html-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.bonus-html-content :deep(li) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.bonus-html-content :deep(blockquote) {
  border-left: 4px solid var(--accent);
  margin: 1.5rem 0;
  padding-left: 1rem;
  font-style: italic;
  color: var(--text-secondary);
}

.bonus-html-content :deep(code) {
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875em;
}

.bonus-html-content :deep(pre) {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.bonus-html-content :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--text-primary);
}

.bonus-html-content :deep(hr) {
  border: none;
  height: 1px;
  background: var(--border);
  margin: 2rem 0;
}

.contact-form-container {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

@media (max-width: 640px) {
  :deep(.bonus-modal-container) {
    padding: 1.5rem;
    max-width: 95vw;
  }

  .bonus-icon-large {
    font-size: 2.5rem;
  }

  .bonus-title {
    font-size: 1.5rem;
  }
}
</style>
