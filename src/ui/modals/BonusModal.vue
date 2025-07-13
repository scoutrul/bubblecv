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
      aria-label="Закрыть"
    >
      ×
    </button>
    
    <!-- Заголовок с иконкой -->
    <div class="bonus-header">
      <div class="bonus-icon-large">{{ bonus?.icon }}</div>
      <h2 class="bonus-title">{{ bonus?.title }}</h2>
      <div class="bonus-level-badge">
        Уровень {{ bonus?.level }}
      </div>
    </div>

    <!-- Контент бонуса -->
    <div class="bonus-content">
      <div 
        v-if="bonus?.content" 
        v-html="bonus.content"
        class="bonus-html-content"
      ></div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from '@/ui/global/BaseModal.vue'
import { useModalStore } from '@/stores'

interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()
const modalStore = useModalStore()

const isOpen = computed(() => modalStore.modals.bonus)
const bonus = computed(() => modalStore.data.currentBonus)

const close = () => {
  emit('close')
}
</script>

<style scoped>
:deep(.bonus-modal-container) {
  background: var(--background-secondary, #1e293b);
  border: 1px solid var(--border, #334155);
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
  color: var(--text-secondary, #64748b);
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
  color: var(--text-primary, #f1f5f9);
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
  color: var(--text-primary, #f1f5f9);
  margin-bottom: 0.5rem;
}

.bonus-level-badge {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent, #8b5cf6);
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 1rem;
  padding: 0.25rem 0.75rem;
}

.bonus-content {
  line-height: 1.6;
}

.bonus-html-content {
  color: var(--text-secondary, #64748b);
}

/* Стилизация HTML контента */
.bonus-html-content :deep(p) {
  margin-bottom: 1rem;
}

.bonus-html-content :deep(a) {
  color: var(--primary, #3b82f6);
  text-decoration: underline;
  transition: color 0.2s;
}

.bonus-html-content :deep(a:hover) {
  color: var(--accent, #8b5cf6);
}

.bonus-html-content :deep(strong) {
  color: var(--text-primary, #f1f5f9);
  font-weight: 600;
}

.bonus-html-content :deep(ul) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.bonus-html-content :deep(li) {
  margin-bottom: 0.5rem;
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