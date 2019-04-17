const {parse} = require('url');
const {getScreenshot} = require('./chromium');
const {getUrlFromPath, isValidUrl} = require('./validator');

module.exports = async function (req, res) {
  try {
    const {pathname = '/', query = {}} = parse(req.url, true);
    const {type = 'png', selector = null} = query;
    const url = getUrlFromPath(pathname);

    if (!isValidUrl(url)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/html');
      res.end(`<h1>Bad Request</h1><p>The url <em>${url}</em> is not valid.</p>`);
      return;
    }

    console.log(`Printing ${url}, selector is ${selector}, type is ${type} ...`);
    const file = await getScreenshot(url, selector, type);
    res.statusCode = 200;
    res.setHeader('Content-Type', `image/${type}`);
    res.end(file);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end(`<h1>Server Error</h1><p>Sorry, there was a problem</p><p><em>${e.message}</em></p>`);
    console.error(e.message);
  }
};
