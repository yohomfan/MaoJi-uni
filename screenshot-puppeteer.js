// Screenshot using puppeteer
const puppeteer = require('puppeteer');

async function takeScreenshot(url, filename) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 1500));
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`Screenshot saved: ${filename}`);
  } catch (error) {
    console.error('Screenshot failed:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

const url = process.argv[2] || 'http://localhost:5175';
const filename = process.argv[3] || 'screenshot.png';

takeScreenshot(url, filename);
