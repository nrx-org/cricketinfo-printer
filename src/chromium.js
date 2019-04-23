const puppeteer = require("puppeteer");
const debug = require("debug")("wikipedia-printer:chromium");
const nodeCleanup = require("node-cleanup");

let BROWSER = null;

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
  if (!BROWSER) {
    debug("Starting browser");
    BROWSER = await puppeteer.launch({
      headless: true
    });
  }

  debug(`Navigating to URL ${url}`);
  const page = await BROWSER.newPage();
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

  debug("Closing page");
  await page.close();

  return file;
}

async function getPDF(url) {
  if (!BROWSER) {
    debug("Starting browser");
    BROWSER = await puppeteer.launch({
      headless: true
    });
  }

  debug(`Navigating to URL ${url}`);
  const page = await BROWSER.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  debug("Creating PDF file");
  const file = await page.pdf({ format: "A4" });

  debug("Closing page");
  await page.close();

  return file;
}

nodeCleanup(async (exitCode, signal) => {
  debug("Cleaning up before exiting the app");
  await BROWSER.close();

  if (signal) {
    nodeCleanup.uninstall();
    process.kill(process.pid, signal);
    return false;
  }
});

module.exports = { getScreenshot };
