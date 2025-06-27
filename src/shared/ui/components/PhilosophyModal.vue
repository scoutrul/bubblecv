<template>
  <div class="philosophy-modal">
    <!-- Philosophy Modal будет добавлен позже -->
    <h2>Философский вопрос</h2>
    <p>{{ question?.question }}</p>
  </div>
</template>

<script setup lang="ts">
import type { PhilosophyQuestion } from '@shared/types'

interface Props {
  question: PhilosophyQuestion | null
}

defineProps<Props>()
defineEmits<{
  close: []
  answer: [answer: 'agree' | 'disagree']
}>()
</script> 