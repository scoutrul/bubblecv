/**
 * Тестовые фикстуры для философских вопросов
 */
import type { PhilosophyQuestion } from '@shared/types';

export interface TestPhilosophyQuestion extends PhilosophyQuestion {
  // Поле insight используется в старых тестах, сохраним его для обратной совместимости
  insight: string; 
  category?: string;
}

export const mockPhilosophyQuestions: TestPhilosophyQuestion[] = [
  {
    id: "creativity-vs-structure",
    question: "Что важнее в разработке: творческий подход или следование структуре?",
    options: [
      "Творческий подход - он ведет к инновациям",
      "Структура - она обеспечивает надежность",
      "Баланс между ними"
    ],
    insight: "В разработке важен баланс между творчеством и дисциплиной. Структура создает фундамент для творчества.",
    category: "development",
    context: "Размышления о методологиях разработки.",
    agreeText: "Согласен",
    disagreeText: "Не согласен",
    correctAnswer: "agree",
    explanation: "Объяснение, почему этот ответ считается верным.",
    points: 20
  },
  {
    id: "code-vs-documentation",
    question: "Что лучше характеризует качественный код?",
    options: [
      "Самодокументируемый код",
      "Хорошо прокомментированный код",
      "Оптимизированный по производительности"
    ],
    insight: "Качественный код объясняет 'что' через структуру и 'почему' через комментарии.",
    category: "code-quality",
    context: "Вопрос о читаемости и поддержке кода.",
    agreeText: "Верно",
    disagreeText: "Неверно",
    correctAnswer: "agree",
    explanation: "Объяснение ответа.",
    points: 25
  },
  {
    id: "learning-approach",
    question: "Какой подход к изучению новых технологий наиболее эффективен?",
    options: [
      "Глубокое изучение одной технологии",
      "Поверхностное изучение многих технологий",
      "Изучение через практические проекты"
    ],
    insight: "Эффективное обучение сочетает практику с пониманием фундаментальных принципов.",
    category: "learning",
    context: "Стратегии профессионального роста.",
    agreeText: "Поддерживаю",
    disagreeText: "Оспариваю",
    correctAnswer: "agree",
    explanation: "Объяснение.",
    points: 30
  }
];

const baseTestQuestion: Omit<TestPhilosophyQuestion, 'id' | 'question' | 'options' | 'insight' | 'category'> = {
  context: "Базовый контекст для тестов",
  agreeText: "Да",
  disagreeText: "Нет",
  correctAnswer: "agree",
  explanation: "Базовое объяснение.",
  points: 10
};

export const mockSimpleQuestion: TestPhilosophyQuestion = {
  ...baseTestQuestion,
  id: "simple-test",
  question: "Простой тестовый вопрос?",
  options: ["Да", "Нет"],
  insight: "Простая мудрость для простого вопроса",
  category: "test"
};

/**
 * Создает философский вопрос с кастомными параметрами
 */
export function createCustomQuestion(overrides: Partial<TestPhilosophyQuestion>): TestPhilosophyQuestion {
  return {
    ...baseTestQuestion,
    id: "custom-question",
    question: "Кастомный тестовый вопрос?",
    options: ["Вариант 1", "Вариант 2"],
    insight: "Кастомная мудрость",
    category: "custom",
    ...overrides
  };
}

/**
 * Создает набор вопросов для тестирования пагинации
 */
export function createMultipleQuestions(count = 10): TestPhilosophyQuestion[] {
  return Array.from({ length: count }, (_, index) => ({
    ...baseTestQuestion,
    id: `question-${index}`,
    question: `Тестовый вопрос ${index}?`,
    options: [
      `Вариант A для вопроса ${index}`,
      `Вариант B для вопроса ${index}`,
      `Вариант C для вопроса ${index}`
    ],
    insight: `Мудрость для вопроса ${index}`,
    category: "test"
  }));
}

/**
 * Создает вопрос с определенным количеством опций
 */
export function createQuestionWithOptions(optionCount: number): TestPhilosophyQuestion {
  const options = Array.from({ length: optionCount }, (_, index) => `Вариант ${index + 1}`);

  return {
    ...baseTestQuestion,
    id: "multi-option-question",
    question: `Вопрос с ${optionCount} вариантами ответа?`,
    options,
    insight: "Больше выбора - больше возможностей для размышлений",
    category: "multi-choice"
  };
} 