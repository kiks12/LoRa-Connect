import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { INSTRUCTION_TO_USER, INSTRUCTION_TO_USER_FOR_PY, LOCATION_FROM_RESCUER, LOCATION_FROM_RESCUER_FROM_PY, LOCATION_FROM_USER, LOCATION_FROM_USER_FROM_PY, START_LOCATION_TRANSMISSION_TO_TRU, START_LOCATION_TRANSMISSION_TO_TRU_FOR_PY, TASK_TO_RESCUER, TASK_TO_RESCUER_FOR_PY } from "./lora/lora-tags";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
// let flag = false;

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Client Connected")

    // FROM FRONTEND TO PY
    socket.on(START_LOCATION_TRANSMISSION_TO_TRU, () => {
      console.log("START LOCATION TRANSMISSION TO TRU")
      io.emit(START_LOCATION_TRANSMISSION_TO_TRU_FOR_PY)
    })
    socket.on(INSTRUCTION_TO_USER, (data) => {
      console.log(data)
      io.emit(INSTRUCTION_TO_USER_FOR_PY, data)
    })
    socket.on(TASK_TO_RESCUER, (data) => {
      console.log(data)
      io.emit(TASK_TO_RESCUER_FOR_PY, data)
    })

    // FROM PY TO FRONTEND 
    socket.on(LOCATION_FROM_RESCUER_FROM_PY, (data) => {
      console.log(data)
      io.emit(LOCATION_FROM_RESCUER, data)
    })
    socket.on(LOCATION_FROM_USER_FROM_PY, (data) => {
      console.log(data)
      io.emit(LOCATION_FROM_USER, data)
    })
  });

  /* 
  TRIAL FOR SENDING OWNER DATA TO CLIENT
  Uncomment when testing sockets
  */
  // setInterval(async () => {
  //   console.log("SEND OWNER LOCATION", flag)
  //   if (flag) {
  //     io.emit(SEND_RECEIVED_LOCATION_TO_CLIENT, {braceletId: "X1238MN12", latitude: 15.157256485336857, longitude: 120.59060402998092, rescuer: false}) // get data from lora
  //   } else {
  //     io.emit(SEND_RECEIVED_LOCATION_TO_CLIENT, {braceletId: "X1238MN12", latitude: 15.158802428794475, longitude: 120.59299334981209, rescuer: false}) // get data from lora
  //   }
  // }, 3000)

  /*
  TRIAL FOR SENDING RESCUER DATA TO CLIENT
  Uncomment when testing sockets
  */
  // setInterval(async () => {
  //   console.log("SEND RESCUER LOCATION", flag)
  //   if (flag) {
  //     io.emit(SEND_RECEIVED_LOCATION_TO_CLIENT, {braceletId: "12123ANEHMAS", latitude: 15.158802428794475, longitude: 120.59299334981209, rescuer: true}) // get data from lora
  //   } else {
  //     io.emit(SEND_RECEIVED_LOCATION_TO_CLIENT, {braceletId: "12123ANEHMAS", latitude: 15.157256485336857, longitude: 120.59060402998092, rescuer: true}) // get data from lora
  //   }
  //   flag = !flag
  // }, 3000)

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});