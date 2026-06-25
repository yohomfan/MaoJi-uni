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

    // Enable console logging
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    console.log('Injecting data and navigating...');
    await page.goto('http://localhost:5184', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.clear();
      const demoPet = {
        id: 'demo_pet_1',
        _openid: 'demo_user_h5_12345',
        name: '毛球',
        species: 'cat',
        breed: '英国短毛猫',
        gender: 'male',
        birthday: new Date(2022, 5, 15).getTime(),
        avatar: '',
        weight: 4.5,
        isNeutered: 'yes',
        chipNo: '',
        createTime: Date.now()
      };

      const now = Date.now();
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      const weightRecords = Array.from({ length: 7 }, (_, i) => ({
        id: `w${i+1}`,
        petId: 'demo_pet_1',
        type: 'weight',
        name: '体重记录',
        date: now - (6-i) * oneMonth,
        weightValue: 3.8 + i * 0.1,
        note: i === 0 ? '刚领养回家' : ''
      }));

      localStorage.setItem('pets', JSON.stringify([demoPet]));
      localStorage.setItem('health_records', JSON.stringify(weightRecords));
    });

    await page.goto('http://localhost:5184/#/pages/health/weight?petId=demo_pet_1', {
      waitUntil: 'networkidle2'
    });
    await delay(5000);

    // Scroll down to see the chart
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(2000);

    console.log('Taking screenshots...');
    await page.screenshot({ path: 'logs/chart-full-page.png', fullPage: true });
    await page.screenshot({ path: 'logs/chart-viewport.png' });

    // Check if chart canvas exists
    const hasCanvas = await page.evaluate(() => {
      const canvas = document.querySelector('canvas, #weight-chart-canvas');
      return {
        found: !!canvas,
        id: canvas?.id,
        className: canvas?.className,
        width: canvas?.width,
        height: canvas?.height
      };
    });
    console.log('Canvas check:', hasCanvas);

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
