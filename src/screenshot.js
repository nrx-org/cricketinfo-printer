const { parse } = require("url");
const debug = require("debug")("wikipedia-printer:screenshot");

const { getScreenshot } = require("./chromium");
const { getUrlFromPath, isValidUrl } = require("./validator");

module.exports = async function(request, response) {
  try {
    const { pathname = "/", query = {} } = parse(request.url, true);
    const { type = "png", selector = null } = query;
    const url = getUrlFromPath(pathname);

    if (!isValidUrl(url)) {
      debug(`The URL "${url}" is not valid, bailing out`);
      response.statusCode = 400;
      response.setHeader("Content-Type", "text/html");
      response.end(
        `<h1>Bad Request</h1><p>The url <em>${url}</em> is not valid.</p>`
      );
      return;
    }

    debug(
      `Printing URL ${url}, picking selector ${selector}, returning file of type ${type}`
    );
    const file = await getScreenshot(url, selector, type);
    response.statusCode = 200;
    response.setHeader(
      "Content-Type",
      type.toLocaleLowerCase() === "pdf" ? "application/pdf" : `image/${type}`
    );

    if (type.toLocaleLowerCase() === "pdf") {
      response.setHeader(
        "Content-disposition",
        `attachment; filename=download.pdf`
      );
    }

    response.end(file);
  } catch (e) {
    response.statusCode = 500;
    response.setHeader("Content-Type", "text/html");
    response.end(
      `<h1>Server Error</h1><p>Sorry, there was a problem</p><p><em>${
        e.message
      }</em></p>`
    );
    console.error(e.message);
  }
};
