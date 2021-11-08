const puppeteer = require('puppeteer');
const { db } = require('./database/db');

(async () => {
  let scrapUntilPage = 5;

  const pages = [];
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.zapimoveis.com.br/venda/');

  for (let i = 0; i < scrapUntilPage; i++) {
    const selector =
      '#app > section.results__container > div.results__wrapper > div.results__list.js-results > section > ul > li:nth-child(6) > button';

    if (i > 0) {
      await page.waitForSelector(selector);

      await page.evaluate(nextArrowSelector => {
        document.querySelector(nextArrowSelector).click();
      }, selector);
    }

    await page.waitForTimeout(2000);

    pages.push(await scrapRealEstateURL(page));
  }

  for (const page of pages) {
    for (const realEstateURL of page) {
      const realEstatePage = await browser.newPage();
      await realEstatePage.goto(realEstateURL);

      // faz o webscrapping aii
    }
  }

  // await browser.close();
})();

async function scrapRealEstateURL(page) {
  return await page.evaluate(() => {
    const realStates = document.querySelectorAll(
      '.results__wrapper .listings__container > div',
    );
    let dataIds = [];

    realStates.forEach(realState => {
      const dataId = realState.dataset['id'];

      if (dataId) {
        dataIds.push(dataId);
      }
    });

    return dataIds;
  });
}
