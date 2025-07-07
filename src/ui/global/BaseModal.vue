<template>
  <Transition
    name="modal-backdrop"
    appear
  >
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <Transition
        name="modal-window"
        appear
      >
        <div 
          class="relative cursor-default max-w-[90%] w-[480px] max-h-[90vh] flex flex-col modal-container bg-background-primary"
          :class="className"
          @click.stop
        >
          <slot />
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  isOpen: boolean
  className?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Анимация фона - только прозрачность */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

/* Анимация модального окна - масштабирование */
.modal-window-enter-active,
.modal-window-leave-active {
  transition: all 0.3s ease;
}

.modal-window-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-window-leave-to {
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