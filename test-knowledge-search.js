// Test knowledge search empty state
const puppeteer = require('puppeteer');

async function testSearch() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:5179/#/pages/knowledge/list', {
      waitUntil: 'networkidle0',
      timeout: 15000
    });

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find and click search input
    await page.click('.u-search__content');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Type nonsense keyword
    await page.type('input[type="text"]', 'xyz不存在的关键词xyz');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Press enter or click search
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Take screenshot
    await page.screenshot({ path: 'logs/knowledge-empty-search.png', fullPage: true });
    console.log('Screenshot saved: logs/knowledge-empty-search.png');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testSearch();
