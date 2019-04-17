const puppeteer = require('puppeteer');

async function getScreenshot(url, selector, type) {
  console.info("Starting browser ...");
  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();
  page.setViewport({width: 420, height: 780, deviceScaleFactor: 3});
  await page.goto(url, {waitUntil: "networkidle0"});

  console.info("Finding element size ...");
  let clip = null;
  if (selector) {
    clip = await page.evaluate((selector) => {
      const element = document.querySelector(selector);

      if (!element) {
        return null;
      }

      const {x, y, width, height} = element.getBoundingClientRect();
      return {x, y, width, height};
    }, selector);
  }

  console.info("Creating file ...");
  let file = null;
  if (type === 'pdf') {
    file = await page.pdf({width: "300px", height: "600px"});
  } else {
    file = await page.screenshot({type, clip});
  }

  await browser.close();
  return file;
}

module.exports = {getScreenshot};
