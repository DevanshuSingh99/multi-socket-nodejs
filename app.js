const express = require("express");
const { createServer } = require("node:http");
const socket = require("./integrations/socket");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

app.get("/", (req, res) => {
  socket.broadCast();
  res.send();
});

socket.connect(httpServer);

httpServer.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
