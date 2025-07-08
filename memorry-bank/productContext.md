# Product Context - Bubbles Resume

## 📋 Техническая спецификация

### 🏗️ Архитектура приложения
Frontend-only приложение на Vue 3 с JSON-based данными. Архитектура построена на принципах разделения ответственности и композиции.

**Текущая архитектура**: API → Store → Composable → View

### 🎨 Архитектурные принципы
- **Layered Architecture**: Четкое разделение слоев ответственности
- **Composition over Inheritance**: Vue Composition API для переиспользования
- **Single Source of Truth**: Централизованное состояние в Pinia
- **Dumb Components**: Vue компоненты без бизнес-логики
- **Type Safety**: Строгая типизация всех слоев

---

## 🎯 Игровая механика

### Компонентная архитектура

#### 1. BubbleCanvas
- **Назначение**: Основной холст для визуализации пузырей
- **Технологии**: Vue 3 + D3.js + GSAP
- **Управление**: useBubbleCanvas() + usePhysicsSimulation()

#### 2. GameHUD  
- **Назначение**: Игровой интерфейс (XP, жизни, уровень)
- **Данные**: Через useApp() → session.store

#### 3. Система модальных окон
- **BaseModal**: Унифицированная основа всех модалок
- **Типы**: Bubble, Philosophy, Achievement, Level Up, Game Over

### 🗄️ Схема данных (JSON-based)

```typescript
// Основные JSON структуры
skills.json        // Технологические пузыри
achievements.json  // Система достижений  
levels.json       // Игровые уровни
questions.json    // Философские вопросы
skill-levels.json // Уровни экспертизы
```

### Нормализация данных
```typescript
// Поток обработки данных
Raw JSON → API Layer → Normalization → Store → Composable → View
```

---

## 🎮 Геймификация

### Система очков (XP)
- **Обычные пузыри**: 3 XP за просмотр
- **Философские пузыри**: 10 XP за правильный ответ  
- **Крепкие пузыри**: 1 XP за клик
- **Достижения**: 10 XP за каждое

### Система жизней
- **Штрафы**: -1 жизнь за неправильный философский ответ
- **Восстановление**: 5 жизней после сброса игры

### Уровневая система
```typescript
GAME_CONFIG.levelRequirements = {
  1: 22,  // Имя и фото
  2: 44,  // Биография  
  3: 66,  // Контакты
  4: 88,  // Telegram
  5: 110  // Полный доступ
}
```

---

## 🎨 UI/UX Спецификация

### Состояния пузырей
```typescript
interface BubbleNode {
  isActive: boolean    // Видим и интерактивен
  isVisited: boolean   // Был нажат
  isHovered: boolean   // Под курсором
  isTough: boolean     // Требует несколько кликов
  isQuestion: boolean  // Философский пузырь
}
```

### Анимации (GSAP)
- **Hover**: Scale 1.1x + glow эффект
- **Click**: Pulse + концентрические волны
- **Появление**: Scale from 0 + elastic ease
- **Физика**: D3.js force simulation

### Адаптивность
- **Desktop**: Полноэкранный canvas
- **Mobile**: Адаптивные размеры и touch-friendly

---

## 🔄 Пользовательские сценарии

### Сценарий 1: Первое посещение
1. Загрузка → Welcome Modal
2. Клики по пузырям → накопление XP
3. Level Up → разблокировка контента

### Сценарий 2: Философское тестирование
1. Клик на philosophy пузырь
2. PhilosophyModal с вопросом
3. Ответ → XP или потеря жизни
4. Insight автора

### Сценарий 3: Прогрессия
1. Накопление XP через взаимодействия
2. Достижения за особые действия
3. Постепенное раскрытие информации

---

## 📊 Техническая реализация

### Слои архитектуры
```
📦 Bubbles Resume
├── 🔗 API          → JSON загрузка
├── 🗄️ Stores       → Состояние (Pinia)
├── 🧩 Composables  → Бизнес-логика  
├── 🎨 Components   → UI презентация
├── ⚙️ Utils        → Утилиты
├── 📁 Data         → JSON файлы
└── 🏷️ Types        → TypeScript типы
```

### Центральная композиция
```typescript
// useApp() - главный связующий слой
const {
  // Состояние
  isLoading,
  gameState,
  
  // Действия  
  initializeApp,
  resetGame,
  
  // Данные
  bubbles,
  achievements,
  session
} = useApp()
```

### Ключевые composables
- **useApp**: Центральная композиция
- **useBubbleManager**: Управление пузырями
- **usePhysicsSimulation**: D3.js физика
- **useCanvasRenderer**: Canvas отрисовка
- **useAchievement**: Система достижений 