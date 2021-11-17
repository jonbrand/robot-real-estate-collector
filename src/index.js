const puppeteer = require('puppeteer');
const { db } = require('./database/db');

(async () => {
  const amountOfPagesToBeScrapped = 3;
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const announceDatas = [];
  await page.goto(
    'https://www.vivareal.com.br/venda/rj/rio-de-janeiro/apartamento_residencial/',
  );

  const pageLinks = [];

  for (let i = 1; i <= amountOfPagesToBeScrapped; i++) {
    pageLinks.push(await scrapLinks(page));

    await page.goto(
      `https://www.vivareal.com.br/venda/rj/rio-de-janeiro/apartamento_residencial/?pagina=${i}`,
    );

    await new Promise(r => setTimeout(r, 2000));
  }

  const flattedPageLinks = pageLinks.flat(Infinity);
  for (const pageLink of flattedPageLinks.slice(0, 2)) {
    const newPage = await browser.newPage();
    await newPage.goto(pageLink);

    await newPage.waitForSelector('.js-see-phone');
    const announceData = {};

    const urlTitleAndPrice = await newPage.evaluate(async pageLink => {
      const titleElement = document.querySelector(
        '#js-site-main > div.main-container > div.main-features-container > div.address-container > section > div > h1',
      );
      const priceElement = document.querySelector(
        '#js-site-main > div.main-container > div.side-bar-container > div.price-container > div > div.price__content-wrapper > h3',
      );

      return {
        title: titleElement ? titleElement.innerText : undefined,
        price: priceElement ? priceElement.innerText : undefined,
        url: pageLink,
      };
    }, pageLink);

    announceData['title'] = urlTitleAndPrice.title;
    announceData['price'] = urlTitleAndPrice.price;
    announceData['url'] = urlTitleAndPrice.url;

    await newPage.click('.js-see-phone');
    await newPage.waitForSelector(
      '#js-site-main > div.results__container > div.js-decision-lead-vue.vue-lead-form > div > div > section > p > a:last-child',
    );

    const contact = await newPage.evaluate(() => {
      const phoneElement = document.querySelector(
        '#js-site-main > div.results__container > div.js-decision-lead-vue.vue-lead-form > div > div > section > p > a:last-child',
      );

      return phoneElement.innerText;
    });

    announceData['contact'] = contact;

    announceDatas.push(announceData);

    await newPage.close();
    await new Promise(r => setTimeout(r, 5000));
  }

  for (const announceData of announceDatas) {
    await db('real_estate').insert(announceData);
  }

  await browser.close();
})();

async function scrapLinks(page) {
  return await page.evaluate(() => {
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
}
