<template>
  <BaseModal
    :isOpen="isOpen"
    :allowEscapeClose="true"
    :isClosing="isClosing"
    @close="$emit('close')"
    className="chat-modal"
  >
    <div class="chat-container">
      <!-- Header -->
      <div class="chat-header">
        <h2 class="chat-title">{{ t('chat.title') }}</h2>
        <button @click="$emit('close')" class="close-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Quick Presets -->
      <div class="chat-presets">
        <button 
          v-for="preset in presets" 
          :key="preset.key"
          @click="sendPresetQuestion(preset.question)"
          class="preset-button"
          :disabled="isLoading"
        >
          {{ t(preset.label) }}
        </button>
      </div>

      <!-- Messages -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <p class="empty-text">{{ t('chat.emptyState') }}</p>
        </div>
        
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="`message-${message.role}`"
        >
          <div class="message-content">
            <div class="message-role">
              {{ message.role === 'user' ? t('chat.user') : t('chat.assistant') }}
            </div>
            <div class="message-text" v-html="formatMessageContent(message.content)"></div>
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="message message-assistant">
          <div class="message-content">
            <div class="message-role">{{ t('chat.assistant') }}</div>
            <div class="message-text">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Form -->
      <div class="chat-input-container">
        <form @submit.prevent="sendMessage" class="chat-input-form">
          <input
            v-model="inputMessage"
            type="text"
            :placeholder="t('chat.placeholder')"
            class="chat-input"
            :disabled="isLoading"
            maxlength="1000"
            ref="messageInput"
          />
          <button 
            type="submit" 
            class="send-button"
            :disabled="!inputMessage.trim() || isLoading"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </form>
        <div class="input-counter">
          {{ inputMessage.length }}/1000
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat.store'
import { useI18n } from '@/composables'
import BaseModal from '@/ui/shared/BaseModal.vue'

interface Props {
  isOpen: boolean
  isClosing?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const chatStore = useChatStore()
const { t } = useI18n()

const inputMessage = ref('')
const messageInput = ref<HTMLInputElement | null>(null)
const messagesContainer = ref<HTMLDivElement>()

const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)

const presets = [
  { key: 'resume', label: 'chat.presets.resume', question: 'Дай ссылку на резюме автора' },
  { key: 'about', label: 'chat.presets.about', question: 'Расскажи об авторе и его опыте' },
  { key: 'tech', label: 'chat.presets.tech', question: 'Какие технологии использует автор?' },
  { key: 'projects', label: 'chat.presets.projects', question: 'Расскажи о проектах автора' }
]

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  const question = inputMessage.value
  inputMessage.value = ''
  
  await chatStore.ask(question)
}

const sendPresetQuestion = async (question: string) => {
  inputMessage.value = question
  await sendMessage()
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatMessageContent = (content: string) => {
  // Если уже есть HTML-ссылки, не трогаем их, только переносы строк
  if (content.includes('<a href=') || content.includes('<a ')) {
    return content.replace(/\n/g, '<br>')
  }

  let processedContent = content

  // 1) Markdown-ссылки [текст](ссылка)
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="message-link">$1</a>'
  )

  // 2) Если после markdown уже появились <a>, не заменяем обычные URL, чтобы не испортить href
  if (!processedContent.includes('<a ')) {
    // Обычные http/https URL
    processedContent = processedContent.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="message-link">$1</a>'
    )
  }

  // 3) Специальный случай: имя файла резюме
  if (!processedContent.includes('/cv/')) {
    processedContent = processedContent.replace(
      /(Резюме — Головачев Антон\.pdf)/g,
      '<a href="/cv/$1" target="_blank" rel="noopener noreferrer" class="message-link">$1</a>'
    )
  }

  // Переносы строк
  return processedContent.replace(/\n/g, '<br>')
}

const focusInput = () => {
  nextTick(() => {
    messageInput.value?.focus()
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

// Автоскролл при добавлении новых сообщений
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// Автоскролл при изменении состояния загрузки
watch(isLoading, (newLoading) => {
  if (!newLoading) {
    // Скроллим после завершения загрузки с увеличенной задержкой
    setTimeout(scrollToBottom, 200)
    // Фокус на инпут после завершения ответа бота
    setTimeout(focusInput, 220)
  }
})

// Скролл при открытии модалки
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    chatStore.startNewSession()
    // Скроллим к началу при открытии
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = 0
      }
      focusInput()
    })
  }
})

// Принудительный скролл после каждого ответа бота
watch(() => messages.value.length, (newLength, oldLength) => {
  if (newLength > oldLength && newLength > 0) {
    const lastMessage = messages.value[newLength - 1]
    if (lastMessage.role === 'assistant') {
      // Скроллим к ответу бота с задержкой
      setTimeout(scrollToBottom, 100)
      // И фокусируем инпут
      setTimeout(focusInput, 120)
    }
  }
})

onMounted(() => {
  if (props.isOpen) {
    chatStore.startNewSession()
    focusInput()
  }
})
</script>

<style scoped>
.chat-container {
  @apply flex flex-col h-full;
}

.chat-header {
  @apply flex items-center justify-between mb-4 pb-4 border-b border-border;
}

.chat-title {
  @apply text-xl font-semibold text-text-primary;
}

.chat-presets {
  @apply flex flex-wrap gap-2 mb-4;
}

.preset-button {
  @apply px-3 py-2 text-sm rounded-lg;
  @apply bg-background-secondary hover:bg-background-card;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.chat-messages {
  @apply flex-1 overflow-y-auto mb-4;
  @apply space-y-4;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12;
  @apply text-text-secondary;
}

.empty-icon {
  @apply text-4xl mb-4;
}

.empty-text {
  @apply text-center;
}

.message {
  @apply flex;
}

.message-user {
  @apply justify-end;
}

.message-assistant {
  @apply justify-start;
}

.message-content {
  @apply max-w-[80%] p-3 rounded-lg;
  @apply min-w-[140px];
}

.message-user .message-content {
  @apply bg-primary text-white;
}

.message-assistant .message-content {
  @apply bg-background-secondary text-text-primary;
}

.message-role {
  @apply text-xs opacity-70 mb-1;
}

.message-text {
  @apply text-sm leading-relaxed;
}

.message-text :deep(.message-link) {
  @apply text-primary hover:text-primary/80 underline;
  @apply transition-colors cursor-pointer;
}

.message-text :deep(.message-link:hover) {
  @apply text-primary/60;
}

.message-time {
  @apply text-xs opacity-50 mt-2 text-right;
}

.typing-indicator {
  @apply flex space-x-1;
}

.typing-indicator span {
  @apply w-2 h-2 bg-text-secondary rounded-full animate-pulse;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.chat-input-container {
  @apply border-t border-border pt-4;
}

.chat-input-form {
  @apply flex gap-2;
}

.chat-input {
  @apply flex-1 px-3 py-2 rounded-lg;
  @apply bg-background-secondary text-text-primary;
  @apply border border-border focus:border-primary;
  @apply placeholder-text-secondary;
  @apply transition-colors;
}

.send-button {
  @apply p-2 rounded-lg;
  @apply bg-primary hover:bg-primary/80 text-white;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors;
}

.input-counter {
  @apply text-xs text-text-secondary mt-2 text-right;
}

/* Mobile styles */
@media (max-width: 640px) {
  .chat-modal {
    @apply w-full h-full max-w-none max-h-none rounded-none;
  }
  
  .chat-container {
    @apply h-full;
  }
  
  .chat-presets {
    @apply flex-col;
  }
  
  .preset-button {
    @apply w-full text-center;
  }
}

/* Desktop styles */
@media (min-width: 641px) {
  .chat-modal {
    @apply w-[400px] max-h-[80vh];
  }
}
</style>
