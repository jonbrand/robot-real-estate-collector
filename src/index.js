const puppeteer = require('puppeteer');
const { db } = require('./database/db');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const announceDatas = [];
  await page.goto(
    'https://www.vivareal.com.br/venda/rj/rio-de-janeiro/apartamento_residencial/',
  );

  const pageLinks = await page.evaluate(() => {
    const selector =
      '#js-site-main > div.results__container > div.results__content > section > div.results-main__panel.js-list > div.results-list.js-results-list > div > div > article';

    const announces = [...document.querySelectorAll(selector)];

    const links = [];

    for (const announce of announces) {
      const urlElement = announce.querySelector('a:nth-child(2)');

      if (urlElement) {
        links.push(urlElement.href);
      }
    }

    return links;
  });

  for (const pageLink of pageLinks) {
    const newPage = await browser.newPage();
    await newPage.goto(pageLink);

    const announceData = await newPage.evaluate(pageLink => {
      const titleElement = document.querySelector(
        '#js-site-main > div.main-container > div.main-features-container > div.address-container > section > div > h1',
      );
      const priceElement = document.querySelector(
        '#js-site-main > div.main-container > div.side-bar-container > div.price-container > div > div.price__content-wrapper > h3',
      );

      /*document.querySelector('.js-phone-lead').click();

      await new Promise(r => setTimeout(r, 1000));

      const phoneElement = document.querySelector(
        '#js-site-main > div.results__container > div.js-decision-lead-vue.vue-lead-form > div > div > section > p > a',
      );*/

      return {
        title: titleElement ? titleElement.innerText : undefined,
        price: priceElement ? priceElement.innerText : undefined,
        // phone: phoneElement ? phoneElement.innerText : undefined,
        contact: '+5531996219283',
        url: pageLink,
      };
    }, pageLink);

    announceDatas.push(announceData);

    await newPage.close();

    await new Promise(r => setTimeout(r, 3000));
  }

  for (const announceData of announceDatas) {
    await db('real_estate').insert(announceData);
  }

  await browser.close();
})();
