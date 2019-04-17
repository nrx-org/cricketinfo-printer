const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function getScreenshot(url, selector, type) {
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });

  const page = await browser.newPage();
  page.setViewport({ width: 420, height: 780, deviceScaleFactor: 3 });
  await page.goto(url);

  let clip = null;
  if (selector) {
    clip = await page.evaluate(() => {
      const element = document.querySelector(".wcp-fact-card.wcp-summary-fact-card");

      if (!element) {
        return null;
      }

      return element.getBoundingClientRect();
    });
  }

  let file = null;
  if (type === 'pdf') {
    file = await page.pdf({width: "300px", height: "600px"});
  } else {
    file = await page.screenshot({type, fullPage: true, clip});
  }

  await browser.close();
  return file;
}

module.exports = {getScreenshot};
