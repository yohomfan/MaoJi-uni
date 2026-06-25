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

    // Clear storage first
    console.log('Clearing storage...');
    await page.goto('http://localhost:5184', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.clear();
    });
    await delay(1000);

    // Navigate directly to pet list
    console.log('Navigating to pet list...');
    await page.goto('http://localhost:5184/#/pages/pet/list', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    console.log('Taking pet list screenshot...');
    await page.screenshot({ path: 'logs/weight-direct-1-list.png', fullPage: true });

    // Navigate to pet detail
    console.log('Navigating to pet detail...');
    await page.goto('http://localhost:5184/#/pages/pet/detail?id=demo_pet_1', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    console.log('Taking pet detail screenshot...');
    await page.screenshot({ path: 'logs/weight-direct-2-detail.png', fullPage: true });

    // Navigate to weight page
    console.log('Navigating to weight page...');
    await page.goto('http://localhost:5184/#/pages/health/weight?petId=demo_pet_1', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000);
    console.log('Taking weight page screenshot...');
    await page.screenshot({ path: 'logs/weight-direct-3-weight.png', fullPage: true });

    // Check for errors in console
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    await delay(1000);

    if (logs.length > 0) {
      console.log('\nConsole logs:');
      logs.forEach(log => console.log('  ', log));
    }

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    try {
      await page.screenshot({ path: 'logs/weight-direct-error.png' });
    } catch (e) {}
  } finally {
    await browser.close();
  }
})();
