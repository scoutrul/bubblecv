# ✨ Animation Concepts & GSAP Scenarios

## 🎯 Концепция анимаций

**Визуальная метафора**: Пузырьки как живые организмы в цифровом космосе  
**Принцип движения**: Органичность + физичность + отзывчивость  
**Эмоциональная подача**: Игривость без потери профессионализма

---

## 🫧 Физика пузырьков (D3.js Force Simulation)

### Основные силы

```javascript
// D3 Force Configuration
const simulation = d3.forceSimulation(bubbles)
  .force("charge", d3.forceManyBody()
    .strength(d => d.isQuestion ? -800 : -300)
    .distanceMax(200)
  )
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide()
    .radius(d => d.size / 2 + 5)
    .strength(0.8)
  )
  .force("x", d3.forceX(width / 2).strength(0.1))
  .force("y", d3.forceY(height / 2).strength(0.1))
  .force("boundary", boundaryForce())
  .alphaDecay(0.02)
  .velocityDecay(0.8);
```

### Специальные эффекты

```javascript
// Easter Egg "дыхание"
function breathingEasterEggs() {
  const easterEggs = bubbles.filter(d => d.isQuestion);
  
  gsap.to(easterEggs, {
    duration: 3,
    scale: 1.1,
    ease: "power2.inOut",
    yoyo: true,
    repeat: -1,
    stagger: 0.5
  });
}

// Магнетическое притяжение к курсору
function magneticAttraction(mouseX, mouseY) {
  bubbles.forEach(bubble => {
    const distance = Math.sqrt(
      Math.pow(mouseX - bubble.x, 2) + 
      Math.pow(mouseY - bubble.y, 2)
    );
    
    if (distance < 150) {
      const strength = (150 - distance) / 150;
      bubble.vx += (mouseX - bubble.x) * strength * 0.01;
      bubble.vy += (mouseY - bubble.y) * strength * 0.01;
    }
  });
}
```

---

## 🎮 Интро-анимация (Page Load)

### Сценарий: "Рождение цифровой вселенной"

```javascript
// 1. Звездное небо появляется
const introTimeline = gsap.timeline();

introTimeline
  .set('.star', { scale: 0, opacity: 0 })
  .to('.star', {
    duration: 2,
    scale: 1,
    opacity: 0.8,
    ease: "back.out(1.7)",
    stagger: {
      amount: 1.5,
      from: "random"
    }
  })
  
  // 2. Заголовок материализуется
  .fromTo('.main-title', 
    { 
      y: 100, 
      opacity: 0,
      filter: "blur(20px)"
    },
    {
      duration: 1.5,
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      ease: "power3.out"
    },
    "-=1"
  )
  
  // 3. Пузырьки рождаются из центра
  .fromTo('.bubble',
    {
      scale: 0,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      opacity: 0
    },
    {
      duration: 2,
      scale: 1,
      opacity: 1,
      ease: "elastic.out(1, 0.5)",
      stagger: {
        amount: 1.5,
        from: "center"
      },
      onComplete: () => startPhysicsSimulation()
    },
    "-=0.5"
  )
  
  // 4. Timeline slide-in
  .fromTo('.timeline-container',
    { x: -300, opacity: 0 },
    {
      duration: 1,
      x: 0,
      opacity: 1,
      ease: "power2.out"
    },
    "-=1"
  );
```

---

## 🎯 Взаимодействие с пузырьками

### Hover Effect: "Живое свечение"

```javascript
function createBubbleHover(bubble) {
  const hoverTl = gsap.timeline({ paused: true });
  
  hoverTl
    .to(bubble, {
      duration: 0.3,
      scale: 1.15,
      filter: "brightness(1.3) drop-shadow(0 0 20px currentColor)",
      ease: "power2.out"
    })
    .to(bubble.querySelector('.bubble-glow'), {
      duration: 0.3,
      opacity: 0.8,
      scale: 1.5,
      ease: "power2.out"
    }, 0)
    .to(bubble.querySelector('.bubble-particles'), {
      duration: 0.5,
      opacity: 1,
      ease: "power1.out"
    }, 0);
    
  return hoverTl;
}

// Hover события
bubble.addEventListener('mouseenter', () => hoverTl.play());
bubble.addEventListener('mouseleave', () => hoverTl.reverse());
```

### Click Effect: "Энергетический импульс"

```javascript
function bubbleClickAnimation(bubble) {
  // Главная волна
  gsap.fromTo(bubble, 
    { scale: 1 },
    {
      duration: 0.15,
      scale: 0.9,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(bubble, {
          duration: 0.3,
          scale: 1.1,
          ease: "elastic.out(1, 0.3)"
        });
      }
    }
  );
  
  // Концентрические волны
  for (let i = 0; i < 3; i++) {
    const wave = document.createElement('div');
    wave.className = 'ripple-wave';
    bubble.appendChild(wave);
    
    gsap.fromTo(wave,
      { 
        scale: 0, 
        opacity: 0.6,
        borderWidth: '2px'
      },
      {
        duration: 0.8,
        scale: 3,
        opacity: 0,
        borderWidth: '0px',
        ease: "power2.out",
        delay: i * 0.1,
        onComplete: () => wave.remove()
      }
    );
  }
  
  // Частицы
  createParticleExplosion(bubble);
}
```

---

## 💫 XP и Level Up анимации

### XP Gain: "Энергетический всплеск"

```javascript
function animateXPGain(amount, targetElement) {
  // Летящий XP текст
  const xpText = document.createElement('div');
  xpText.className = 'floating-xp';
  xpText.textContent = `+${amount} XP`;
  document.body.appendChild(xpText);
  
  const rect = targetElement.getBoundingClientRect();
  
  gsap.set(xpText, {
    x: rect.left + rect.width / 2,
    y: rect.top,
    scale: 0
  });
  
  gsap.to(xpText, {
    duration: 2,
    y: rect.top - 100,
    scale: 1,
    opacity: 0,
    ease: "power2.out",
    onComplete: () => xpText.remove()
  });
  
  // Обновление XP бара с анимацией
  updateXPBar(amount);
}

function updateXPBar(newXP) {
  const progressBar = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.xp-text');
  
  gsap.to(progressBar, {
    duration: 1,
    width: `${(newXP / 100) * 100}%`,
    ease: "power2.out"
  });
  
  // Shine effect
  gsap.fromTo(progressBar.querySelector('.progress-shine'),
    { left: '-100%' },
    {
      duration: 1.5,
      left: '100%',
      ease: "power2.inOut"
    }
  );
}
```

### Level Up: "Космический взрыв"

```javascript
function levelUpAnimation(newLevel) {
  const levelUpTl = gsap.timeline();
  
  // Screen flash
  levelUpTl
    .set('.level-up-flash', { opacity: 0 })
    .to('.level-up-flash', {
      duration: 0.1,
      opacity: 0.8,
      ease: "power2.out"
    })
    .to('.level-up-flash', {
      duration: 0.5,
      opacity: 0,
      ease: "power2.out"
    })
    
    // Confetti explosion
    .add(() => createConfettiExplosion(), "-=0.4")
    
    // Level up text
    .fromTo('.level-up-text',
      { 
        scale: 0, 
        rotation: -180,
        opacity: 0 
      },
      {
        duration: 1,
        scale: 1,
        rotation: 0,
        opacity: 1,
        ease: "elastic.out(1, 0.3)"
      },
      "-=0.3"
    )
    
    // Unlocked content reveal
    .fromTo('.newly-unlocked',
      { y: 50, opacity: 0 },
      {
        duration: 1,
        y: 0,
        opacity: 1,
        ease: "back.out(1.7)",
        stagger: 0.1
      },
      "-=0.5"
    );
}
```

---

## 🎪 Easter Egg анимации

### Философский пузырек: "Пульсация мысли"

```javascript
function philosophicalBubbleAnimation(bubble) {
  // Основная пульсация
  gsap.to(bubble, {
    duration: 3,
    scale: 1.05,
    ease: "power2.inOut",
    yoyo: true,
    repeat: -1
  });
  
  // Цветовая волна
  gsap.to(bubble, {
    duration: 4,
    filter: "hue-rotate(360deg)",
    ease: "none",
    repeat: -1
  });
  
  // Орбитальные частицы
  const particles = bubble.querySelectorAll('.orbit-particle');
  particles.forEach((particle, i) => {
    gsap.to(particle, {
      duration: 8,
      rotation: 360,
      ease: "none",
      repeat: -1,
      delay: i * 0.5
    });
  });
}
```

### Активация Easter Egg: "Раскрытие истины"

```javascript
function activatePhilosophicalQuestion(bubble) {
  const activationTl = gsap.timeline();
  
  activationTl
    // Стоп всех анимаций
    .add(() => {
      gsap.set('*', { animationPlayState: 'paused' });
    })
    
    // Затемнение фона
    .to('.background-overlay', {
      duration: 0.5,
      opacity: 0.8,
      backdropFilter: 'blur(10px)'
    })
    
    // Увеличение активного пузырька
    .to(bubble, {
      duration: 0.8,
      scale: 2,
      z: 100,
      ease: "back.out(1.7)"
    }, "-=0.3")
    
    // Появление вопроса
    .fromTo('.philosophy-modal',
      { 
        scale: 0,
        opacity: 0,
        rotationY: 90
      },
      {
        duration: 1,
        scale: 1,
        opacity: 1,
        rotationY: 0,
        ease: "back.out(1.7)"
      },
      "-=0.2"
    );
}
```

---

## 🕐 Timeline анимации

### Путешествие во времени

```javascript
function timelineYearChange(targetYear) {
  const timelineTl = gsap.timeline();
  
  // Fade out неактуальные пузырьки
  const irrelevantBubbles = bubbles.filter(b => b.year > targetYear);
  const relevantBubbles = bubbles.filter(b => b.year <= targetYear);
  
  timelineTl
    .to(irrelevantBubbles, {
      duration: 0.5,
      opacity: 0.2,
      scale: 0.7,
      filter: "grayscale(100%)",
      ease: "power2.out"
    })
    
    // Highlight актуальные
    .to(relevantBubbles, {
      duration: 0.8,
      opacity: 1,
      scale: 1,
      filter: "grayscale(0%)",
      ease: "elastic.out(1, 0.3)"
    }, "-=0.3")
    
    // Обновление года на временной шкале
    .to('.timeline-year', {
      duration: 0.5,
      textContent: targetYear,
      ease: "power2.out"
    }, 0);
}

// Анимация ручки слайдера
function animateTimelineHandle(position) {
  gsap.to('.timeline-handle', {
    duration: 0.3,
    x: position,
    scale: 1.2,
    ease: "power2.out",
    onComplete: () => {
      gsap.to('.timeline-handle', {
        duration: 0.2,
        scale: 1,
        ease: "power2.out"
      });
    }
  });
}
```

---

## 📱 Мобильные адаптации

### Touch-friendly анимации

```javascript
// Увеличенные области касания
function enhanceTouchTargets() {
  gsap.set('.bubble', {
    // Invisible expanded touch area
    '::before': {
      content: '""',
      position: 'absolute',
      width: '120%',
      height: '120%',
      top: '-10%',
      left: '-10%',
      zIndex: -1
    }
  });
}

// Haptic feedback simulation
function mobileClickFeedback(element) {
  if (navigator.vibrate) {
    navigator.vibrate(10); // 10ms vibration
  }
  
  // Visual feedback for non-haptic devices
  gsap.fromTo(element,
    { 
      boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)' 
    },
    {
      duration: 0.3,
      boxShadow: '0 0 0 20px rgba(255, 255, 255, 0)',
      ease: "power2.out"
    }
  );
}
```

---

## 🌊 Ambient анимации (Background)

### Звездное небо

```javascript
function createStarField() {
  const stars = [];
  
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    
    document.querySelector('.star-field').appendChild(star);
    stars.push(star);
  }
  
  // Мерцание звезд
  gsap.to(stars, {
    duration: 2,
    opacity: 0.3,
    ease: "power2.inOut",
    repeat: -1,
    yoyo: true,
    stagger: {
      amount: 3,
      from: "random"
    }
  });
}
```

### Плавающие частицы

```javascript
function createFloatingParticles() {
  const particles = document.querySelectorAll('.ambient-particle');
  
  particles.forEach(particle => {
    const tl = gsap.timeline({ repeat: -1 });
    
    tl.to(particle, {
      duration: gsap.utils.random(10, 20),
      x: gsap.utils.random(-100, 100),
      y: gsap.utils.random(-100, 100),
      rotation: gsap.utils.random(0, 360),
      ease: "none"
    });
  });
}
```

---

## ⚡ Производительность анимаций

### Оптимизация для низких FPS

```javascript
// Adaptive quality based on performance
let performanceLevel = 'high';

function detectPerformance() {
  let lastTime = performance.now();
  let frameCount = 0;
  
  function measureFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = frameCount;
      frameCount = 0;
      lastTime = currentTime;
      
      if (fps < 30) {
        performanceLevel = 'low';
        reduceAnimationComplexity();
      } else if (fps < 50) {
        performanceLevel = 'medium';
        moderateAnimationComplexity();
      }
    }
    
    requestAnimationFrame(measureFPS);
  }
  
  measureFPS();
}

function reduceAnimationComplexity() {
  // Отключаем сложные эффекты
  gsap.set('.particle-effect', { display: 'none' });
  gsap.set('.glow-effect', { filter: 'none' });
  
  // Упрощаем физику
  simulation.force("charge").strength(-100);
}
```

---

## 🎭 Финальные штрихи

### Parallax эффекты

```javascript
function createParallaxLayers() {
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    
    gsap.to('.parallax-layer-1', {
      duration: 1,
      x: -x * 0.5,
      y: -y * 0.5,
      ease: "power2.out"
    });
    
    gsap.to('.parallax-layer-2', {
      duration: 1.5,
      x: -x * 0.3,
      y: -y * 0.3,
      ease: "power2.out"
    });
  });
}
```

### Контекстные анимации

```javascript
// Время суток влияет на анимации
function adaptToTimeOfDay() {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 18) {
    // Дневные анимации - более энергичные
    gsap.globalTimeline.timeScale(1.2);
  } else {
    // Ночные анимации - более спокойные
    gsap.globalTimeline.timeScale(0.8);
    addNightModeEffects();
  }
}
```

Эти анимационные концепты создадут поистине магический и запоминающийся опыт взаимодействия с Bubbles Resume! ✨🚀 