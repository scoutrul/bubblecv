<template>
  <BaseModal
    :is-open="isOpen"
    :allow-escape-close="allowEscapeClose"
    @close="close"
    class-name="memoir-modal-container"
  >
    <!-- Крестик для закрытия -->
    <button
      @click="close"
      class="close-button"
      aria-label="Закрыть"
    >
      ×
    </button>

    <!-- Заголовок -->
    <div class="memoir-header">
      <div class="memoir-icon">{{ memoir?.icon }}</div>
      <h2 class="memoir-title">{{ memoir?.title }}</h2>
    </div>

    <!-- Контент мемуара -->
    <div class="memoir-content" v-if="memoir">
      <div v-html="memoir.content" class="memoir-text"></div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/global/BaseModal.vue'
import { useModalStore } from '@/stores'
import { computed } from 'vue'

interface Props {
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

const memoir = computed(() => modalStore.data.currentMemoir)

const close = () => {
  emit('close')
}
</script>

<style scoped>
:deep(.memoir-modal-container) {
  background: var(--background-secondary);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 2rem;
  width: 100%;
  max-width: 40rem;
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

.memoir-header {
  text-align: center;
  margin-bottom: 2rem;
}

.memoir-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.memoir-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.memoir-content {
  line-height: 1.7;
}

.memoir-text {
  color: var(--text-secondary);
}

.memoir-text h2 {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
}

.memoir-text h3 {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1.25rem 0 0.75rem 0;
}

.memoir-text p {
  margin-bottom: 1rem;
}

.memoir-text ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.memoir-text li {
  margin-bottom: 0.5rem;
}

.memoir-text strong {
  color: var(--text-primary);
  font-weight: 600;
}

.memoir-text code {
  background: rgba(34, 197, 94, 0.1);
  color: var(--accent);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875em;
}

.memoir-text :deep(h1),
.memoir-text :deep(h2),
.memoir-text :deep(h3),
.memoir-text :deep(h4),
.memoir-text :deep(h5),
.memoir-text :deep(h6) {
  color: var(--text-primary);
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.memoir-text :deep(h1) {
  font-size: 2rem;
}

.memoir-text :deep(h2) {
  font-size: 1.5rem;
}

.memoir-text :deep(h3) {
  font-size: 1.25rem;
}

.memoir-text :deep(h4) {
  font-size: 1.125rem;
}

.memoir-text :deep(h5),
.memoir-text :deep(h6) {
  font-size: 1rem;
}

.memoir-text :deep(h1:first-child),
.memoir-text :deep(h2:first-child),
.memoir-text :deep(h3:first-child),
.memoir-text :deep(h4:first-child),
.memoir-text :deep(h5:first-child),
.memoir-text :deep(h6:first-child) {
  margin-top: 0;
}

.memoir-text :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.memoir-text :deep(p:last-child) {
  margin-bottom: 0;
}

.memoir-text :deep(a) {
  color: var(--primary);
  text-decoration: underline;
  transition: color 0.2s;
}

.memoir-text :deep(a:hover) {
  color: var(--accent);
}

.memoir-text :deep(strong),
.memoir-text :deep(b) {
  color: var(--text-primary);
  font-weight: 600;
}

.memoir-text :deep(em),
.memoir-text :deep(i) {
  font-style: italic;
  color: var(--text-secondary);
}

.memoir-text :deep(ul),
.memoir-text :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.memoir-text :deep(li) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.memoir-text :deep(blockquote) {
  border-left: 4px solid var(--accent);
  margin: 1.5rem 0;
  padding-left: 1rem;
  font-style: italic;
  color: var(--text-secondary);
}

.memoir-text :deep(pre) {
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

.memoir-text :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--text-primary);
}

.memoir-text :deep(hr) {
  border: none;
  height: 1px;
  background: var(--border);
  margin: 2rem 0;
}
</style> 