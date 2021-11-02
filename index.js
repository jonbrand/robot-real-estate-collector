const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.zapimoveis.com.br/venda/');
  await page.evaluate(() => {
    const nodeList = document.querySelectorAll('div section a');

    const imgArray = [...nodeList];

    const list = imgArray.map( ({href}) => ({
      href
    }));

    console.log(list)
  });

  // await browser.close();
})();