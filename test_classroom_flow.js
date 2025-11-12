const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Opening login page...');
    await page.goto('http://localhost:3001/login');
    await page.waitForTimeout(2000);

    console.log('2. Logging in...');
    // Fill login form
    await page.fill('input[type="email"]', 'teacher@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✓ Login successful!');

    console.log('3. Navigating to Classrooms page...');
    await page.click('a[href="/classrooms"]');
    await page.waitForURL('**/classrooms', { timeout: 5000 });
    console.log('✓ On Classrooms page');

    // Take screenshot before creating
    await page.screenshot({ path: 'before_create.png' });

    console.log('4. Opening create classroom modal...');
    await page.click('button:has-text("+")');
    await page.waitForTimeout(1000);

    console.log('5. Clicking "Tạo lớp học" option...');
    await page.click('button:has-text("Tạo lớp học")');
    await page.waitForTimeout(1000);

    console.log('6. Filling classroom name...');
    const testClassName = `Test Classroom ${Date.now()}`;
    await page.fill('input[placeholder*="GIS"]', testClassName);
    await page.waitForTimeout(500);

    // Take screenshot of filled form
    await page.screenshot({ path: 'form_filled.png' });

    console.log('7. Submitting form...');
    await page.click('button[type="submit"]:has-text("Tạo lớp")');
    await page.waitForTimeout(3000);

    // Take screenshot after submit
    await page.screenshot({ path: 'after_submit.png' });

    console.log('8. Checking if classroom card appears...');
    const classroomCards = await page.locator('text=' + testClassName).count();
    console.log(`Found ${classroomCards} classroom card(s) with name: ${testClassName}`);

    if (classroomCards > 0) {
      console.log('✅ SUCCESS: Classroom card is visible!');
    } else {
      console.log('❌ FAILURE: Classroom card NOT visible!');

      // Check console errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      console.log('Console errors:', errors);

      // Check network requests
      console.log('Checking network requests...');
      page.on('response', response => {
        const url = response.url();
        if (url.includes('/api/')) {
          console.log(`API ${response.status()}: ${url}`);
        }
      });
    }

    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error during test:', error.message);
    await page.screenshot({ path: 'error.png' });
  } finally {
    await browser.close();
  }
})();
