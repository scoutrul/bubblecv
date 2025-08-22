# PROJECT BRIEF: bubbleme

## Project Overview
bubbleme - это интерактивная игра-резюме, где пользователь взаимодействует с "пузырями" (bubbles), представляющими различные аспекты карьеры и опыта.

## Core Architecture
- **Frontend**: Vue 3 + TypeScript + Tailwind CSS
- **Canvas System**: Оркестратор архитектура с useCanvas.ts
- **State Management**: Pinia stores + Use Cases pattern
- **Testing**: Playwright для browser-based тестирования

## Key Components
- **BubbleCanvas**: Основной игровой интерфейс
- **Game HUD**: Отображение уровня, XP, жизней
- **Modals**: Достижения, бонусы, мемуары
- **Canvas Simulation**: Физика, эффекты, рендеринг

## Development Principles
- Самодокументируемый код через грамотный нейминг
- Стилизация через @apply директивы Tailwind в <style> блоках
- Адаптивность внутри компонентов
- Минимальные комментарии (только для сложных мест)
