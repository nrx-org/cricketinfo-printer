const puppeteer = require("puppeteer");
const debug = require("debug")("wikipedia-printer:chromium");

async function getScreenshot(url, selector, type) {
  if (type.toLocaleLowerCase() === "pdf") {
    debug("Generating a PDF");
    return getPDF(url);
  } else {
    debug("Generating a PNG");
    return getPNG(url, selector);
  }
}

async function getPNG(url, selector) {
  debug("Starting browser");
  const browser = await puppeteer.launch({
    headless: true
  });

  debug(`Navigating to URL ${url}`);
  const page = await browser.newPage();
  page.setViewport({ width: 420, height: 780, deviceScaleFactor: 3 });
  await page.goto(url, { waitUntil: "networkidle0" });

  debug("Finding element size");
  let clip = null;
  if (selector) {
    clip = await page.evaluate(selector => {
      const element = document.querySelector(selector);

      if (!element) {
        return null;
      }

      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    }, selector);
  }

  debug("Creating PNG file");
  const file = await page.screenshot({ type: "png", clip });

  debug("Closing browser");
  await browser.close();

  return file;
}

async function getPDF(url) {
  debug("Starting browser");
  const browser = await puppeteer.launch({
    headless: true
  });

  debug(`Navigating to URL ${url}`);
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  debug("Creating PDF file");
  const file = await page.pdf({ width: "300px", height: "600px" });

  debug("Closing browser");
  await browser.close();

  return file;
}

module.exports = { getScreenshot };
