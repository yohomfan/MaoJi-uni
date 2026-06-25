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

    console.log('1. Injecting pet data...');
    await page.goto('http://localhost:5184');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('pets', JSON.stringify([{
        id: 'demo_pet_1',
        _openid: 'demo_user',
        name: '毛球',
        species: 'cat',
        breed: '英国短毛猫',
        gender: 'male',
        birthday: new Date(2022, 5, 15).getTime(),
        weight: 4.5,
        isNeutered: 'yes',
        createTime: Date.now()
      }]));
    });

    console.log('2. Navigating to album page (empty state)...');
    await page.goto('http://localhost:5184/#/pages/pet/album?id=demo_pet_1', {
      waitUntil: 'networkidle2'
    });
    await delay(2000);
    await page.screenshot({ path: 'logs/album-1-empty.png', fullPage: true });

    console.log('3. Adding mock photos...');
    await page.evaluate(() => {
      const photos = [
        { id: 'p1', url: 'https://via.placeholder.com/300/FF8A65/FFF?text=Photo1', date: Date.now() - 7*24*60*60*1000 },
        { id: 'p2', url: 'https://via.placeholder.com/300/66BB6A/FFF?text=Photo2', date: Date.now() - 5*24*60*60*1000 },
        { id: 'p3', url: 'https://via.placeholder.com/300/42A5F5/FFF?text=Photo3', date: Date.now() - 3*24*60*60*1000 },
        { id: 'p4', url: 'https://via.placeholder.com/300/FFA726/FFF?text=Photo4', date: Date.now() - 1*24*60*60*1000 },
        { id: 'p5', url: 'https://via.placeholder.com/300/AB47BC/FFF?text=Photo5', date: Date.now() },
      ];
      localStorage.setItem('pet_photos_demo_pet_1', JSON.stringify(photos));
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);
    console.log('4. Taking grid view screenshot...');
    await page.screenshot({ path: 'logs/album-2-grid.png', fullPage: true });

    console.log('5. Clicking first photo to preview...');
    const firstPhoto = await page.$('.photo-item');
    if (firstPhoto) {
      await firstPhoto.click();
      await delay(1500);
      await page.screenshot({ path: 'logs/album-3-preview.png' });
    }

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
