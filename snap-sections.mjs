import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle2', timeout: 30000 });

await page.waitForFunction(() => typeof window.__apnGoTo === 'function', { timeout: 10000 });

const clean = () => page.evaluate(() => {
  document.querySelectorAll('nextjs-portal').forEach(el => el.remove());
});

const snap = async (name) => {
  await clean();
  await page.screenshot({ path: `${dir}/${name}.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log(`saved: ${name}`);
};

const goTo = async (idx) => {
  await page.evaluate((i) => window.__apnGoTo(i), idx);
  await new Promise(r => setTimeout(r, 800));
};

await snap('apn-s1-faith');
await goTo(1);
await snap('apn-s2-family');
await goTo(2);
await snap('apn-s3-america');
await goTo(3);
await snap('apn-s4-fitness');

await browser.close();
console.log('done');
