<template>
  <BaseModal
    :is-open="isOpen && !!question"
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
        {{ question.question }}
      </h3>
      <p class="text-text-secondary leading-relaxed">
        {{ question.context }}
      </p>
    </div>

    <!-- Options -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Принять -->
      <button
        @click="handleAnswer('agree')"
        class="group relative p-6 bg-green-500/10 hover:bg-green-500/20 
                 border border-green-500/30 hover:border-green-500/50
                 rounded-xl transition-all duration-200
                 text-left focus:outline-none focus:ring-2 focus:ring-green-500/50"
      >
        <div class="flex items-start justify-between mb-3">
          <span class="text-2xl">✅</span>
          <div class="text-right">
            <div class="text-green-400 font-semibold">+{{ philosophyXP }} XP</div>
            <div class="text-xs text-green-400/70">Награда</div>
          </div>
        </div>
        
        <h4 class="font-semibold text-text-primary mb-2">Принимаю</h4>
        <p class="text-sm text-text-secondary leading-relaxed">
          {{ question.agreeText || 'Я согласен с этим утверждением и готов работать в рамках этого подхода.' }}
        </p>
        
        <div class="absolute inset-0 bg-green-500/5 rounded-xl opacity-0 
                      group-hover:opacity-100 transition-opacity duration-200"></div>
      </button>

      <!-- Не принимать -->
      <button
        @click="handleAnswer('disagree')"
        class="group relative p-6 bg-red-500/10 hover:bg-red-500/20 
                 border border-red-500/30 hover:border-red-500/50
                 rounded-xl transition-all duration-200
                 text-left focus:outline-none focus:ring-2 focus:ring-red-500/50"
      >
        <div class="flex items-start justify-between mb-3">
          <span class="text-2xl">❌</span>
          <div class="text-right">
            <div class="text-red-400 font-semibold">-{{ philosophyLives }} ❤️</div>
            <div class="text-xs text-red-400/70">Штраф</div>
          </div>
        </div>
        
        <h4 class="font-semibold text-text-primary mb-2">Не принимаю</h4>
        <p class="text-sm text-text-secondary leading-relaxed">
          {{ question.disagreeText || 'Я не согласен с этим подходом и предпочитаю работать по-другому.' }}
        </p>
        
        <div class="absolute inset-0 bg-red-500/5 rounded-xl opacity-0 
                      group-hover:opacity-100 transition-opacity duration-200"></div>
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
import type { PhilosophyQuestion } from '@shared/types'
import BaseModal from '@/ui/global/BaseModal.vue'
import { useModalStore } from '@/stores/modal.store'
import { useSessionStore } from '@/stores/session.store'
import { GAME_CONFIG } from '@shared/config/game-config'
import { computed, ref } from 'vue'

interface Props {
  isOpen: boolean
  question: PhilosophyQuestion | null
}

interface Emits {
  (e: 'close'): void
  (e: 'answer', answer: 'agree' | 'disagree'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalStore = useModalStore()
const sessionStore = useSessionStore()

const philosophyXP = GAME_CONFIG.philosophyCorrectXp
const philosophyLives = GAME_CONFIG.philosophyWrongLives

const handleAnswer = (answer: 'agree' | 'disagree') => {
  emit('answer', answer)
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