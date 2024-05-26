const cluster = require("cluster");
const express = require("express");
const { createServer } = require("node:http");
const socket = require("./integrations/cluster-socket");
const { Server } = require("socket.io");
const port = 3000;
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

  //   console.log(cluster.schedulingPolicy);
  //   if (cluster.schedulingPolicy !== undefined) {
  //     cluster.schedulingPolicy = cluster.SCHED_RR;
  //   } else {
  //     console.warn("Round-robin scheduling policy not supported by this Node.js version.");
  //   }

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
  socket.connect(httpServer, port); // Connect Socket.IO instance to the server

  //   httpServer.listen(3000, () => {
  //     console.log("Server on 3000");
  //   });
}
