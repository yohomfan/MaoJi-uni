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

    console.log('1. Clearing storage and loading app...');
    await page.goto('http://localhost:5184', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);

    console.log('2. Directly injecting demo data via localStorage...');
    await page.evaluate(() => {
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
      const oneDay = 24 * 60 * 60 * 1000;
      const oneMonth = 30 * oneDay;

      const weightRecords = [
        { id: 'w1', petId: 'demo_pet_1', type: 'weight', name: '体重记录', date: now - 6 * oneMonth, weightValue: 3.8, note: '刚领养回家' },
        { id: 'w2', petId: 'demo_pet_1', type: 'weight', name: '体重记录', date: now - 5 * oneMonth, weightValue: 4.0, note: '' },
        { id: 'w3', petId: 'demo_pet_1', type: 'weight', name: '体重记录', date: now - 4 * oneMonth, weightValue: 4.2, note: '' },
        { id: 'w4', petId: 'demo_pet_1', type: 'weight', name: '体重记录', date: now - 3 * oneMonth, weightValue: 4.3, note: '' },
        { id: 'w5', petId: 'demo_pet_1', type: 'weight', name: '体重记录', date: now - 2 * oneMonth, weightValue: 4.4, note: '' },
        { id: 'w6', petId: 'demo_pet_1', type: 'weight', name: '体重记录', date: now - oneMonth, weightValue: 4.5, note: '' },
        { id: 'w7', petId: 'demo_pet_1', type: 'weight', name: '体重记录', date: now - 15 * oneDay, weightValue: 4.5, note: '体重稳定' }
      ];

      localStorage.setItem('pets', JSON.stringify([demoPet]));
      localStorage.setItem('health_records', JSON.stringify(weightRecords));
      localStorage.setItem('demo_data_initialized', 'true');

      console.log('Demo data injected:', { pets: [demoPet], records: weightRecords.length });
    });

    console.log('3. Reloading to pick up injected data...');
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);
    await page.screenshot({ path: 'logs/comprehensive-1-home.png', fullPage: true });

    console.log('4. Navigating to weight page...');
    await page.goto('http://localhost:5184/#/pages/health/weight?petId=demo_pet_1', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await delay(3000);

    console.log('5. Taking weight page screenshot...');
    await page.screenshot({ path: 'logs/comprehensive-2-weight-chart.png', fullPage: true });

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    try {
      await page.screenshot({ path: 'logs/comprehensive-error.png' });
    } catch (e) {}
  } finally {
    await browser.close();
  }
})();
