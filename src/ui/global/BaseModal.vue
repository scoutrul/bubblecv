<template>
  <Transition
    name="modal"
    appear
  >
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      :data-testid="testId"
    >
      <div 
        class="relative cursor-default max-w-[90%] w-[480px] max-h-[90vh] flex flex-col modal-container bg-background-primary"
        :class="className"
        @click.stop
      >
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  testId?: string
  className?: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
/* Анимации */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.modal-container {
  background: var(--background-primary, #1e293b);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border, #334155);
}

.close-button {
  transform: scale(1.05);
}

/* Стили для скроллируемой области */
.scrollable-content {
  background: rgba(245, 158, 11, 0.8);
}

/* Стили для контейнера */
:deep(.achievement-modal-container) {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 2px solid #f59e0b;
}
</style> 