const { parse } = require("url");
const debug = require("debug")("wikipedia-printer:screenshot");
const cloudinary = require("cloudinary");
const base64js = require("base64-js");
const shortid = require("shortid");
const axios = require("axios");

const { getScreenshot } = require("./chromium");
const { getUrlFromPath, isValidUrl } = require("./validator");
const { saveScreenshot, findScreenshot } = require("./db");

cloudinary.config({
  cloud_name: "cricwiki",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const sendErrorResponse = (response, errorCode, message) => {
  response.statusCode = 400;
  response.setHeader("Content-Type", "application/json");
  response.end(
    JSON.stringify({
      errorCode,
      message,
      statusCode: 400
    })
  );
};

module.exports.downloadScreenshot = async function(request, response) {
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

module.exports.downloadAndCacheScreenshot = async (request, response) => {
  const { url, selector, type = "image" } = request.query;

  // Make sure this is present on all responses.
  response.setHeader("Access-Control-Allow-Origin", "*");

  if (!url || !isValidUrl(url)) {
    debug(`The URL "${url}" is not valid, bailing out`);
    response.statusCode = 400;
    response.setHeader("Content-Type", "text/html");
    response.end(
      `<h1>Bad Request</h1><p>The url <em>${url}</em> is not valid.</p>`
    );
    return;
  }

  let imageShortId = null;

  // First look for this screenshot in the database.
  const dbScreenshot = await findScreenshot({
    url,
    selector: typeof selector === "undefined" ? null : selector,
    fileType: type
  });

  if (dbScreenshot) {
    // If the screenshot exists in the database, download the image from Cloudinary and
    // send it down.
    debug(
      `Found screenshot for url "${url}", selector "${selector}", type "${type}" in database, returning the Cloudinary image`
    );
    imageShortId = dbScreenshot.shortId;
  } else {
    // If the screenshot doesn't exist in the database, create it and upload to Cloudinary.
    debug(
      `Did not find screenshot for url "${url}", selector "${selector}", type "${type}" in database, generating it now`
    );

    let imageData = null;
    try {
      imageData = await getScreenshot(
        url,
        selector,
        type === "image" ? "png" : "pdf"
      );
    } catch (e) {
      debug(
        `Error capturing screenshot for url "${url}", selector "${selector}", type "${type}", error message was: ${
          e.message
        }`
      );
      return sendErrorResponse(
        response,
        "ERR_SCREENSHOT_FAILED",
        "Could not create a screenshot for this URL"
      );
    }

    debug(
      `Generated screenshot for url "${url}", selector "${selector}", type "${type}" in database, uploading to Cloudinary`
    );

    let cloudinaryFile = null;
    try {
      cloudinaryFile = await new Promise((resolve, reject) =>
        cloudinary.v2.uploader.upload(
          `data:image/png;base64,${base64js.fromByteArray(imageData)}`,
          { folder: "/screenshots/" },
          (error, result) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        )
      );
    } catch (e) {
      debug(
        `Error uploading screenshot to Cloudinary for url "${url}", selector "${selector}", type "${type}", error code: ${
          e.code
        }`
      );
      return sendErrorResponse(
        response,
        "ERR_CACHE_FAILED",
        "Could not save the screenshot to the cloud"
      );
    }

    debug(
      `Uploaded screenshot to Cloudinary for url "${url}", selector "${selector}", type "${type}" in database, saving data in local DB`
    );

    // Save info to database.
    imageShortId = shortid();
    await saveScreenshot({
      url,
      selector,
      fileType: type,
      screenshotUrl: cloudinaryFile.secure_url,
      shortId: imageShortId
    });
  }

  response.setHeader("Content-Type", "application/json");
  response.end(
    JSON.stringify({
      shareUrl: `http://sharecricketinfo.io/f/${imageShortId}`
    })
  );
};

module.exports.downloadCloudinaryScreenshot = async (request, response) => {
  const { shortId } = request.params;
  const screenshot = await findScreenshot({ shortId });

  if (!screenshot) {
    response.statusCode = 404;
    response.end("<h1>Image not found</h1>");
    return;
  }

  let screenshotResponse = null;
  try {
    screenshotResponse = await axios({
      method: "get",
      url: screenshot.screenshotUrl,
      responseType: "arraybuffer"
    });
  } catch (e) {
    response.statusCode = 400;
    response.end("<h1>Error downloading image</h1>");
    return;
  }

  if (screenshot.fileType === "image") {
    response.setHeader("Content-Type", "image/png");
  } else if (screenshot.fileType === "pdf") {
    response.setHeader("Content-Type", "application/pdf");
  }

  response.end(screenshotResponse.data);
};
