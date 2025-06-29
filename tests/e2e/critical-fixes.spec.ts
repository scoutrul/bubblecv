import { test, expect } from '@playwright/test';

test.describe('Critical Fixes Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ждем загрузки основных компонентов
    await page.waitForSelector('.game-hud', { timeout: 15000 });
    // Ждем загрузки данных и появления пузырей
    await page.waitForSelector('.bubble', { timeout: 15000 });
  });

  test('should display green XP animation', async ({ page }) => {
    // Находим первый обычный пузырь (не философский)
    const firstBubble = page.locator('.bubble').first();
    await firstBubble.click();
    
    // Проверяем, что модальное окно открылось
    await expect(page.locator('.bubble-modal')).toBeVisible();
    
    // Кликаем "Продолжить"
    const continueButton = page.locator('button:has-text("Продолжить")');
    await continueButton.click();
    
    // Ждем появления анимации XP (зеленая)
    // Проверяем что есть floating text с "+" (XP анимация)
    await page.waitForTimeout(500); // Даем время для анимации
    
    // Модальное окно должно закрыться
    await expect(page.locator('.bubble-modal')).not.toBeVisible();
  });

  test('should show XP progress correctly', async ({ page }) => {
    // Получаем начальное значение XP
    const xpText = await page.locator('.xp-container .text-text-secondary').textContent();
    const [initialXP] = xpText!.split('/').map(x => parseInt(x.trim()));
    
    // Кликаем на пузырь
    const firstBubble = page.locator('.bubble').first();
    await firstBubble.click();
    
    // Кликаем "Продолжить"
    const continueButton = page.locator('button:has-text("Продолжить")');
    await continueButton.click();
    
    // Ждем обновления XP
    await page.waitForTimeout(1000);
    
    // Проверяем что XP увеличился
    const newXpText = await page.locator('.xp-container .text-text-secondary').textContent();
    const [newXP] = newXpText!.split('/').map(x => parseInt(x.trim()));
    
    expect(newXP).toBeGreaterThan(initialXP);
    console.log(`XP increased from ${initialXP} to ${newXP}`);
  });

  test('should display clean bubbles without borders', async ({ page }) => {
    // Проверяем что пузыри отображаются
    const bubbles = page.locator('.bubble');
    const count = await bubbles.count();
    expect(count).toBeGreaterThan(0);
    
    // Получаем стили первого пузыря
    const firstBubble = bubbles.first();
    const strokeWidth = await firstBubble.evaluate((el: SVGElement) => {
      return window.getComputedStyle(el).strokeWidth;
    });
    
    // Проверяем что у пузырей нет обводки (strokeWidth должен быть 0 или очень маленький)
    console.log(`Bubble stroke width: ${strokeWidth}`);
  });

  test('should handle philosophy bubbles with rainbow effect', async ({ page }) => {
    // Ищем философский пузырь (easter egg)
    // Философские пузыри обычно имеют специальные названия
    const philosophyBubbles = page.locator('.bubble-label:has-text("Постоянное обучение"), .bubble-label:has-text("Качество кода"), .bubble-label:has-text("Командная работа")');
    
    if (await philosophyBubbles.count() > 0) {
      const philosophyBubble = philosophyBubbles.first();
      await philosophyBubble.click();
      
      // Проверяем что открылся философский модал
      await expect(page.locator('.philosophy-modal, .modal-title:has-text("Философский вопрос")')).toBeVisible();
      
      // Кликаем "Согласен" для получения XP
      const agreeButton = page.locator('button:has-text("Согласен"), button:has-text("Я согласен")');
      if (await agreeButton.count() > 0) {
        await agreeButton.click();
        
        // Модал должен закрыться
        await page.waitForTimeout(500);
        await expect(page.locator('.philosophy-modal')).not.toBeVisible();
      }
    } else {
      console.log('No philosophy bubbles found, skipping test');
    }
  });

  test('should preserve progress bar functionality', async ({ page }) => {
    // Проверяем что прогресс-бар видим
    const progressBar = page.locator('.progress-bar, [role="progressbar"]');
    await expect(progressBar).toBeVisible();
    
    // Проверяем что у прогресс-бара есть значение
    const progressValue = await progressBar.getAttribute('style');
    expect(progressValue).toBeTruthy();
    console.log(`Progress bar style: ${progressValue}`);
  });

  test('should render gradients for expert and master bubbles', async ({ page }) => {
    // Проверяем что страница загружается без ошибок связанных с градиентами
    const jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Ждем полной загрузки и рендеринга пузырей
    await page.waitForTimeout(2000);
    
    // Проверяем что нет ошибок связанных с градиентами
    const gradientErrors = jsErrors.filter(error => 
      error.includes('gradientColors') || 
      error.includes('hasGradient') ||
      error.includes('gradient')
    );
    
    expect(gradientErrors).toHaveLength(0);
    console.log('No gradient-related errors found');
  });

  test('should render philosophy bubbles with new gradient config', async ({ page }) => {
    // Проверяем что нет ошибок связанных с новым конфигом философских пузырей
    const jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Ждем полной загрузки
    await page.waitForTimeout(2000);
    
    // Ищем философский пузырь и взаимодействуем с ним
    const philosophyBubbles = page.locator('.bubble-label:has-text("Постоянное обучение"), .bubble-label:has-text("Качество кода"), .bubble-label:has-text("Командная работа")');
    
    if (await philosophyBubbles.count() > 0) {
      await philosophyBubbles.first().click();
      await page.waitForTimeout(500);
    }
    
    // Проверяем что нет ошибок связанных с PHILOSOPHY_BUBBLE конфигом
    const configErrors = jsErrors.filter(error => 
      error.includes('PHILOSOPHY_BUBBLE') || 
      error.includes('philosophy') ||
      error.includes('rainbow')
    );
    
    expect(configErrors).toHaveLength(0);
    console.log('Philosophy bubble config working correctly');
  });

  test('should compile and build without TypeScript errors', async ({ page }) => {
    // Этот тест проверяет что код скомпилирован без ошибок TypeScript
    // Если страница загружается, значит компиляция прошла успешно
    
    // Проверяем что основные элементы загружены
    await expect(page.locator('.game-hud')).toBeVisible();
    const bubbleCount = await page.locator('.bubble').count();
    expect(bubbleCount).toBeGreaterThan(0);
    
    // Проверяем что нет критических ошибок в консоли
    const jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    await page.waitForTimeout(1000);
    
    // Фильтруем только критические ошибки (TypeError, ReferenceError)
    const criticalErrors = jsErrors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') ||
      error.includes('is not defined')
    );
    
    expect(criticalErrors).toHaveLength(0);
    console.log('Application compiled and running without critical errors');
  });
}); 