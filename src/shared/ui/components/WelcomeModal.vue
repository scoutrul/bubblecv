<template>
  <Transition
    name="modal"
    appear
  >
    <div 
      v-if="isOpen" 
      class="welcome-modal-overlay"
      @click="handleOverlayClick"
      data-testid="welcome-modal"
    >
      <div class="welcome-modal" @click.stop>
        <!-- Закрытие -->
        <button 
          @click="close"
          class="close-button"
          aria-label="Закрыть"
        >
          ×
        </button>

        <!-- Аватар загадочной личности -->
        <div class="mystery-avatar">
          <div class="avatar-circle">
            <span class="avatar-icon">🕵️‍♂️</span>
          </div>
          <div class="avatar-glow"></div>
        </div>

        <!-- Заголовок -->
        <div class="welcome-header">
          <h2 class="mystery-title">Привет. Я — Мистер Икс.</h2>
          <p class="mystery-subtitle">Создатель этого резюме-игры.</p>
        </div>

        <!-- Основное сообщение -->
        <div class="welcome-content">
          <p class="intro-text">
            Ты внутри интерактивного профиля разработчика: фронтенд-специалиста, немного фуллстакера, 
            продуктового архитектора и IT-мастера по вызову.
          </p>
          
          <p class="twist-text">
            Но всё здесь устроено иначе.
          </p>
          
          <p class="quest-text">
            Чтобы узнать, кто стоит за этим проектом, что умеет, как мыслит и как связаться — 
            <strong>нужно пройти игру</strong>.
          </p>
        </div>

        <!-- Инструкции -->
        <div class="instructions">
          <div class="instruction-item">
            <span class="instruction-icon">🔍</span>
            <span class="instruction-text">Изучай пузырьки</span>
          </div>
          <div class="instruction-item">
            <span class="instruction-icon">🏆</span>
            <span class="instruction-text">Получай достижения</span>
          </div>
          <div class="instruction-item">
            <span class="instruction-icon">💬</span>
            <span class="instruction-text">Разблокируй уровни доступа</span>
          </div>
        </div>

        <!-- Финальное сообщение -->
        <div class="finale-message">
          <p>
            В финале откроются скиллы, проекты, код и контакты — и станет ясно, 
            <em>совпадают ли наши цели</em>.
          </p>
        </div>

        <!-- Призыв к действию -->
        <div class="call-to-action">
          <h3 class="ready-title">Готовы к исследованию?</h3>
          <p class="start-hint">Начинай с любого баббла.</p>
          
          <button @click="close" class="start-button" data-testid="welcome-continue">
            <span class="button-icon">🚀</span>
            Начать исследование
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const close = () => {
  emit('close')
}

const handleOverlayClick = () => {
  close()
}
</script>

<style scoped>
.welcome-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 3000; /* Выше всех остальных модалок */
}

.welcome-modal {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 2px solid #3b82f6;
  border-radius: 1rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 36rem;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(59, 130, 246, 0.1),
    0 0 50px rgba(59, 130, 246, 0.15);
  position: relative;
}

/* Vue Transition классы */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.2s ease-in;
}

.modal-enter-from {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.modal-enter-from .welcome-modal {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.modal-leave-to .welcome-modal {
  opacity: 0;
  transform: scale(0.95);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  color: #64748b;
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.25rem;
}

.close-button:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.1);
}

/* Аватар */
.mystery-avatar {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.avatar-circle {
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  animation: pulse 2s ease-in-out infinite;
}

.avatar-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.avatar-glow {
  position: absolute;
  top: -0.5rem;
  left: -0.5rem;
  right: -0.5rem;
  bottom: -0.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  opacity: 0.3;
  animation: glow 3s ease-in-out infinite alternate;
  z-index: 1;
}

/* Заголовок */
.welcome-header {
  text-align: center;
  margin-bottom: 2rem;
}

.mystery-title {
  font-size: 1.75rem;
  font-weight: 900;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.mystery-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  font-style: italic;
}

/* Контент */
.welcome-content {
  margin-bottom: 2rem;
  line-height: 1.7;
}

.intro-text {
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.twist-text {
  color: #f59e0b;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
  font-style: italic;
}

.quest-text {
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.quest-text strong {
  color: #3b82f6;
  font-weight: 700;
}

/* Инструкции */
.instructions {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.instruction-item:last-child {
  margin-bottom: 0;
}

.instruction-icon {
  font-size: 1.25rem;
  width: 1.5rem;
  text-align: center;
}

.instruction-text {
  color: #e2e8f0;
  font-weight: 500;
}

/* Финальное сообщение */
.finale-message {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 2rem;
  text-align: center;
}

.finale-message p {
  color: #cbd5e1;
  margin: 0;
}

.finale-message em {
  color: #a78bfa;
  font-style: italic;
  font-weight: 600;
}

/* Призыв к действию */
.call-to-action {
  text-align: center;
}

.ready-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
}

.start-hint {
  color: #94a3b8;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.start-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.start-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 1.1rem;
}

/* Анимации */
@keyframes modalEnter {
  from { 
    opacity: 0; 
    backdrop-filter: blur(0px);
  }
  to { 
    opacity: 1; 
    backdrop-filter: blur(8px);
  }
}

@keyframes modalScale {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modalLeave {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes glow {
  from {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  to {
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
  }
}
</style> 