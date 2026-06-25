const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812 });

    console.log('Navigating to app...');
    await page.goto('http://localhost:5184', { waitUntil: 'networkidle2', timeout: 30000 });

    // Clear storage to force re-initialization
    console.log('Clearing storage...');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Reload to get fresh seed data
    console.log('Reloading with fresh seed data...');
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);

    console.log('Taking homepage screenshot...');
    await page.screenshot({ path: 'logs/weight-test-1-homepage.png', fullPage: true });

    // Navigate to pet archive tab
    console.log('Navigating to pet archive...');
    const archiveTab = await page.$('.uni-tabbar__item:nth-child(2)');
    if (archiveTab) {
      await archiveTab.click();
      await delay(2000);
      console.log('Taking pet archive screenshot...');
      await page.screenshot({ path: 'logs/weight-test-2-archive.png', fullPage: true });

      // Click on the demo pet
      console.log('Looking for pet card...');
      const petCard = await page.$('.pet-card, [class*="pet"]');
      if (petCard) {
        await petCard.click();
        await delay(2000);
        console.log('Taking pet detail screenshot...');
        await page.screenshot({ path: 'logs/weight-test-3-detail.png', fullPage: true });

        // Look for weight/成长记录 button
        console.log('Looking for weight button...');
        const weightBtn = await page.evaluateHandle(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          return elements.find(el => el.textContent && el.textContent.includes('成长记录'));
        });

        if (weightBtn) {
          await weightBtn.asElement().click();
          await delay(3000);
          console.log('Taking weight page screenshot...');
          await page.screenshot({ path: 'logs/weight-test-4-weight-page.png', fullPage: true });
        } else {
          console.log('Weight button not found');
        }
      } else {
        console.log('Pet card not found');
      }
    }

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'logs/weight-test-error.png' });
  } finally {
    await browser.close();
  }
})();
