const puppeteer = require('puppeteer');

(async () => {
  let scrapUntilPage = 5;

  const data = {};
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.zapimoveis.com.br/venda/');

  for (let i = 0; i < scrapUntilPage; i++) {
    if (i > 0) {
      await page.evaluate(() => {
        document
          .querySelector(
            '#app > section.results__container > div.results__wrapper > div.results__list.js-results > section > ul > li:nth-child(6) > button',
          )
          .click();
      });
    }

    await page.waitForTimeout(2000);

    data[i] = await scrapPage(page);
  }

  console.log(data);

  // await browser.close();
})();

async function scrapPage(page) {
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