# 🫧 Bubbles Resume

Интерактивное геймифицированное резюме Антона Шелехова с D3.js визуализацией и системой прогрессии.

## 🚀 Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
# 🚀 Главная команда: полный стек (сервер + клиент + автоматическая загрузка данных)
npm run dev
# ➜ Frontend: http://localhost:3000
# ➜ Backend:  http://localhost:3003

# Запуск только клиента (frontend)
npm run dev:client-only

# Запуск только сервера (backend)
npm run dev:server-only

# Ручная загрузка данных
npm run seed
```

### Сборка для продакшена
```bash
npm run build
npm run preview
```

## 🛠️ Технологический стек

### Frontend
- **Vue 3** - Reactive framework с Composition API
- **TypeScript** - Типизированный JavaScript
- **Vite** - Современный сборщик
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **D3.js** - Визуализация данных и анимации
- **GSAP** - Продвинутые анимации

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** + **better-sqlite3** - База данных
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 🏗️ Архитектура

Проект следует принципам **FSD (Feature-Sliced Design)** для максимальной декомпозиции компонентов:

```
src/
├── app/           # Конфигурация приложения
├── pages/         # Страницы (роуты)
├── widgets/       # Сложные UI блоки
├── features/      # Бизнес-логика
├── entities/      # Бизнес-сущности
└── shared/        # Переиспользуемый код
    ├── ui/        # UI компоненты
    ├── config/    # Конфигурации
    ├── types/     # TypeScript типы
    └── lib/       # Утилиты
```

## 🎮 Игровые механики

### Система опыта (XP)
- **25 XP** → Уровень 1: Базовая информация
- **50 XP** → Уровень 2: Детальная биография
- **75 XP** → Уровень 3: Контактная информация
- **100 XP** → Уровень 4: Эксклюзивный контент + Telegram

### Система жизней
- **3 жизни** стартовые
- **-1 жизнь** за неправильные ответы на философские вопросы
- **Game Over** при потере всех жизней

### Достижения
- Разблокировка за изучение технологий
- Бонусный XP за особые действия
- Коллекционирование Easter Eggs

## 🫧 Система пузырей

### Размеры по уровню экспертизы
- **Novice** (40px) - Новичок
- **Intermediate** (55px) - Средний уровень
- **Confident** (70px) - Уверенный
- **Expert** (85px) - Эксперт
- **Master** (100px) - Мастер

### Категории технологий
- **Foundation** - HTML, CSS, JavaScript
- **Framework** - Vue.js, React, Angular
- **Language** - TypeScript, Python, PHP
- **Tooling** - Webpack, Vite, Docker
- **Philosophy** - Easter Egg вопросы
- **Skill** - Мягкие навыки

## 📊 API Endpoints

### Пузыри
- `GET /api/bubbles` - Получить все пузыри
- `POST /api/seed` - Загрузить моковые данные

### Сессии
- `GET /api/session/:id` - Получить/создать сессию
- `PUT /api/session/:id` - Обновить сессию

### Здоровье
- `GET /api/health` - Проверка состояния API

## 🎨 Дизайн-система

### Цветовая схема
- **Primary**: `#667eea` (сине-фиолетовый)
- **Secondary**: `#764ba2` (фиолетовый)
- **Accent**: `#f093fb` (розовый)
- **Background**: `#0a0b0f` (темный)

### Анимации
- **Breathing** - для Easter Egg пузырей
- **Hover** - масштабирование на 110%
- **Shine** - эффект прогресс-бара
- **Glow** - свечение при наведении

## 🔧 Команды разработки

### 🚀 Основные команды
```bash
# 🎯 Главная команда разработки - полный стек
npm run dev

# Только frontend (порт 3000)
npm run dev:client-only

# Только backend (порт 3003)
npm run dev:server-only

# Очистка портов
npm run clean:ports
npm run kill:3000
npm run kill:3003
```

### 🧹 Качество кода
```bash
# Линтинг и форматирование
npm run lint
npm run format

# Проверка типов
npm run type-check
```

### 🧪 Тестирование
```bash
# Unit тесты
npm run test
npm run test:ui

# E2E тесты
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug
```

### 🌐 Серверные команды
```bash
# Frontend сервер (Vite dev server)
npm run client

# Backend сервер (Express API)
npm run server

# Загрузка тестовых данных в БД
npm run seed

# Автоматическая загрузка данных (с задержкой)
npm run seed:auto
```

## 📝 Статус разработки

- ✅ **Инициализация проекта** - Завершено
- ⏳ **Базовая структура** - В процессе
- ⏸️ **D3.js физика** - Ожидает
- ⏸️ **Геймификация** - Ожидает
- ⏸️ **Backend интеграция** - Ожидает

## 🤝 Контакты

**Anton Shelekhov**
- 📧 anton.shelekhov@gmail.com
- 🌐 [antonshelekhov.dev](https://antonshelekhov.dev)
- 💬 [@antonshelekhov](https://t.me/antonshelekhov)

---

*Создано с ❤️ и множеством кофе ☕*

## Система градации уровней экспертизы

Каждый пузырь имеет визуальную градацию по уровню экспертизы:

### Уровни экспертизы:

- **🔰 Новичок (novice)** - Светло-голубые пузыри, полупрозрачные, без эффектов
- **📈 Промежуточный (intermediate)** - Светло-зелёные пузыри с лёгким свечением  
- **💡 Уверенный (confident)** - Жёлтые пузыри с заметным свечением
- **⭐ Эксперт (expert)** - Фиолетовые пузыри с сильным свечением и толстой границей
- **👑 Мастер (master)** - Розово-золотые пузыри с градиентом, максимальным свечением и эффектом пульсации

### Визуальные отличия:

- **Размер**: Увеличивается с уровнем экспертизы
- **Цвет**: От светлых до насыщенных тонов
- **Свечение**: Интенсивность растёт с уровнем
- **Граница**: Толщина и цвет зависят от уровня
- **Эффекты**: Мастер-уровень имеет градиентную заливку и пульсацию

Все конфигурации хранятся в `src/shared/config/game-config.ts` в секции `EXPERTISE_LEVELS`. 