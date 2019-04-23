module.exports = {
  apps: [
    {
      name: "wikipedia-printer",
      script: "./index.js",
      env: {
        DEBUG: "wikipedia-printer:*",
        NODE_ENV: "production"
      }
    }
  ]
};
