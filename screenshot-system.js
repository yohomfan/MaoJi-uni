const puppeteer = require('puppeteer');

async function takeScreenshot(url, filename) {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`Screenshot saved: ${filename}`);
  } catch (error) {
    console.error('Screenshot failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Get URL and filename from command line args
const url = process.argv[2] || 'http://localhost:5173';
const filename = process.argv[3] || 'screenshot.png';

takeScreenshot(url, filename);
