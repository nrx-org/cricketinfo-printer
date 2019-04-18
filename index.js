const http = require("http");
const debug = require("debug")("wikipedia-printer:server");
const screenshot = require("./src/screenshot");

const PORT = 8080;

const requestHandler = (request, response) => {
  return screenshot(request, response);
};

const server = http.createServer(requestHandler);

server.listen(PORT, err => {
  if (err) {
    return debug("Could not start server, error was: %O", err);
  }

  debug(`Server is listening on port ${PORT}, access it via https://localhost:${PORT}`);
});
