# Tech Context - Bubbles Resume

## 🏗️ Техническая архитектура

### Стек технологий

#### Frontend Stack
```json
{
  "framework": "Vue 3.4+",
  "build": "Vite 5.x",
  "styling": "Tailwind CSS 3.x",
  "visualization": "D3.js 7.x",
  "state": "Pinia 2.x",
  "animations": "GSAP 3.x",
  "typeScript": "TypeScript 5.x",
  "testing": "Vitest + Vue Test Utils",
  "validation": "joi 17.x",
  "modules": "ES Modules"
}
```

#### Backend Stack
```json
{
  "runtime": "Node.js 20+",
  "database": "SQLite 3 + better-sqlite3",
  "api": "Express.js",
  "cors": "cors middleware",
  "validation": "joi или zod",
  "logging": "winston"
}
```

## 📦 Структура проекта (FSD + DDD архитектура)

```
bubbleme/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.example
├── README.md
│
├── frontend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   │
│   │   ├── app/                        # App layer (инициализация)
│   │   │   ├── providers/
│   │   │   │   ├── router.ts
│   │   │   │   ├── store.ts
│   │   │   │   └── gsap.ts
│   │   │   ├── layouts/
│   │   │   │   └── DefaultLayout.vue
│   │   │   └── styles/
│   │   │       └── main.css
│   │   │
│   │   ├── pages/                      # Pages layer
│   │   │   └── bubble-resume/
│   │   │       ├── ui/
│   │   │       │   └── BubbleResumePage.vue
│   │   │       └── model/
│   │   │           └── page-store.ts
│   │   │
│   │   ├── widgets/                    # Widgets layer (крупные блоки)
│   │   │   ├── bubble-canvas/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── BubbleCanvas.vue
│   │   │   │   │   └── BubbleCanvasContainer.vue
│   │   │   │   ├── model/
│   │   │   │   │   └── canvas-store.ts
│   │   │   │   └── lib/
│   │   │   │       └── physics-engine.ts
│   │   │   ├── game-hud/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── GameHUD.vue
│   │   │   │   │   ├── XPBarContainer.vue
│   │   │   │   │   ├── LivesContainer.vue
│   │   │   │   │   └── AchievementsContainer.vue
│   │   │   │   └── model/
│   │   │   │       └── hud-store.ts
│   │   │   └── time-slider/
│   │   │       ├── ui/
│   │   │       │   ├── TimeSlider.vue
│   │   │       │   └── TimeSliderContainer.vue
│   │   │       └── model/
│   │   │           └── timeline-store.ts
│   │   │
│   │   ├── features/                   # Features layer (бизнес-функции)
│   │   │   ├── bubble-interaction/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── BubbleDetailModal.vue
│   │   │   │   │   └── BubbleTooltip.vue
│   │   │   │   ├── model/
│   │   │   │   │   └── interaction-store.ts
│   │   │   │   └── api/
│   │   │   │       └── bubble-api.ts
│   │   │   ├── gamification/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── XPProgressBar.vue
│   │   │   │   │   ├── LevelUpModal.vue
│   │   │   │   │   └── AchievementNotification.vue
│   │   │   │   ├── model/
│   │   │   │   │   ├── xp-store.ts
│   │   │   │   │   └── achievement-store.ts
│   │   │   │   └── lib/
│   │   │   │       └── xp-calculator.ts
│   │   │   ├── philosophy-challenge/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── PhilosophyModal.vue
│   │   │   │   │   └── LifeCounter.vue
│   │   │   │   ├── model/
│   │   │   │   │   └── philosophy-store.ts
│   │   │   │   └── api/
│   │   │   │       └── philosophy-api.ts
│   │   │   └── profile-unlock/
│   │   │       ├── ui/
│   │   │       │   ├── ProfileModal.vue
│   │   │       │   ├── ContactForm.vue
│   │   │       │   └── UnlockAnimation.vue
│   │   │       ├── model/
│   │   │       │   └── profile-store.ts
│   │   │       └── lib/
│   │   │           └── unlock-logic.ts
│   │   │
│   │   ├── entities/                   # Entities layer (сущности)
│   │   │   ├── bubble/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── BubbleItem.vue
│   │   │   │   │   └── BubbleGroup.vue
│   │   │   │   ├── model/
│   │   │   │   │   ├── bubble-store.ts
│   │   │   │   │   └── bubble-types.ts
│   │   │   │   ├── api/
│   │   │   │   │   └── bubble-service.ts
│   │   │   │   └── lib/
│   │   │   │       ├── bubble-factory.ts
│   │   │   │       └── bubble-validator.ts
│   │   │   ├── user-session/
│   │   │   │   ├── model/
│   │   │   │   │   ├── session-store.ts
│   │   │   │   │   └── session-types.ts
│   │   │   │   ├── api/
│   │   │   │   │   └── session-service.ts
│   │   │   │   └── lib/
│   │   │   │       └── session-manager.ts
│   │   │   └── achievement/
│   │   │       ├── ui/
│   │   │       │   ├── AchievementCard.vue
│   │   │       │   └── AchievementBadge.vue
│   │   │       ├── model/
│   │   │       │   └── achievement-types.ts
│   │   │       └── lib/
│   │   │           └── achievement-rules.ts
│   │   │
│   │   ├── shared/                     # Shared layer (переиспользуемое)
│   │   │   ├── ui/                     # Дизайн-система
│   │   │   │   ├── typography/
│   │   │   │   │   ├── Text.vue
│   │   │   │   │   ├── Heading.vue
│   │   │   │   │   ├── Label.vue
│   │   │   │   │   └── Caption.vue
│   │   │   │   ├── buttons/
│   │   │   │   │   ├── Button.vue
│   │   │   │   │   ├── IconButton.vue
│   │   │   │   │   └── LinkButton.vue
│   │   │   │   ├── inputs/
│   │   │   │   │   ├── Input.vue
│   │   │   │   │   ├── Textarea.vue
│   │   │   │   │   └── Slider.vue
│   │   │   │   ├── modals/
│   │   │   │   │   ├── Modal.vue
│   │   │   │   │   ├── ModalHeader.vue
│   │   │   │   │   └── ModalContent.vue
│   │   │   │   ├── animations/
│   │   │   │   │   ├── FadeTransition.vue
│   │   │   │   │   ├── SlideTransition.vue
│   │   │   │   │   └── ScaleTransition.vue
│   │   │   │   └── icons/
│   │   │   │       ├── Icon.vue
│   │   │   │       └── GameIcon.vue
│   │   │   ├── lib/                    # Утилиты и хелперы
│   │   │   │   ├── animations/
│   │   │   │   │   ├── gsap-presets.ts
│   │   │   │   │   ├── timeline-utils.ts
│   │   │   │   │   └── easing-functions.ts
│   │   │   │   ├── d3/
│   │   │   │   │   ├── force-simulation.ts
│   │   │   │   │   ├── physics-helpers.ts
│   │   │   │   │   └── svg-utils.ts
│   │   │   │   ├── validation/
│   │   │   │   │   ├── joi-schemas.ts
│   │   │   │   │   └── form-validators.ts
│   │   │   │   ├── storage/
│   │   │   │   │   ├── local-storage.ts
│   │   │   │   │   └── session-storage.ts
│   │   │   │   └── utils/
│   │   │   │       ├── color-utils.ts
│   │   │   │       ├── math-utils.ts
│   │   │   │       ├── string-utils.ts
│   │   │   │       └── date-utils.ts
│   │   │   ├── api/                    # API слой
│   │   │   │   ├── client.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── interceptors.ts
│   │   │   ├── config/                 # Конфигурации
│   │   │   │   ├── game-config.ts
│   │   │   │   ├── ui-config.ts
│   │   │   │   ├── animation-config.ts
│   │   │   │   ├── api-config.ts
│   │   │   │   └── constants.ts
│   │   │   └── types/                  # Глобальные типы
│   │   │       ├── global.ts
│   │   │       ├── api.ts
│   │   │       └── common.ts
│   │   │
│   │   └── assets/
│   │       ├── icons/
│   │       ├── images/
│   │       └── fonts/
│   │
│   └── public/
│       ├── favicon.ico
│       └── manifest.json
│
├── backend/
│   ├── src/
│   │   ├── app/                        # DDD Application layer
│   │   │   ├── commands/
│   │   │   ├── queries/
│   │   │   └── handlers/
│   │   ├── domain/                     # DDD Domain layer
│   │   │   ├── bubble/
│   │   │   ├── session/
│   │   │   └── achievement/
│   │   ├── infrastructure/             # DDD Infrastructure layer
│   │   │   ├── database/
│   │   │   ├── api/
│   │   │   └── services/
│   │   └── config/
│   │       └── database.js
│   └── database.sqlite
│
└── docs/
    ├── architecture.md
    ├── coding-standards.md
    ├── api.md
    └── deployment.md
```

## 🏗️ Архитектурные принципы и правила кода

### 📋 CORE PRINCIPLES

#### 1. Feature-Sliced Design (FSD) + Domain-Driven Design (DDD)
```
📁 app/      - Инициализация приложения (providers, layouts)
📁 pages/    - Страницы приложения (routing)  
📁 widgets/  - Крупные составные блоки UI
📁 features/ - Бизнес-функции (bounded contexts)
📁 entities/ - Бизнес-сущности (domain models)
📁 shared/   - Переиспользуемый код (UI kit, utils, API)
```

#### 2. Smart Containers vs Dumb Presentational Components
```typescript
// Smart Container - связан с store и API
// widgets/bubble-canvas/ui/BubbleCanvasContainer.vue
<template>
  <BubbleCanvas 
    :bubbles="filteredBubbles"
    :is-loading="isLoading"
    @bubble-click="handleBubbleClick"
  />
</template>

<script setup lang="ts">
import { useBubbleStore } from '@/entities/bubble'
import { useGameStore } from '@/features/gamification'

// Только логика, никакой презентации
const bubbleStore = useBubbleStore()
const gameStore = useGameStore()

const filteredBubbles = computed(() => 
  bubbleStore.getBubblesByYear(gameStore.currentYear)
)

const handleBubbleClick = (bubble: Bubble) => {
  gameStore.addXP(bubble.points)
  // бизнес-логика
}
</script>

// Dumb Presentational - только UI и пропсы
// entities/bubble/ui/BubbleCanvas.vue
<template>
  <svg>
    <BubbleItem 
      v-for="bubble in bubbles"
      :key="bubble.id"
      :bubble="bubble"
      @click="$emit('bubble-click', bubble)"
    />
  </svg>
</template>

<script setup lang="ts">
// Только типы и эмиты, никакой бизнес-логики
interface Props {
  bubbles: Bubble[]
  isLoading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'bubble-click': [bubble: Bubble]
}>()
</script>
```

#### 3. Максимальная декомпозиция компонентов
```typescript
// НЕ ТАК - монолитный компонент
<GameHUD>
  <div class="xp-bar">...</div>
  <div class="lives-counter">...</div>
  <div class="achievements">...</div>
</GameHUD>

// ТАК - атомарные компоненты
<GameHUD>
  <XPProgressBar :value="xp" :max="maxXP" />
  <LivesCounter :lives="lives" />
  <AchievementsList :achievements="achievements" />
</GameHUD>
```

#### 4. Единая дизайн-система с типографикой
```vue
<!-- shared/ui/typography/Text.vue -->
<template>
  <component 
    :is="tag"
    :class="textClasses"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { TEXT_VARIANTS, TEXT_SIZES } from '@/shared/config/ui-config'

interface Props {
  variant?: keyof typeof TEXT_VARIANTS
  size?: keyof typeof TEXT_SIZES
  color?: string
  tag?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'body',
  size: 'medium',
  tag: 'p'
})

const textClasses = computed(() => [
  TEXT_VARIANTS[props.variant],
  TEXT_SIZES[props.size],
  props.color && `text-${props.color}`
])
</script>

<!-- Использование -->
<Text variant="heading" size="large" color="primary">
  Bubbles Resume
</Text>
```

### 🔧 ТЕХНИЧЕСКИЕ СТАНДАРТЫ

#### 1. ES Modules везде
```typescript
// Вместо CommonJS
export const GAME_CONFIG = {
  maxXP: 100,
  maxLives: 3
} as const

// Вместо require
import { GAME_CONFIG } from '@/shared/config/game-config'
```

#### 2. Никаких Magic Numbers - всё в константы
```typescript
// shared/config/game-config.ts
export const GAME_CONFIG = {
  XP: {
    BASIC_BUBBLE: 1,
    EXPERT_BUBBLE: 5,
    PHILOSOPHY_BONUS: 15,
    LEVEL_THRESHOLDS: {
      1: 25,
      2: 50, 
      3: 75,
      4: 100
    }
  },
  LIVES: {
    INITIAL: 3,
    PHILOSOPHY_PENALTY: 1
  },
  BUBBLES: {
    MIN_SIZE: 10,
    MAX_SIZE: 100,
    COLLISION_PADDING: 5
  }
} as const

// shared/config/ui-config.ts
export const UI_CONFIG = {
  COLORS: {
    LEVELS: {
      novice: 'gray-400',
      intermediate: 'blue-400', 
      confident: 'emerald-400',
      expert: 'yellow-400',
      master: 'rose-500'
    },
    BACKGROUND: 'zinc-900',
    ACCENT: 'sky-400'
  },
  TYPOGRAPHY: {
    FONT_FAMILY: 'Inter, sans-serif',
    SIZES: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl'
    }
  },
  ANIMATIONS: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500
    },
    EASING: {
      EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
} as const

// shared/config/animation-config.ts
export const ANIMATION_CONFIG = {
  BUBBLE: {
    BREATHING: {
      amplitude: 0.5,
      frequency: 0.001,
      duration: 2000
    },
    HOVER: {
      scale: 1.1,
      duration: 300
    },
    APPEAR: {
      from: { scale: 0, opacity: 0 },
      to: { scale: 1, opacity: 1 },
      duration: 500,
      ease: "back.out(1.7)"
    }
  },
  HUD: {
    XP_BAR: {
      duration: 800,
      ease: "power2.out"
    },
    LEVEL_UP: {
      scale: [1, 1.2, 1],
      duration: 1000
    }
  }
} as const
```

#### 3. Joi для валидации схем
```typescript
// shared/lib/validation/joi-schemas.ts
import Joi from 'joi'

export const BubbleSchema = Joi.object({
  id: Joi.string().required(),
  label: Joi.string().min(1).max(50).required(),
  year: Joi.number().integer().min(2000).max(new Date().getFullYear()).required(),
  size: Joi.number().integer().min(10).max(100).required(),
  level: Joi.string().valid('novice', 'intermediate', 'confident', 'expert', 'master').required(),
  category: Joi.string().required(),
  points: Joi.number().integer().min(1).default(1),
  isEasterEgg: Joi.boolean().default(false)
})

export const SessionSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  currentXP: Joi.number().integer().min(0).default(0),
  currentLevel: Joi.number().integer().min(0).max(4).default(0),
  livesRemaining: Joi.number().integer().min(0).max(3).default(3),
  bubblesViewed: Joi.array().items(Joi.string()).default([]),
  achievementsUnlocked: Joi.array().items(Joi.string()).default([])
})

// entities/bubble/lib/bubble-validator.ts
import { BubbleSchema } from '@/shared/lib/validation/joi-schemas'
import type { Bubble } from './bubble-types'

export class BubbleValidator {
  static validate(bubble: unknown): Bubble {
    const { error, value } = BubbleSchema.validate(bubble)
    
    if (error) {
      throw new Error(`Bubble validation failed: ${error.message}`)
    }
    
    return value as Bubble
  }
  
  static validateArray(bubbles: unknown[]): Bubble[] {
    return bubbles.map(this.validate)
  }
}
```

#### 4. GSAP для всех анимаций
```typescript
// shared/lib/animations/gsap-presets.ts
import { gsap } from 'gsap'
import { ANIMATION_CONFIG } from '@/shared/config/animation-config'

export class GSAPPresets {
  static bubbleAppear(element: Element): GSAPTween {
    return gsap.fromTo(element, 
      ANIMATION_CONFIG.BUBBLE.APPEAR.from,
      {
        ...ANIMATION_CONFIG.BUBBLE.APPEAR.to,
        duration: ANIMATION_CONFIG.BUBBLE.APPEAR.duration / 1000,
        ease: ANIMATION_CONFIG.BUBBLE.APPEAR.ease
      }
    )
  }
  
  static bubbleHover(element: Element): GSAPTween {
    return gsap.to(element, {
      scale: ANIMATION_CONFIG.BUBBLE.HOVER.scale,
      duration: ANIMATION_CONFIG.BUBBLE.HOVER.duration / 1000,
      ease: "power2.out"
    })
  }
  
  static xpBarFill(element: Element, progress: number): GSAPTween {
    return gsap.to(element, {
      scaleX: progress,
      duration: ANIMATION_CONFIG.HUD.XP_BAR.duration / 1000,
      ease: ANIMATION_CONFIG.HUD.XP_BAR.ease
    })
  }
  
  static levelUpNotification(element: Element): GSAPTimeline {
    const tl = gsap.timeline()
    
    tl.fromTo(element, 
      { scale: 0, opacity: 0 },
      { scale: 1.2, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
    )
    .to(element, 
      { scale: 1, duration: 0.2 }
    )
    .to(element, 
      { opacity: 0, y: -50, duration: 0.5, delay: 1.5 }
    )
    
    return tl
  }
}

// Использование в компонентах
// features/gamification/ui/XPProgressBar.vue
<script setup lang="ts">
import { GSAPPresets } from '@/shared/lib/animations/gsap-presets'

const progressBarRef = ref<HTMLElement>()

watch(() => props.value, (newValue) => {
  if (progressBarRef.value) {
    GSAPPresets.xpBarFill(progressBarRef.value, newValue / props.max)
  }
})
</script>
```

### 🎯 РАЗРАБОТЧЕСКИЕ СТАНДАРТЫ

#### 1. Hot Reload в dev режиме
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    hmr: true,
    port: 3000
  },
  optimizeDeps: {
    include: ['d3', 'gsap', 'joi']
  }
})
```

#### 2. Строгий TypeScript
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}

// Пример строгой типизации
interface BubbleConfig {
  readonly id: string
  readonly label: string
  readonly year: number
  readonly level: BubbleLevel
}

type BubbleLevel = 'novice' | 'intermediate' | 'confident' | 'expert' | 'master'

// Вместо any - строгие типы
function processBubble(bubble: BubbleConfig): ProcessedBubble {
  // type-safe обработка
}
```

#### 3. Композиция вместо наследования
```typescript
// shared/lib/d3/force-simulation.ts
export function useD3ForceSimulation() {
  const simulation = ref<d3.Simulation<BubbleNode, undefined>>()
  
  const initSimulation = (width: number, height: number) => {
    simulation.value = d3.forceSimulation<BubbleNode>()
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<BubbleNode>(d => d.size + 5))
  }
  
  const updateNodes = (nodes: BubbleNode[]) => {
    simulation.value?.nodes(nodes).alpha(1).restart()
  }
  
  return {
    simulation: readonly(simulation),
    initSimulation,
    updateNodes
  }
}

// widgets/bubble-canvas/lib/physics-engine.ts
export function useBubblePhysics() {
  const d3Simulation = useD3ForceSimulation()
  const gsapAnimations = useGSAPAnimations()
  
  // Композиция функциональности
  return {
    ...d3Simulation,
    ...gsapAnimations
  }
}
```

### 📋 КОНТРОЛЬ КАЧЕСТВА

#### 1. Линтинг и форматирование
```json
// .eslintrc.json
{
  "extends": [
    "@vue/typescript/recommended",
    "@vue/prettier"
  ],
  "rules": {
    "no-magic-numbers": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### 2. Тестирование компонентов
```typescript
// entities/bubble/ui/BubbleItem.test.ts
describe('BubbleItem', () => {
  it('renders with correct size', () => {
    const bubble = { size: 50, label: 'Vue.js' }
    const wrapper = mount(BubbleItem, { props: { bubble } })
    
    expect(wrapper.find('circle').attributes('r')).toBe('50')
  })
  
  it('emits click event', async () => {
    const wrapper = mount(BubbleItem, { props: { bubble: mockBubble } })
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

## 🎯 Ключевые технические компоненты

### 1. D3.js Force Simulation

```typescript
// composables/useD3Simulation.ts
import * as d3 from 'd3';

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  size: number;
  level: string;
  category: string;
  year: number;
}

export function useD3Simulation(container: Ref<SVGElement>) {
  const simulation = d3.forceSimulation<BubbleNode>()
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter())
    .force('collision', d3.forceCollide<BubbleNode>()
      .radius(d => d.size + 5))
    .alphaDecay(0.02)
    .velocityDecay(0.8);

  const updateSimulation = (nodes: BubbleNode[]) => {
    simulation.nodes(nodes);
    simulation.alpha(1).restart();
  };

  return {
    simulation,
    updateSimulation
  };
}
```

### 2. Pinia Game State

```typescript
// stores/gameState.ts
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', () => {
  const currentXP = ref(0);
  const currentLevel = ref(0);
  const livesRemaining = ref(3);
  const bubblesViewed = ref<string[]>([]);
  const achievementsUnlocked = ref<string[]>([]);

  const LEVEL_THRESHOLDS = {
    1: 25,
    2: 50,
    3: 75,
    4: 100
  } as const;

  const addXP = (points: number) => {
    currentXP.value += points;
    checkLevelUp();
    saveProgress();
  };

  const checkLevelUp = () => {
    const newLevel = Object.entries(LEVEL_THRESHOLDS)
      .reverse()
      .find(([_, threshold]) => currentXP.value >= threshold)?.[0];
    
    if (newLevel && parseInt(newLevel) > currentLevel.value) {
      currentLevel.value = parseInt(newLevel);
      unlockAchievement(`level_${newLevel}`);
    }
  };

  const loseLife = () => {
    if (livesRemaining.value > 0) {
      livesRemaining.value--;
      if (livesRemaining.value === 0) {
        triggerGameOver();
      }
    }
  };

  const viewBubble = (bubbleId: string) => {
    if (!bubblesViewed.value.includes(bubbleId)) {
      bubblesViewed.value.push(bubbleId);
      addXP(1);
    }
  };

  return {
    currentXP: readonly(currentXP),
    currentLevel: readonly(currentLevel),
    livesRemaining: readonly(livesRemaining),
    addXP,
    loseLife,
    viewBubble
  };
});
```

### 3. Bubble Physics Engine

```typescript
// components/bubbles/BubblePhysics.ts
export class BubblePhysicsEngine {
  private nodes: BubbleNode[] = [];
  private simulation: d3.Simulation<BubbleNode, undefined>;

  constructor(width: number, height: number) {
    this.simulation = d3.forceSimulation<BubbleNode>()
      .force('charge', d3.forceManyBody()
        .strength(-30)
        .distanceMax(200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<BubbleNode>()
        .radius(d => d.size * 0.8)
        .strength(0.7))
      .force('x', d3.forceX<BubbleNode>()
        .strength(0.1)
        .x(width / 2))
      .force('y', d3.forceY<BubbleNode>()
        .strength(0.1)
        .y(height / 2));
  }

  addBubble(bubble: BubbleNode) {
    // Анимация появления нового пузыря
    bubble.x = Math.random() * 100;
    bubble.y = Math.random() * 100;
    bubble.vx = 0;
    bubble.vy = 0;
    
    this.nodes.push(bubble);
    this.simulation.nodes(this.nodes);
    this.simulation.alpha(1).restart();
  }

  removeBubble(bubbleId: string) {
    this.nodes = this.nodes.filter(n => n.id !== bubbleId);
    this.simulation.nodes(this.nodes);
    this.simulation.alpha(0.3).restart();
  }

  updateYear(year: number) {
    // Фильтруем пузыри по году
    const activeNodes = this.nodes.filter(n => n.year <= year);
    this.simulation.nodes(activeNodes);
    this.simulation.alpha(0.5).restart();
  }

  addBreathingEffect() {
    // Добавляем легкое покачивание
    setInterval(() => {
      this.nodes.forEach(node => {
        const breathe = Math.sin(Date.now() * 0.001 + node.id.charCodeAt(0)) * 0.5;
        node.fx = (node.fx || node.x || 0) + breathe;
        node.fy = (node.fy || node.y || 0) + breathe;
      });
      this.simulation.alpha(0.1).restart();
    }, 50);
  }
}
```

## 🗄️ Database Schema Implementation

```sql
-- database/schema.sql

-- Включаем внешние ключи
PRAGMA foreign_keys = ON;

-- Таблица пузырей (навыков)
CREATE TABLE IF NOT EXISTS bubbles (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  year INTEGER NOT NULL,
  size INTEGER DEFAULT 50 CHECK(size >= 10 AND size <= 100),
  level TEXT NOT NULL CHECK(level IN ('novice','intermediate','confident','expert','master')),
  category TEXT NOT NULL,
  description TEXT,
  insight TEXT,
  project_link TEXT,
  points INTEGER DEFAULT 1 CHECK(points >= 1),
  is_easter_egg BOOLEAN DEFAULT FALSE,
  color_override TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX idx_bubbles_year ON bubbles(year);
CREATE INDEX idx_bubbles_category ON bubbles(category);
CREATE INDEX idx_bubbles_level ON bubbles(level);

-- Триггер для обновления updated_at
CREATE TRIGGER update_bubbles_timestamp 
AFTER UPDATE ON bubbles
BEGIN
  UPDATE bubbles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Связи между пузырями (например, React связан с JavaScript)
CREATE TABLE IF NOT EXISTS bubble_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_bubble_id TEXT NOT NULL,
  to_bubble_id TEXT NOT NULL,
  strength REAL DEFAULT 0.5 CHECK(strength >= 0 AND strength <= 1),
  connection_type TEXT DEFAULT 'related', -- 'prerequisite', 'complementary', 'evolved_from'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_bubble_id) REFERENCES bubbles(id) ON DELETE CASCADE,
  FOREIGN KEY (to_bubble_id) REFERENCES bubbles(id) ON DELETE CASCADE,
  UNIQUE(from_bubble_id, to_bubble_id)
);

-- Достижения
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji или icon class
  xp_threshold INTEGER DEFAULT 0,
  unlock_level INTEGER DEFAULT 0,
  is_secret BOOLEAN DEFAULT FALSE,
  reward_type TEXT DEFAULT 'info', -- 'info', 'contact', 'feature'
  reward_data TEXT, -- JSON с данными награды
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Сессии пользователей
CREATE TABLE IF NOT EXISTS user_sessions (
  session_id TEXT PRIMARY KEY,
  current_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 0,
  lives_remaining INTEGER DEFAULT 3 CHECK(lives_remaining >= 0 AND lives_remaining <= 3),
  bubbles_viewed TEXT DEFAULT '[]', -- JSON массив ID просмотренных пузырей
  achievements_unlocked TEXT DEFAULT '[]', -- JSON массив ID полученных достижений
  philosophy_answers TEXT DEFAULT '{}', -- JSON объект ответов на философские вопросы
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT
);

-- Философские вопросы (Easter Eggs)
CREATE TABLE IF NOT EXISTS philosophy_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  agree_response TEXT,
  disagree_response TEXT,
  agree_xp_bonus INTEGER DEFAULT 10,
  disagree_life_penalty INTEGER DEFAULT 1,
  category TEXT DEFAULT 'general',
  bubble_id TEXT, -- Привязка к пузырю
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bubble_id) REFERENCES bubbles(id) ON DELETE SET NULL
);

-- Аналитика событий
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'bubble_view', 'bubble_click', 'level_up', etc.
  event_data TEXT, -- JSON с деталями события
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES user_sessions(session_id)
);

CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);
```

## 🚀 API Endpoints

```javascript
// backend/src/api/routes/bubbles.js
const express = require('express');
const router = express.Router();

// GET /api/bubbles - получить все пузыри
router.get('/', async (req, res) => {
  const { year, category, level } = req.query;
  
  let query = 'SELECT * FROM bubbles WHERE 1=1';
  const params = [];
  
  if (year) {
    query += ' AND year <= ?';
    params.push(year);
  }
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (level) {
    query += ' AND level = ?';
    params.push(level);
  }
  
  query += ' ORDER BY year ASC, size DESC';
  
  try {
    const bubbles = db.prepare(query).all(...params);
    res.json(bubbles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bubbles/:id - получить конкретный пузырь
router.get('/:id', async (req, res) => {
  try {
    const bubble = db.prepare('SELECT * FROM bubbles WHERE id = ?').get(req.params.id);
    if (!bubble) {
      return res.status(404).json({ error: 'Bubble not found' });
    }
    res.json(bubble);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sessions/:sessionId/view-bubble - отметить просмотр пузыря
router.post('/sessions/:sessionId/view-bubble', async (req, res) => {
  const { sessionId } = req.params;
  const { bubbleId } = req.body;
  
  try {
    // Получаем текущую сессию
    const session = db.prepare('SELECT * FROM user_sessions WHERE session_id = ?').get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const bubblesViewed = JSON.parse(session.bubbles_viewed);
    
    if (!bubblesViewed.includes(bubbleId)) {
      bubblesViewed.push(bubbleId);
      
      // Получаем пузырь для начисления очков
      const bubble = db.prepare('SELECT points FROM bubbles WHERE id = ?').get(bubbleId);
      const newXP = session.current_xp + (bubble?.points || 1);
      
      // Обновляем сессию
      db.prepare(`
        UPDATE user_sessions 
        SET bubbles_viewed = ?, current_xp = ?, last_activity = CURRENT_TIMESTAMP
        WHERE session_id = ?
      `).run(JSON.stringify(bubblesViewed), newXP, sessionId);
      
      // Записываем событие аналитики
      db.prepare(`
        INSERT INTO analytics_events (session_id, event_type, event_data)
        VALUES (?, 'bubble_view', ?)
      `).run(sessionId, JSON.stringify({ bubbleId, xpGained: bubble?.points || 1 }));
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 🧪 Testing Strategy

```typescript
// tests/components/BubbleCanvas.test.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import BubbleCanvas from '@/components/bubbles/BubbleCanvas.vue';

describe('BubbleCanvas', () => {
  it('renders bubbles correctly', () => {
    const bubbles = [
      { id: '1', label: 'Vue.js', size: 50, level: 'expert' },
      { id: '2', label: 'TypeScript', size: 40, level: 'confident' }
    ];
    
    const wrapper = mount(BubbleCanvas, {
      props: { bubbles, year: 2024 }
    });
    
    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.findAll('.bubble')).toHaveLength(2);
  });
  
  it('emits bubble-click event when bubble is clicked', async () => {
    const bubbles = [
      { id: '1', label: 'Vue.js', size: 50, level: 'expert' }
    ];
    
    const wrapper = mount(BubbleCanvas, {
      props: { bubbles, year: 2024 }
    });
    
    await wrapper.find('.bubble').trigger('click');
    expect(wrapper.emitted('bubble-click')).toBeTruthy();
  });
});
```

## 📱 Performance Optimizations

### 1. Lazy Loading компонентов
```typescript
// router/index.ts
const BubbleDetail = () => import('@/components/bubbles/BubbleDetail.vue');
const ProfileModal = () => import('@/components/modals/ProfileModal.vue');
```

### 2. Виртуализация больших списков
```vue
<!-- Для большого количества пузырей -->
<template>
  <virtual-list
    :data-key="'id'"
    :data-sources="bubbles"
    :data-component="BubbleItem"
    :keeps="30"
  />
</template>
```

### 3. Оптимизация D3 симуляции
```typescript
// Throttle обновлений симуляции
const throttledUpdate = useThrottle(updateSimulation, 16); // 60fps

// Отключение симуляции при неактивной вкладке
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    simulation.stop();
  } else {
    simulation.restart();
  }
});
```

## 🔐 Security Considerations

### 1. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за окно
  message: 'Too many requests, please try again later.'
});

app.use('/api/', apiLimiter);
```

### 2. Input Validation
```javascript
const Joi = require('joi');

const sessionSchema = Joi.object({
  bubbleId: Joi.string().alphanum().min(1).max(50).required(),
  action: Joi.string().valid('view', 'click').required()
});
```

### 3. CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://antonshelekhov.dev'] 
    : ['http://localhost:3000'],
  credentials: true
}));
```

## Соглашения по кодированию (Coding Conventions)

### **Именование**

Для поддержания консистентности и читаемости кода мы придерживаемся следующих правил:

1.  **`camelCase` для переменных и свойств**:
    -   Все имена переменных, свойств объектов, методов и функций должны быть в `camelCase`.
    -   Пример: `const bubbleSize = 10;`, `const gameStore = useGameStore();`, `function calculateScore() {}`
    -   Это правило распространяется и на данные, получаемые от API. Сервер должен отдавать ключи в `camelCase`, а клиент ожидает их в `camelCase`.

2.  **`UPPER_SNAKE_CASE` для констант**:
    -   Глобальные, не изменяемые константы (например, конфигурационные параметры, пороговые значения) именуются в `UPPER_SNAKE_CASE`.
    -   Пример: `const MAX_LIVES = 5;`, `const INITIAL_XP = 0;`

3.  **`PascalCase` для компонентов и типов**:
    -   Имена Vue компонентов и TypeScript типов/интерфейсов должны быть в `PascalCase`.
    -   Пример: `BubbleCanvas.vue`, `interface UserProfile {}`

### **Управление состоянием (Pinia)**

-   Каждая бизнес-сущность или сложная фича должна иметь свой собственный стор в Pinia.
-   Сторонний код не должен напрямую изменять состояние стора. Все изменения производятся через `actions`.
-   Геттеры (`getters`) используются для вычисляемых данных на основе состояния.

## CI/CD

(TBD) - Раздел для описания процессов непрерывной интеграции и развертывания. 