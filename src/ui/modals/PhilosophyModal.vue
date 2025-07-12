<template>
  <BaseModal
    :is-open="isOpen && !!question"
    :allow-escape-close="allowEscapeClose"
    class-name="philosophy-modal-container"
  >
    <!-- Header -->
    <div class="text-center mb-6">
      <div class="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
        <span class="text-3xl">🤔</span>
      </div>
      <h2 class="text-2xl font-bold text-text-primary mb-2">
        Философский вопрос
      </h2>
      <p class="text-text-secondary">
        Ваш взгляд на разработку важен для понимания совместимости
      </p>
    </div>

    <!-- Question -->
    <div class="bg-background/50 rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold text-text-primary mb-3">
        {{ question?.question }}
      </h3>
      <p class="text-text-secondary leading-relaxed">
        {{ question?.insight }}
      </p>
    </div>

    <!-- Options -->
    <div class="space-y-3">
      <button
        v-for="option in shuffledOptions"
        :key="option.id"
        @click="handleAnswer(String(option.id))"
        class="group relative p-4 w-full rounded-xl transition-all duration-200 text-left focus:outline-none focus:ring-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 focus:ring-purple-500/50"
      >
        <div class="flex items-start gap-3">
          <span class="text-xl flex-shrink-0">🤔</span>
          <p class="text-sm text-text-primary leading-relaxed">
            {{ option.text }}
          </p>
        </div>
        
        <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-purple-500/5"></div>
      </button>
    </div>

    <!-- Warning -->
    <div class="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
      <div class="flex items-center gap-2 text-yellow-400">
        <span>⚠️</span>
        <span class="font-medium">Внимание:</span>
      </div>
      <p class="text-sm text-yellow-400/80 mt-1">
        Неправильные ответы влияют на совместимость. При потере всех жизней игра закончится.
      </p>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Question } from '@/types/data'
import BaseModal from '@/ui/global/BaseModal.vue'
import { XP_CALCULATOR } from '@/config'
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  question: Question | null
  allowEscapeClose?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'answer', optionId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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

// Используем централизованную логику для расчета XP
const philosophyXP = computed(() => XP_CALCULATOR.getPhilosophyBubbleXP())

const handleAnswer = (optionId: string) => {
  emit('answer', optionId)
}
</script>

<style scoped>
:deep(.philosophy-modal-container) {
  cursor: default;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 2px solid #8b5cf6;
  border-radius: 1rem;
  padding: 2rem;
  max-width: calc(100vw - 4rem);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    0 0 50px rgba(139, 92, 246, 0.15);
  position: relative;
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