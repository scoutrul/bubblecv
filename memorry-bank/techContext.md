# 🏗️ Техническая архитектура - Bubbles Resume

## 🎯 Архитектурные принципы

### Разделение ответственности (Separation of Concerns)

**Принцип MVC адаптированный под Vue 3 Composition API:**

```
📦 Архитектурные слои
├── 🔗 API Layer        → Загрузка данных
├── 🗄️ Store Layer      → Состояние и кэширование  
├── 🧩 Composable Layer → Бизнес-логика
└── 🎨 View Layer       → Презентация и UI
```

#### Model: Pinia Stores
- **Ответственность**: Данные, состояние, кэширование
- **Что НЕ делает**: Бизнес-логика, UI взаимодействие
- **Принцип**: Single Source of Truth

#### ViewModel: Composables  
- **Ответственность**: Бизнес-логика, преобразование данных
- **Связывает**: Store ↔ View компоненты
- **Управляет**: Игровыми правилами, побочными эффектами

#### View: Vue Components
- **Ответственность**: Рендеринг, пользовательский ввод
- **Принцип**: Dumb Components
- **Получают данные**: Только через composables

### Центральная композиция useApp()

```typescript
// Главный связующий слой
const useApp = () => {
  // Агрегирует все composables
  // Управляет инициализацией
  // Предоставляет унифицированный API
}
```

## 📁 Структура проекта

```
src/
├── api/           # HTTP клиент, загрузка данных
├── stores/        # Pinia хранилища состояния
├── composables/   # Бизнес-логика приложения
├── ui/           # Vue компоненты презентации
├── utils/        # Утилитарные функции
├── config/       # Конфигурация игры
├── data/         # JSON файлы с данными
└── types/        # TypeScript типы
```

## 🔄 Поток данных

```
JSON Data → API → Store → Composable → Component
    ↓         ↓      ↓        ↓         ↓
  skills.json → → bubble.store → useBubbleManager → BubbleCanvas
```

## 🗄️ Слой данных

### JSON источники данных
```
src/data/
├── skills.json        # Технологии и навыки
├── achievements.json  # Система достижений  
├── levels.json       # Игровые уровни
├── questions.json    # Философские вопросы
└── skill-levels.json # Уровни экспертизы
```

### Нормализация данных
```typescript
// Сырые данные → Рантайм структуры
Raw JSON → Normalization Functions → Typed Runtime Data
```

### Типизация
- **Строгая типизация** всех структур данных
- **Runtime validation** для JSON данных
- **Shared types** между слоями

## 🧩 Composables архитектура

### Core Composables
```typescript
// Центральная композиция
useApp()           // Главная композиция приложения
useUi()           // UI состояние и взаимодействие

// Canvas и физика
useBubbleCanvas()     // Canvas рендеринг
useBubbleManager()    // Управление пузырями
usePhysicsSimulation() // Физическая симуляция
useCanvasRenderer()   // Оптимизированная отрисовка
useCanvasEffects()    // GSAP анимации
useCanvasInteraction() // Взаимодействие с пузырями

// Игровая логика
useAchievement()      // Система достижений
```

### Принципы композиций
- **Одна ответственность** на композицию
- **Минимальные зависимости** между композициями
- **Реактивность** через Vue 3 reactivity system

## 🎮 Игровая механика

### Система XP и достижений
```typescript
// Игровые правила в config/index.ts
GAME_CONFIG = {
  levelRequirements: { 1: 22, 2: 44, 3: 66, 4: 88, 5: 110 },
  bubbleXP: { regular: 3, philosophy: 10, tough: 1 },
  startingLives: 3
}
```

### Состояние игры
- **Session Store**: XP, уровень, жизни, прогресс
- **Bubble Store**: Состояние пузырей, посещенные
- **Achievement Store**: Разблокированные достижения

## 🎨 UI Components

### Структура компонентов
```
ui/
├── global/        # Переиспользуемые компоненты
├── hud/          # Игровой интерфейс
├── modals/       # Модальные окна
├── achievements/ # Система достижений
└── timeline/     # Временная шкала
```

### Принципы компонентов
- **Props down, events up**
- **Minimal business logic**
- **Композиция через useApp()**

## ⚡ Производительность

### Canvas оптимизация
- **RequestAnimationFrame** для плавных анимаций
- **Object pooling** для эффектов
- **Batched updates** для DOM изменений

### GSAP интеграция
- **Hardware acceleration** через CSS transforms
- **Timeline управление** анимациями
- **Performance monitoring** для адаптации качества

## 🔮 Планы развития

### Рефакторинг стадии
1. **Типизация** - расширение type safety
2. **Store рефакторинг** - оптимизация состояния  
3. **Composable разделение** - детализация ответственности
4. **Performance оптимизация** - Canvas и анимации

### Архитектурные улучшения
- **Dependency injection** для композиций
- **State machine** для игровых состояний
- **Plugin система** для расширений 