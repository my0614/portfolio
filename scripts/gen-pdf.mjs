import pkg from '../node_modules/playwright-core/index.js';
const { chromium } = pkg;

const OUTPUT = new URL('../public/projects/포트폴리오_김민영.pdf', import.meta.url).pathname;

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage();
await page.goto('http://localhost:3001/portfolio-pdf', { waitUntil: 'networkidle', timeout: 15000 });

await page.pdf({
  path: OUTPUT,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: false,
  margin: { top: '12mm', bottom: '12mm', left: '0', right: '0' },
});

await browser.close();
console.log('✓ PDF saved:', OUTPUT);
