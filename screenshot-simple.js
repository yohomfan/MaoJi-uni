// Simple screenshot using playwright when available
const playwright = require('playwright');

async function takeScreenshot(url, filename) {
  let browser;
  try {
    // Try chromium first, then firefox, then webkit
    browser = await playwright.chromium.launch({ headless: true });
  } catch (e1) {
    try {
      browser = await playwright.firefox.launch({ headless: true });
    } catch (e2) {
      try {
        browser = await playwright.webkit.launch({ headless: true });
      } catch (e3) {
        console.error('No browser available:', e3.message);
        process.exit(1);
      }
    }
  }

  try {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`Screenshot saved: ${filename}`);
  } catch (error) {
    console.error('Screenshot failed:', error.message);
  } finally {
    await browser.close();
  }
}

const url = process.argv[2] || 'http://localhost:5173';
const filename = process.argv[3] || 'screenshot.png';

takeScreenshot(url, filename);
