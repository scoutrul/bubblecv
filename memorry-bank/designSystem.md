# 🎨 Bubbles Resume Design System

## Концепция дизайна

**Визуальная метафора**: Пузырьки как живые технологии  
**Настроение**: Игривость + профессионализм, интерактивность + эстетика  
**Принцип**: "Серьезные навыки в несерьезной обертке"

## 🎨 Цветовая палитра

### Основные цвета

```css
:root {
  /* Градиенты для пузырьков */
  --bubble-html: linear-gradient(135deg, #E34F26 0%, #F16529 100%);
  --bubble-css: linear-gradient(135deg, #1572B6 0%, #33A9DC 100%);
  --bubble-js: linear-gradient(135deg, #F7DF1E 0%, #F0DB4F 100%);
  --bubble-vue: linear-gradient(135deg, #4FC08D 0%, #42b883 100%);
  --bubble-react: linear-gradient(135deg, #61DAFB 0%, #21D4FD 100%);
  --bubble-ts: linear-gradient(135deg, #3178C6 0%, #2A5DFF 100%);
  
  /* Основная палитра */
  --primary: #667eea;
  --primary-light: #764ba2;
  --secondary: #4fc3f7;
  --accent: #ff6b6b;
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
  
  /* Нейтральные */
  --dark: #1e1e2e;
  --medium: #2d3748;
  --light: #edf2f7;
  --white: #ffffff;
  
  /* Фоны */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: rgba(255, 255, 255, 0.05);
  --bg-glass: rgba(255, 255, 255, 0.1);
}
```

### Цвета категорий технологий

```css
/* Категории пузырьков */
--category-foundation: linear-gradient(135deg, #FF6B6B, #ee5a52);
--category-framework: linear-gradient(135deg, #4ECDC4, #44a08d);
--category-language: linear-gradient(135deg, #45B7D1, #96c93d);
--category-tooling: linear-gradient(135deg, #F9CA24, #f0932b);
--category-philosophy: linear-gradient(135deg, #FF0080, #FF4080, #FF8080, #B3FF80, #FFFFFF00); /* From game-config.ts */
--category-skill: linear-gradient(135deg, #FD79A8, #fdcb6e);
--category-project: linear-gradient(135deg, #3498db, #2980b9); /* For future Project bubbles */
--category-user-input: linear-gradient(135deg, #9b59b6, #8e44ad); /* For future User Input bubbles */
```

## 📝 Типографика

### Шрифтовая система

```css
/* Основные шрифты */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-display: 'Inter', sans-serif;

/* Размеры */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */

/* Высота строки */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Типографические стили

```css
.heading-1 {
  font-size: var(--text-5xl);
  font-weight: 700;
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.heading-2 {
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: var(--leading-tight);
}

.body-large {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
}

.body-normal {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

.code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--bg-card);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}
```

## 🫧 Компоненты пузырьков

### Размеры пузырьков

```css
/* Размеры based на уровне навыка */
.bubble-novice { 
  width: 40px; height: 40px; 
}
.bubble-intermediate { 
  width: 55px; height: 55px; 
}
.bubble-confident { 
  width: 70px; height: 70px; 
}
.bubble-expert { 
  width: 85px; height: 85px; 
}
.bubble-master { 
  width: 100px; height: 100px; 
}
```

### Эффекты пузырьков

```css
.bubble {
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  /* Свечение */
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    0 2px 10px rgba(255, 255, 255, 0.1) inset;
}

.bubble:hover {
  transform: scale(1.1);
  box-shadow: 
    0 8px 40px rgba(0, 0, 0, 0.2),
    0 4px 20px rgba(255, 255, 255, 0.2) inset;
}

.bubble-easter-egg {
  animation: breathe 3s ease-in-out infinite;
  filter: hue-rotate(45deg);
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

## 🎮 UI Компоненты

### Прогресс-бар XP

```css
.progress-bar {
  width: 100%;
  height: 12px;
  background: var(--bg-card);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 6px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4), 
    transparent
  );
  animation: shine 2s infinite;
}
```

### Карточки контента

```css
.content-card {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.content-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
```

### Кнопки

```css
.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: var(--text-base);
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-light);
}

.btn-secondary {
  background: transparent;
  color: var(--light);
  border: 1px solid var(--medium);
}

.btn-secondary:hover {
  background: var(--medium);
}
```

## 🖼️ Иконография
Иконки используются для визуальной идентификации типов пузырей и действий.
- **Философский пузырь**: Иконка `(?)` или стилизованный знак вопроса.
- **Проектный пузырь**: Иконка `</>` или портфеля.
- **Информационный пузырь**: Иконка `(i)`.

---

## 🔐 Модальные окна / Оверлеи

### Общая структура модального окна
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
  border: 1px solid var(--medium);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
```

### PhilosophyModal
Специализированное модальное окно для философских вопросов.

**Структура**:
- **Header**: `<h2>` с текстом вопроса.
- **Body**: Список кнопок с вариантами ответов.
- **Footer**: Кнопка "Показать инсайт" (появляется после ответа).

**Стили для кнопок-ответов**:
```css
.option-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 16px;
  margin-bottom: 12px;
  background: var(--bg-card);
  border: 1px solid var(--medium);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.option-btn:hover {
  border-color: var(--primary);
  background: rgba(102, 126, 234, 0.1);
}

.option-btn.selected {
  border-color: var(--primary);
  box-shadow: 0 0 10px var(--primary);
}

.option-btn.correct {
  background: rgba(76, 175, 80, 0.2);
  border-color: var(--success);
}

.option-btn.incorrect {
  background: rgba(244, 67, 54, 0.2);
  border-color: var(--error);
}
``` 