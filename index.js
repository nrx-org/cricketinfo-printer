const http = require('http');
const screenshot = require("./src/screenshot");

const PORT = 8080;

const requestHandler = (request, response) => {
  return screenshot(request, response);
};

const server = http.createServer(requestHandler);

server.listen(PORT, (err) => {
  if (err) {
    return console.log('Something bad happened', err)
  }

  console.log(`Server is listening on ${PORT}`);
});
