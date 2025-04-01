//import { createServer } from "node:http";
//import next from "next";
//import { Server } from "socket.io";
const next = require("next");
const { createServer } = require("http");
const { Server } = require("socket.io");
import { INSTRUCTION_TO_USER, INSTRUCTION_TO_USER_PY, LOCATION_FROM_RESCUER, LOCATION_FROM_RESCUER_PY, LOCATION_FROM_USER, LOCATION_FROM_USER_PY, OBSTACLE_TO_RESCUER, OBSTACLE_TO_RESCUER_PY, SOS_FROM_RESCUER, SOS_FROM_RESCUER_PY, SOS_FROM_USER, SOS_FROM_USER_PY, START_LOCATION_TRANSMISSION_TO_TRU, START_LOCATION_TRANSMISSION_TO_TRU_PY, TASK_ACKNOWLEDGEMENT_FROM_RESCUER_PY, TASK_STATUS_UPDATE_FROM_RESCUER, TASK_STATUS_UPDATE_FROM_RESCUER_PY, TASK_TO_RESCUER, TASK_TO_RESCUER_PY } from "./lora/lora-tags";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
// let flag = false;

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io/"
  });

  io.on("connection", (socket) => {
    console.log("Client Connected")

    // FROM FRONTEND TO PY
    socket.on(START_LOCATION_TRANSMISSION_TO_TRU, (data) => {
      console.log(START_LOCATION_TRANSMISSION_TO_TRU, data)
      io.emit(START_LOCATION_TRANSMISSION_TO_TRU_PY, data)
    })
    socket.on(INSTRUCTION_TO_USER, (data) => {
      console.log(INSTRUCTION_TO_USER)
      console.log(data)
      io.emit(INSTRUCTION_TO_USER_PY, data)
    })
    socket.on(TASK_TO_RESCUER, (data) => {
      console.log(TASK_TO_RESCUER)
      console.log(data)
      io.emit(TASK_TO_RESCUER_PY, data)
    })
    socket.on(OBSTACLE_TO_RESCUER, (data) => {
      console.log(OBSTACLE_TO_RESCUER)
      console.log(data)
      io.emit(OBSTACLE_TO_RESCUER_PY, data)
    })

    // FROM PY TO FRONTEND 
    socket.on(LOCATION_FROM_USER_PY, (data) => {
      console.log(data)
      io.emit(LOCATION_FROM_USER, data)
    })
    socket.on(SOS_FROM_USER_PY, (data) => {
      console.log(data)
      io.emit(SOS_FROM_USER, data)
    })
    socket.on(LOCATION_FROM_RESCUER_PY, (data) => {
      console.log(data)
      io.emit(LOCATION_FROM_RESCUER, data)
    })
    socket.on(SOS_FROM_RESCUER_PY, (data) => {
      console.log(data)
      io.emit(SOS_FROM_RESCUER, data)
    })
    socket.on(TASK_ACKNOWLEDGEMENT_FROM_RESCUER_PY, (data) => {
      console.log(data)
      io.emit(SOS_FROM_RESCUER, data)
    })
    socket.on(TASK_STATUS_UPDATE_FROM_RESCUER_PY, (data) => {
      console.log(data)
      io.emit(TASK_STATUS_UPDATE_FROM_RESCUER, data)
    })
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
