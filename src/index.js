const puppeteer = require('puppeteer');
const { db } = require('./database/db');
const { v4: uuid } = require('uuid');

(async () => {
  let scrapUntilPage = 1;

  const pagesLinks = [];
  const pagesData = [];
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
    pagesLinks.push(
      (await scrapRealEstateURL(page)).map(
        link => `https://www.zapimoveis.com.br/imovel/${link}`,
      ),
    );
  }

  for (const page of pagesLinks) {
    for (const realEstateURL of page) {
      const realEstatePage = await browser.newPage();
      console.log(realEstateURL);
      await realEstatePage.goto(realEstateURL);

      pagesData.push(await scrapRealEstateData(realEstatePage, realEstateURL));

      await realEstatePage.close();
    }
  }

  console.log(pagesData);

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

async function scrapRealEstateData(page, url) {
  const scrappedData = await page.evaluate(() => {
    const type = new String(
      document.querySelector(
        '#app > div > section > article.main__info.container > div > div.box--flex-grow > div.box--display-flex.box--items-baseline > p > span',
      ).innerText,
    ).split(' ')[0];

    const price = document.querySelector(
      '#app > div > section > article.main__info.container > div > div.box--flex-grow > div.info__base > div > ul.main-prices > li > strong',
    ).innerText;
    const location = document.querySelector(
      '#app > div > section > article.main__info.container > div > div.box--flex-grow > div.box--display-flex.box--items-baseline > p > button > span.link',
    ).innerText;

    let contact = null;

    if (
      document.querySelector(
        '#app > div > section > div.lead-modal-cta.js-mobile-actions-top.lead-modal-cta--mobile > div > div > div > div.lead-wpp > button',
      )
    ) {
      document
        .querySelector(
          '#app > div > section > div.lead-modal-cta.js-mobile-actions-top.lead-modal-cta--mobile > div > div > div > div.lead-wpp > button',
        )
        .click();

      setTimeout(() => {
        document
          .querySelector(
            '#app > div > section > dialog > main > section > div > div > div > div > div > button',
          )
          .click();

        setTimeout(() => {
          contact = document.querySelector(
            '#app > div > section > dialog > main > section > div > header > div > div > a',
          ).innerText;
          document
            .querySelector(
              '#app > div > section > dialog > main > header > button',
            )
            .click();
        }, 2000);
      }, 2000);
    }

    return {
      price,
      location,
      contact,
      type,
    };
  });

  return {
    id: uuid(),
    url,
    ...scrappedData,
  };
}
