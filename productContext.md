# Product Context - Bubbles Resume

## 📋 Техническая спецификация

### 🏗️ Архитектура приложения

```
bubbleme/
├── frontend/               # Vue 3 приложение
│   ├── src/
│   │   ├── components/     # Vue компоненты
│   │   ├── composables/    # Composition API логика
│   │   ├── stores/         # Pinia стейт менеджмент
│   │   ├── utils/          # Утилиты
│   │   └── assets/         # Статические ресурсы
├── backend/                # Node.js сервер
│   ├── database/           # SQLite схемы и миграции
│   ├── api/                # REST API endpoints
│   └── services/           # Бизнес логика
└── docs/                   # Документация проекта
```

## 🎯 АРХИТЕКТУРНЫЕ ПРИНЦИПЫ КОДА

### 📋 Структурирование по FSD + DDD

#### Feature-Sliced Design слои:
```
📁 app/      ← инициализация (providers, layouts, глобальные стили)
📁 pages/    ← страницы и роутинг
📁 widgets/  ← крупные составные блоки (BubbleCanvas, GameHUD)
📁 features/ ← бизнес-функции (gamification, bubble-interaction)  
📁 entities/ ← сущности домена (bubble, user-session, achievement)
📁 shared/   ← переиспользуемое (UI kit, утилиты, API, конфиги)
```

#### Smart Containers + Dumb Presentational:
- **Smart Components** → связаны со store, содержат бизнес-логику
- **Dumb Components** → только UI, получают данные через props
- **Максимальная декомпозиция** → каждый компонент делает одну вещь

### 🎨 Единая дизайн-система

#### Компоненты типографики:
```vue
<Text variant="heading" size="large" color="primary">
<Heading level="1" size="xl">
<Label size="small" color="muted">
<Caption variant="description">
```

#### Глобальные конфигурации:
```typescript
// shared/config/ui-config.ts
export const UI_CONFIG = {
  COLORS: { /* палитра */ },
  TYPOGRAPHY: { /* шрифты и размеры */ },
  ANIMATIONS: { /* timing и easing */ }
} as const

// shared/config/game-config.ts  
export const GAME_CONFIG = {
  XP: { BASIC_BUBBLE: 1, EXPERT_BUBBLE: 5 },
  LIVES: { INITIAL: 3, PHILOSOPHY_PENALTY: 1 }
} as const
```

### 🔧 Технические стандарты

#### Валидация через Joi:
```typescript
import { BubbleSchema, SessionSchema } from '@/shared/lib/validation'

// Все входящие данные валидируются
const validatedBubble = BubbleSchema.validate(rawBubbleData)
```

#### GSAP для всех анимаций:
```typescript
import { GSAPPresets } from '@/shared/lib/animations'

// Готовые пресеты анимаций
GSAPPresets.bubbleAppear(element)
GSAPPresets.xpBarFill(element, progress)
```

#### Никаких Magic Numbers:
```typescript
// ❌ НЕ ТАК
if (xp >= 25) { showLevel1() }
bubble.size = 50

// ✅ ТАК  
if (xp >= GAME_CONFIG.XP.LEVEL_THRESHOLDS[1]) { showLevel1() }
bubble.size = BUBBLE_CONFIG.DEFAULT_SIZE
```

### 📦 Модульность и композиция

#### ES Modules везде:
```typescript
export const config = { ... } as const
import { config } from '@/shared/config'
```

#### Композиция вместо наследования:
```typescript
// Composables для переиспользования логики
export function useBubblePhysics() {
  const d3Simulation = useD3ForceSimulation()
  const gsapAnimations = useGSAPAnimations()
  
  return { ...d3Simulation, ...gsapAnimations }
}
```

#### Строгая типизация:
```typescript
interface BubbleConfig {
  readonly id: string
  readonly level: 'novice' | 'intermediate' | 'confident' | 'expert' | 'master'
}

// Вместо any - конкретные типы
function processBubble(bubble: BubbleConfig): ProcessedBubble
```

## 🎯 Детальные требования

### Компонентная архитектура

#### 1. BubbleCanvas
**Назначение**: Основной холст для визуализации пузырей
**Технологии**: Vue 3 + D3.js
**Функциональность**:
- Рендеринг D3 force simulation
- Обработка кликов и hover эффектов
- Анимации появления/исчезновения пузырей
- Адаптивное масштабирование

```vue
<BubbleCanvas 
  :bubbles="filteredBubbles"
  :year="currentYear"
  @bubble-click="handleBubbleClick"
  @bubble-hover="handleBubbleHover"
/>
```

#### 2. TimeSlider
**Назначение**: Контрол временной линии
**Функциональность**:
- Слайдер от 2000 до текущего года
- Плавная анимация перехода между годами
- Отображение ключевых вех

```vue
<TimeSlider 
  :min-year="2000"
  :max-year="new Date().getFullYear()"
  v-model:current-year="currentYear"
/>
```

#### 3. GameHUD
**Назначение**: Игровой интерфейс в правой части
**Структура**:
- XP Bar (прогресс опыта)
- Lives Counter (счетчик жизней)
- Achievements Panel (достижения)
- Level Indicator (текущий уровень)

#### 4. BubbleDetail
**Назначение**: Модальное окно с подробностями
**Функциональность**:
- Детальное описание навыка
- Кейсы использования
- Ссылки на проекты
- Начисление XP за просмотр

### 🗄️ Схема базы данных

```sql
-- Основная таблица пузырей
CREATE TABLE bubbles (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  year INTEGER NOT NULL,
  size INTEGER DEFAULT 50,
  level TEXT CHECK(level IN ('novice','intermediate','confident','expert','master')),
  category TEXT,
  description TEXT,
  insight TEXT,
  project_link TEXT,
  points INTEGER DEFAULT 1,
  is_easter_egg BOOLEAN DEFAULT FALSE,
  color_override TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Связи между пузырями
CREATE TABLE bubble_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_bubble_id TEXT,
  to_bubble_id TEXT,
  strength REAL DEFAULT 0.5,
  FOREIGN KEY (from_bubble_id) REFERENCES bubbles(id),
  FOREIGN KEY (to_bubble_id) REFERENCES bubbles(id)
);

-- Достижения пользователей
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_threshold INTEGER,
  unlock_level INTEGER,
  is_secret BOOLEAN DEFAULT FALSE
);

-- Прогресс пользователей (session-based)
CREATE TABLE user_sessions (
  session_id TEXT PRIMARY KEY,
  current_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 0,
  lives_remaining INTEGER DEFAULT 3,
  bubbles_viewed TEXT, -- JSON array of viewed bubble IDs
  achievements_unlocked TEXT, -- JSON array of achievement IDs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Философские вопросы (Easter Eggs)
CREATE TABLE philosophy_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  agree_response TEXT,
  disagree_response TEXT,
  agree_xp_bonus INTEGER DEFAULT 10,
  disagree_life_penalty INTEGER DEFAULT 1,
  category TEXT
);
```

## 🎮 Геймификация - детальная спецификация

### Система очков (XP)
- **Базовые очки**: 1-5 XP за просмотр обычного пузыря
- **Бонусные очки**: 10-20 XP за просмотр ключевых технологий
- **Философские бонусы**: 15-25 XP за согласие с принципами
- **Штрафы**: -1 жизнь за критические разногласия

### Уровневая система
```javascript
const LEVEL_THRESHOLDS = {
  1: 25,   // 25% от максимального XP
  2: 50,   // 50% от максимального XP  
  3: 75,   // 75% от максимального XP
  4: 100   // 100% от максимального XP
};
```

### Контент по уровням
- **Level 0**: Только пузыри с технологиями
- **Level 1**: + Имя "Антон Шелехов" + фото
- **Level 2**: + Биография и подход к работе
- **Level 3**: + Форма "Давайте работать вместе"
- **Level 4**: + Прямой контакт в Telegram

## 🎨 UI/UX Спецификация

### Анимации и переходы
- **Пузыри**: постоянное легкое покачивание (breathing effect)
- **Появление**: scale from 0 to 1 с ease-out
- **Исчезновение**: fade out с scale to 0
- **Hover**: увеличение на 10% с glow эффектом
- **Клик**: pulse анимация

### Респонсив
```css
/* Desktop: полная версия */
@media (min-width: 1024px) {
  .bubble-canvas { width: 100vw; height: 100vh; }
  .game-hud { position: fixed; right: 20px; bottom: 20px; }
}

/* Tablet: упрощенная версия */
@media (min-width: 768px) and (max-width: 1023px) {
  .bubble-canvas { height: 80vh; }
  .game-hud { position: relative; margin-top: 20px; }
}

/* Mobile: минимальная версия */
@media (max-width: 767px) {
  .bubble-canvas { height: 60vh; }
  .time-slider { font-size: 14px; }
}
```

### Состояния пузырей
```javascript
const BUBBLE_STATES = {
  HIDDEN: 'hidden',      // Еще не появился в таймлайне
  EMERGING: 'emerging',  // Появляется
  ACTIVE: 'active',      // Полностью видим и активен
  FADING: 'fading',      // Исчезает
  INACTIVE: 'inactive'   // Временно неактивен
};
```

## 🔄 Пользовательские сценарии

### Сценарий 1: Первое посещение
1. Пользователь попадает на страницу
2. Видит анимированные пузыри и HUD
3. Интуитивно начинает кликать по пузырям
4. Получает первые XP и открывает Level 1
5. Узнает имя автора

### Сценарий 2: Изучение временной линии
1. Пользователь двигает слайдер времени
2. Наблюдает эволюцию навыков
3. Видит появление новых технологий
4. Понимает профессиональный путь

### Сценарий 3: Философское тестирование
1. Пользователь кликает на Easter Egg пузырь
2. Видит вопрос о тестовых заданиях
3. Выбирает "Согласен" → получает бонус
4. Или выбирает "Не согласен" → теряет жизнь

### Сценарий 4: Максимальный уровень
1. Пользователь набирает 100% XP
2. Открывается финальный контакт
3. Доступна отправка сообщения в Telegram
4. Завершение "игры"

## 📊 Метрики и аналитика

### Отслеживаемые события
- `bubble_view`: просмотр пузыря
- `bubble_click`: клик по пузырю  
- `timeline_change`: изменение года на таймлайне
- `level_up`: повышение уровня
- `achievement_unlock`: получение достижения
- `philosophy_answer`: ответ на философский вопрос
- `contact_form_submit`: отправка формы контакта

### KPI
- **Engagement Rate**: % пользователей достигших Level 2+
- **Completion Rate**: % пользователей достигших Level 4
- **Philosophy Alignment**: % согласившихся с принципами
- **Average Session Time**: среднее время на сайте
- **Bubble Click Rate**: среднее количество кликов по пузырям 