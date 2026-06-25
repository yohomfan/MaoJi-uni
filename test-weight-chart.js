const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 });

    console.log('Navigating to app...');
    await page.goto('http://localhost:5184', { waitUntil: 'networkidle2', timeout: 30000 });

    await delay(2000);

    console.log('Taking homepage screenshot...');
    await page.screenshot({ path: 'logs/test-homepage.png' });

    // Try to navigate to weight page
    try {
      console.log('Looking for weight/health navigation...');
      await delay(1000);

      // Click on pet archive tab
      const petTabSelector = '.uni-tabbar__item:nth-child(2)';
      await page.waitForSelector(petTabSelector, { timeout: 5000 });
      await page.click(petTabSelector);
      await delay(1500);

      console.log('Taking pet list screenshot...');
      await page.screenshot({ path: 'logs/test-pet-list.png' });

    } catch (err) {
      console.log('Could not navigate to weight page:', err.message);
      console.log('Taking error screenshot...');
      await page.screenshot({ path: 'logs/test-error.png' });
    }

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
