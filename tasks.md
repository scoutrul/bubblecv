# TASKS - Single Source of Truth

## Current Task: VAN Mode Analysis
- **Status**: Completed
- **Mode**: VAN (Visual Analysis & Navigation)
- **Objective**: Анализ текущего состояния проекта и навигация по кодовой базе

## Completed Tasks
- ✅ Создание Memory Bank структуры
- ✅ Инициализация projectbrief.md
- ✅ Инициализация activeContext.md
- ✅ Анализ API структуры (src/api/index.ts)
- ✅ Понимание системы ID для проектов
- ✅ Изучение типов и утилит нормализации
- ✅ Анализ canvas архитектуры и use cases
- ✅ Изучение физической симуляции (D3.js force simulation)
- ✅ Анализ системы эффектов (GSAP анимации, частицы)
- ✅ Понимание игровой механики и архитектуры

## Key Findings Summary
- **ID System**: Умная система избежания коллизий между типами пузырей
- **Canvas Architecture**: Оркестратор паттерн с useCanvas.ts как главным контроллером
- **Physics Engine**: D3.js force simulation с настраиваемыми параметрами по уровням
- **Effects System**: GSAP анимации, взрывы, частицы, плавающий текст
- **Game Modes**: Career, Project, Retro режимы с разной логикой
- **Performance**: Оптимизация через shallow watching и clicker mode

## System Architecture Overview
- **API**: Локализованные данные (ru/en) с автоматическим переключением
- **Canvas**: Repository pattern с разделением на Canvas, Physics, Effects, BubbleManager
- **Use Cases**: Разделение бизнес-логики по доменам
- **State Management**: Pinia stores + Use Cases pattern
- **Rendering**: Canvas-based с физической симуляцией и эффектами

## VAN Mode Complete
Все задачи VAN режима выполнены. Система проанализирована и задокументирована в Memory Bank.

---

## PLAN (Level 3): DeepSeek Chat-bot

### Requirements Analysis
- **Цель**: Виджет чат-бота, отвечающий на вопросы об авторе, резюме, опыте, технологиях, проекте.
- **Сессии**: Не сохранять между открытиями. Каждый запуск — новая сессия.
- **UI**: Модалка в стилистике проекта; мобильный — на весь экран; десктоп — панель.
- **Расположение**: Виджет в левом верхнем углу рядом с существующим ClickerWidget.
- **Функционал**: 
  - Ввод вопроса, отображение истории диалога за текущий сеанс.
  - Быстрые подсказки (кнопки): «Ссылка на резюме», «Обо мне», «Технологии», «Проекты».
  - Индикация загрузки/ошибок.
- **Безопасность**: API-ключ через переменную окружения, без коммита.

### Components Affected
- **Новые**:
  - `src/api/deepseek.ts` — HTTP-клиент к DeepSeek.
  - `src/types/chat.ts` — типы сообщений/состояния.
  - `src/stores/chat.store.ts` — состояние чата на сеанс.
  - `src/usecases/chat/` — ChatRepository, AskQuestionUseCase, ChatUseCaseFactory, types.
  - `src/ui/modals/ChatBotModal.vue` — модальное окно чата.
  - `src/ui/widgets/chatbot/ChatWidget.vue` — кнопка-виджет в левом верхнем углу.
- **Изменяемые**:
  - `src/types/modals.ts` — добавить тип `chat` и приоритет.
  - `src/stores/modal.store.ts` — состояние/очередь для `chat`.
  - `src/ui/modals/ModalManager.vue` — рендер `ChatBotModal`.
  - `env.d.ts` / `env.example` — `VITE_DEEPSEEK_API_KEY`.
  - `src/i18n/locales/ru.json`, `en.json` — строки UI чата.

### Architecture Considerations
- **Clean Architecture**: 
  - UI (Modal/Widget) → Composable/Store → UseCase → Repository → API.
  - Стор изолирует UI от бизнес-логики, UseCase инкапсулирует сценарии.
- **Queue/Modal System**: использовать существующий `modal.store` и `ModalManager`.
- **Styling**: Только классы, определённые в `<style>` с `@apply`; без инлайн Tailwind.
- **i18n**: Минимальные ключи для заголовков, плейсхолдеров, ошибок.

### Implementation Strategy
- **API слой**: отдельный модуль `deepseek.ts`, ключ из `import.meta.env.VITE_DEEPSEEK_API_KEY`.
- **Repository**: адаптер над `deepseek.ts`, нормализует ответ в `string`.
- **UseCase**: `AskQuestionUseCase` — принимает `question`, возвращает `answer`.
- **Store**: 
  - `messages: ChatMessage[]`, `isLoading`, `error`.
  - `startNewSession()` (очистка при открытии модалки).
  - `ask(question)` → диспатчит UseCase, пушит user/bot сообщения.
- **UI**:
  - `ChatWidget` → `modalStore.enqueueModal({ type: 'chat' ... })`.
  - `ChatBotModal` (на базе `BaseModal`): список сообщений, input, кнопка отправки, пресеты-вопросы.
  - Респонсив: мобайл фуллскрин; десктоп — компактная панель.

### IMPLEMENT MODE - COMPLETED ✅

#### Completed Implementation Steps:
1) ✅ **Env & типы** - `VITE_OPENAI_API_KEY` добавлен в `env.example` и `env.d.ts`
2) ✅ **API** - `src/api/openai.ts` создан с OpenRouter API (OpenAI совместимый)
3) ✅ **Use Cases** - `src/usecases/chat/` создан с Clean Architecture паттерном
4) ✅ **Store** - `src/stores/chat.store.ts` создан с Pinia store для состояния чата
5) ✅ **Modal Wiring** - `chat` добавлен в систему модалок с низким приоритетом
6) ✅ **UI Components** - `ChatBotModal.vue` и `ChatWidget.vue` созданы
7) ✅ **Modal Manager Integration** - `ChatBotModal` добавлен в `ModalManager.vue`
8) ✅ **GameScene Integration** - `ChatWidget` добавлен в левый верхний угол
9) ✅ **i18n** - Русские и английские строки добавлены
10) ✅ **Store Integration** - `chat.store` добавлен в основной экспорт
11) ✅ **API Integration** - `openai` API экспортирован
12) ✅ **API Migration** - Переход с DeepSeek на OpenRouter API (OpenAI совместимый)

#### Technical Implementation Details:
- **API Client**: `askOpenAI()` с OpenRouter API, таймаутом 30с, улучшенной обработкой ошибок
- **Use Cases**: `ChatRepository` → `AskQuestionUseCase` → `ChatUseCaseFactory`
- **Store**: Состояние чата на сеанс, методы `startNewSession()`, `ask()`, `clearError()`
- **UI**: Адаптивный дизайн (мобайл: 100vw/100vh, десктоп: 520px × 80vh)
- **Modal System**: Интеграция с существующей очередью модалок, приоритет 20
- **Styling**: Только через `@apply` директивы в `<style>` блоках
- **i18n**: Полная локализация на русский и английский
- **CSS Fix**: Исправлена ошибка с несуществующим классом `hover:bg-background-tertiary` → `hover:bg-background-card`
- **API Migration**: Переход на OpenRouter API для доступа к OpenAI моделям через единую точку входа
- **Dynamic Context**: Автоматический сбор контекста из данных проекта для всех запросов
- **Auto-scroll**: Улучшенный автоскролл к последнему сообщению
- **Clickable Links**: Автоматическое преобразование ссылок в кликабельные элементы
- **Role Update**: Чат-бот теперь агент автора для посетителей (от третьего лица)
- **Resume Link Fix**: Исправлена ссылка на резюме: `/cv/Резюме — Головачев Антон.pdf`
- **Link Duplication Fix**: Исправлено дублирование и поломка ссылок в сообщениях
- **Markdown Links Support**: Добавлена поддержка markdown ссылок [текст](ссылка) от бота
- **Author Focus**: Бот теперь фокусируется только на авторе и проекте, мягко отклоняя нерелевантные вопросы
- **Auto-scroll Enhancement**: Улучшен автоскролл - теперь плавно скроллит к ответам бота

#### Files Created/Modified:
- **New**: `src/api/openai.ts`, `src/types/chat.ts`, `src/stores/chat.store.ts`
- **New**: `src/usecases/chat/*`, `src/ui/modals/ChatBotModal.vue`, `src/ui/widgets/chatbot/ChatWidget.vue`
- **Modified**: `env.example`, `env.d.ts`, `src/types/modals.ts`, `src/stores/modal.store.ts`
- **Modified**: `src/ui/modals/ModalManager.vue`, `src/ui/shared/GameScene.vue`
- **Modified**: `src/i18n/locales/{ru,en}.json`, `src/stores/index.ts`, `src/api/index.ts`
- **Deleted**: `src/api/deepseek.ts` (заменен на `openai.ts`)

#### API Migration Details:
- **From**: DeepSeek API (платный доступ)
- **To**: OpenRouter API (OpenAI совместимый, более доступный)
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Model**: `openai/gpt-3.5-turbo` (баланс качества и стоимости)
- **Headers**: Добавлены `HTTP-Referer` и `X-Title` для OpenRouter атрибуции
- **Error Handling**: Улучшена обработка специфичных ошибок API (401, 429)
- **Timeout**: Увеличен до 30 секунд для стабильности

### Next Steps - Testing & Validation
- **Smoke Test**: Открыть/закрыть модалку, отправить вопрос, получить ответ
- **API Test**: Проверить работу с DeepSeek API (требует `VITE_DEEPSEEK_API_KEY`)
- **UI Test**: Проверить адаптивность на мобильных и десктопных устройствах
- **Integration Test**: Проверить работу с системой модалок и очередью

### Security Notes
- API ключ должен быть установлен в `.env.local` как `VITE_DEEPSEEK_API_KEY=sk-...`
- Ключ не коммитится в репозиторий (уже добавлен в `.gitignore`)
- Обработка ошибок скрывает детали API ответов от пользователя
