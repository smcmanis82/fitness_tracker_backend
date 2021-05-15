// create the express server here
const { PORT = 3000 } = process.env;

const express = require("express");
const server = express();

const cors = require("cors");
server.use(cors());

const morgan = require("morgan");
server.use(morgan("dev"));

const bodyParser = require("body-parser");
server.use(bodyParser.json());

const client = require("./db/client.js");

const apiRouter = require("./api");
server.use("/api", apiRouter);

// error handler
server.use("*", (req, res, next) => {
  res.status(404);
  res.send({ error: "route not found" });
});

server.use((error, req, res, next) => {
  console.error(error);
  res.status(500);
  res.send({ error: "internal server error" });
});

server.listen(PORT, () => {
  client.connect();
  console.log(`App listening on port`, PORT);
});
