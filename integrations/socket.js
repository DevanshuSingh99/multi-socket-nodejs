const { Server } = require("socket.io");

const socketIo = {};
let count = 0;
socketIo.connect = (httpServer) => {
  io = new Server(httpServer, { cors: { origin: "*" }, transports: ["websocket", "polling"] });

  io.on("connection", (socket) => {
    count++;
    // socket.on("eventtt", (data) => {
    //   console.log(data);
    // });
    socket.on("disconnect", () => {
      count--;
      console.log(count);
    });

    socket.join("someRoom");

    console.log(count);
  });
};

socketIo.broadCast = (event, data) => {
  io.emit("someRoom", "dataaaa");
};

module.exports = socketIo;
