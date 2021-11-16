const puppeteer = require('puppeteer');
const { db } = require('./database/db');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(
    'https://www.vivareal.com.br/venda/rj/rio-de-janeiro/apartamento_residencial/',
  );

  const announceDatas = await page.evaluate(async () => {
    const selector =
      '#js-site-main > div.results__container > div.results__content > section > div.results-main__panel.js-list > div.results-list.js-results-list > div > div > article';

    const announces = [...document.querySelectorAll(selector)];

    const announcesData = [];

    let index = 0;
    for (const announce of announces) {
      const urlElement = announce.querySelector('a:nth-child(2)');
      const priceElement = announce.querySelector(
        'a:nth-child(2) > div > section > div > p',
      );
      const titleElement = announce.querySelector(
        'a:nth-child(2) > div > h2 > span',
      );

      announce.querySelector('.js-phone-lead').click();

      await new Promise(r => setTimeout(r, 1000));

      const phone = document.querySelector(
        '#js-site-main > div.results__container > div.js-decision-lead-vue.vue-lead-form > div > div > section > p > a',
      );

      const announceData = {
        url: urlElement.href,
        price: priceElement ? priceElement.innerText : undefined,
        title: titleElement ? titleElement.innerText : undefined,
        phone: phone ? phone.innerText : undefined,
      };

      announcesData.push(announceData);

      document
        .querySelector(
          '#js-site-main > div.results__container > div.js-decision-lead-vue.vue-lead-form > div > div > section > button',
        )
        .click();

      index++;

      await new Promise(r => setTimeout(r, 8000));
    }

    return await Promise.all(scrapAnnouncesPromises);
  });

  for (const announceData of announceDatas) {
    await db('real_estate').insert(announceData);
  }

  console.log(announceDatas);
})();
