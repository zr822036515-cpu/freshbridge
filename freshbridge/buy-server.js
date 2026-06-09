const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Step 1: Open Alibaba Cloud login page
  console.log('[1] Opening Alibaba Cloud login...');
  await page.goto('https://account.aliyun.com/login/login.htm');

  // Wait for user to complete login manually
  console.log('[2] Please log in manually in the browser...');
  console.log('    Waiting for login to complete (watching for console redirect)...');

  // Wait until we're redirected to the console after login
  await page.waitForURL(/console\.aliyun\.com|homenew\.console\.aliyun\.com/, {
    timeout: 300000 // 5 min for user to login
  });
  console.log('[3] Login detected!');

  // Step 2: Navigate to SWAS purchase page
  console.log('[4] Navigating to SWAS purchase page...');
  await page.goto('https://swas.console.aliyun.com/#/servers', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click "Create Server" button
  const createBtn = page.locator('button, a, span').filter({ hasText: /创建服务器|创建实例|Create/ }).first();
  try {
    await createBtn.click({ timeout: 10000 });
    console.log('[5] Clicked "Create Server"');
  } catch {
    console.log('[5] Could not auto-click create button, please click "创建服务器" manually');
  }

  // Wait for purchase page to load
  await page.waitForTimeout(3000);

  // Try to auto-select region, image, and package
  // Note: Alibaba Cloud UI is complex and dynamically loaded, auto-selection may not work perfectly
  console.log('[6] Attempting to auto-configure purchase options...');
  console.log('    Recommended config:');
  console.log('      Region: 华东1(杭州) or 华东2(上海)');
  console.log('      Image: Ubuntu 22.04');
  console.log('      Plan: 2C2G 3-4M bandwidth');
  console.log('      Duration: 1 month');
  console.log('');
  console.log('[7] Please verify the configuration and complete payment manually.');
  console.log('    DO NOT close the browser until purchase is complete.');
  console.log('');
  console.log('    After purchase, note down:');
  console.log('      - Public IP address');
  console.log('      - Root password');

  // Keep browser open for user to complete purchase
  // Close when user presses Enter in terminal
  console.log('Press Enter in this terminal after purchase is complete...');
  process.stdin.once('data', async () => {
    console.log('Closing browser...');
    await browser.close();
    console.log('Done! Please tell me the server IP and password to continue deployment.');
  });
})();
