const express = require("express");
const debug = require("debug")("wikipedia-printer:server");
const {
  downloadScreenshot,
  downloadAndCacheScreenshot,
  downloadCloudinaryScreenshot
} = require("./src/screenshot");
const { init: dbInit } = require("./src/db");

const PORT = 8080;

const start = async () => {
  await dbInit();

  const app = express();
  app.get("/screenshot", downloadAndCacheScreenshot);
  app.get("/f/:shortId", downloadCloudinaryScreenshot);
  app.get("/*", downloadScreenshot);

  app.listen(PORT, err => {
    if (err) {
      return debug("Could not start server, error was: %O", err);
    }

    debug(
      `Server is listening on port ${PORT}, access it via https://localhost:${PORT}`
    );
  });
};

start();
