const cluster = require("cluster");
const express = require("express");
const { createServer } = require("node:http");
const socket = require("./integrations/socket");
const { Server } = require("socket.io");

function createApp() {
  const app = express();
  const httpServer = createServer(app);

  return httpServer;
}

if (cluster.isMaster) {
  // Master process: Fork workers
  console.log(`Master process ${process.pid} is running`);

  const numCPUs = require("os").cpus().length;
  console.log(numCPUs, "TOTLA CPUS");
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({});
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker process: Create and run the app
  console.log(`Worker process ${process.pid} started`);
  const httpServer = createApp();

  // Create Socket.IO server instance in the child process
  socket.connect(httpServer); // Connect Socket.IO instance to the server

  httpServer.listen(3000, () => {
    console.log("Server on 3000");
  });
}
