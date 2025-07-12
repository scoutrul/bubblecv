# 📋 PLAN MEMO: Фаза 1 - Тестовая инфраструктура

## 🎯 ГОТОВО К IMPLEMENT 

**Задача**: Комплексное тестирование проекта (Level 4)  
**Фаза**: 1 из 5 - Настройка тестовой инфраструктуры  
**Время**: 4-6 часов | **Приоритет**: Критический

---

## 📦 ЧТО УСТАНОВИТЬ

```bash
npm install --save-dev @pinia/testing jest-canvas-mock @vitest/coverage-v8 msw @types/jest-canvas-mock
```

## 🔧 ЧТО НАСТРОИТЬ

1. **vite.config.ts** - добавить test конфигурацию
2. **src/test/setup.ts** - глобальные моки Canvas + GSAP
3. **src/test/helpers/** - Pinia, Canvas, GSAP утилиты
4. **src/test/fixtures/** - тестовые данные
5. **src/test/mocks/** - MSW handlers для API

## ✅ КРИТЕРИИ ГОТОВНОСТИ

- [ ] `npm run test` работает без ошибок
- [ ] Canvas API мокируется корректно
- [ ] GSAP моки функционируют
- [ ] Pinia testing helpers созданы  
- [ ] MSW обрабатывает API запросы
- [ ] Coverage reporting настроен

## 🚀 СЛЕДУЮЩАЯ ФАЗА

После завершения → **Фаза 2: Unit тесты stores + composables**

---

*Создано в PLAN режиме | 2024-12-28* 