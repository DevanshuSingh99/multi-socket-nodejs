const { Server } = require("socket.io");
const { createShardedAdapter } = require("@socket.io/redis-adapter");
const { Emitter } = require("@socket.io/redis-emitter");
const { createClient } = require("redis");
const socketClientsKey = "socket_clients";

let io;
let emitter;
let pubClient;
let subClient;
const socketIo = {};
let count = 0;

socketIo.connect = async (httpServer, port) => {
  io = new Server(httpServer, { cors: { origin: "*" }, transports: ["websocket", "polling"] });

  pubClient = createClient({ host: "127.0.0.1", port: 6380, password: "foobared" }); // Publish channel
  subClient = pubClient.duplicate(); // Subscribers channel
  await Promise.all([pubClient.connect(), subClient.connect()])
    .then(() => {
      io.adapter(createShardedAdapter(pubClient, subClient));
      httpServer.listen(port, () => {
        console.log("Socket Io Server Running");
      });
    })
    .catch((err) => {
      console.log("Error In Socket server : ", err);
    });

  emitter = new Emitter(pubClient);
  pubClient.set(socketClientsKey, 0);

  io.on("connection", async (socket) => {
    pubClient.incr(socketClientsKey);
    // socket.on("eventtt", (data) => {
    //   console.log(data);
    // });
    socket.on("disconnect", async () => {
      pubClient.decr(socketClientsKey);
      console.log(await pubClient.get(socketClientsKey));
    });

    console.log(await pubClient.get(socketClientsKey), process.pid);
    // socket.join("someRoom");
  });
};

socketIo.broadCast = (event, data) => {
  io.emit("someRoom", "dataaaa");
};

module.exports = socketIo;
