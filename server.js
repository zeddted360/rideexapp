// server.js (CommonJS version)
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      // Handle all requests through Next.js
      handle(req, res);
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(
        `> Server listening at http://localhost:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`
      );
    });
  })
  .catch((err) => {
    console.error("Error starting Next.js server:", err);
    process.exit(1);
  });
