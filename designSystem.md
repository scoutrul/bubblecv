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
--category-philosophy: linear-gradient(135deg, #6C5CE7, #a55eea);
--category-skill: linear-gradient(135deg, #FD79A8, #fdcb6e);
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
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.btn-ghost {
  background: transparent;
  color: var(--light);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-ghost:hover {
  background: var(--bg-card);
  border-color: rgba(255, 255, 255, 0.4);
}
```

## 🎯 Интерактивные элементы

### Временная шкала

```css
.timeline {
  position: relative;
  width: 100%;
  height: 60px;
  background: var(--bg-card);
  border-radius: 30px;
  overflow: hidden;
}

.timeline-track {
  height: 4px;
  background: linear-gradient(90deg, 
    var(--category-foundation) 0%, 
    var(--category-language) 25%,
    var(--category-framework) 50%,
    var(--category-tooling) 75%,
    var(--category-philosophy) 100%
  );
  margin-top: 28px;
}

.timeline-handle {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 20px;
  cursor: grab;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.timeline-handle:active {
  cursor: grabbing;
  transform: scale(1.2);
}
```

### Модальные окна

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 📱 Адаптивность

### Breakpoints

```css
/* Mobile first подход */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Адаптивные размеры пузырьков

```css
/* Mobile */
.bubble { 
  width: calc(var(--bubble-size) * 0.7); 
  height: calc(var(--bubble-size) * 0.7); 
}

/* Tablet */
@media (min-width: 768px) {
  .bubble { 
    width: calc(var(--bubble-size) * 0.85); 
    height: calc(var(--bubble-size) * 0.85); 
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .bubble { 
    width: var(--bubble-size); 
    height: var(--bubble-size); 
  }
}
```

## ✨ Анимации

### Ключевые анимации

```css
/* Появление пузырьков */
@keyframes bubbleAppear {
  0% {
    opacity: 0;
    transform: scale(0) translateY(50px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Floating эффект */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Shine эффект */
@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Level up анимация */
@keyframes levelUp {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

## 🎨 Темная тема (по умолчанию)

Дизайн оптимизирован для темной темы как основной:

- Темный фон создает эффект космоса/ночного неба
- Пузырьки светятся на темном фоне
- Лучше фокус на интерактивных элементах
- Современный и профессиональный вид
- Меньше нагрузки на глаза при длительном просмотре

## 🔧 Технические требования

- Поддержка CSS Custom Properties
- Backdrop-filter для глянцевых эффектов
- CSS Grid и Flexbox для layout
- CSS Animations для микроинтерактивности
- GSAP для сложных анимаций пузырьков
- Поддержка touch-событий для мобильных

## 📐 Spacing System

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

Эта дизайн-система обеспечит консистентный, современный и интерактивный интерфейс для Bubbles Resume! 🎨 