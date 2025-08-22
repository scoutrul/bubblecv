# ACTIVE CONTEXT

## Current Focus
- **Mode**: VAN (Visual Analysis & Navigation)
- **Task**: Анализ текущего состояния проекта и навигация по кодовой базе

## Recent Activity
- Пользователь запросил VAN режим
- Создана структура Memory Bank
- Проанализирован API (src/api/index.ts)
- Изучены типы и утилиты нормализации
- Анализ canvas архитектуры и use cases
- Изучение физической симуляции и системы эффектов

## Complete System Architecture
- **Main Controller**: `useCanvas.ts` - оркестратор всей canvas логики
- **Core Use Case**: `CanvasUseCase.ts` - основная бизнес-логика canvas
- **Repository Pattern**: Разделение на Canvas, Physics, Effects, BubbleManager
- **Physics Engine**: D3.js force simulation с настраиваемыми параметрами по уровням
- **Effects System**: GSAP анимации, взрывы, частицы, плавающий текст

## Key System Insights
- **ID Management**: 
  - Skills: 0, 1, 2... (индекс)
  - Projects: 10000, 10001, 10002... (индекс + projectOffset)
  - Old: -1000, -1001, -1002... (отрицательные)
  - Philosophy: -(year * 100000 + questionHash)
- **Canvas Logic**: Философские пузыри добавляются динамически с учетом доступного места
- **Game Modes**: Career, Project, Retro режимы с разной логикой
- **Performance**: Оптимизация через shallow watching и clicker mode
- **Physics**: D3 force simulation с коллизиями, притяжением и отталкиванием
- **Effects**: Взрывы, частицы, анимации через GSAP

## Technical Implementation
- **Force Simulation**: center, collision, charge, attract силы
- **Level Scaling**: Физика настраивается по уровням игрока
- **Animation**: GSAP для плавных переходов и эффектов
- **Particle System**: Динамическое создание частиц при взрывах
- **Responsive Physics**: Адаптация к размеру canvas и HUD

## Next Steps
- Изучить игровую механику и систему прогрессии
- Анализ системы достижений и бонусов
- Понимание интеграции с UI компонентами
