import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { SEND_EVACUATION_INSTRUCTION_TO_BRACELETS, SEND_RECEIVED_LOCATION_TO_CLIENT, SEND_TASK_TO_RESCUER, SEND_TRANSMIT_LOCATION_SIGNAL_TO_BRACELETS } from "./tags";
import { sendEvacuationInstructionToBracelets, sendTaskToRescuer, sendTransmitLocationSignalToBracelets } from "./socket/actions/to-bracelets";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
// let flag = false;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on(SEND_TRANSMIT_LOCATION_SIGNAL_TO_BRACELETS, sendTransmitLocationSignalToBracelets)
    socket.on(SEND_EVACUATION_INSTRUCTION_TO_BRACELETS, sendEvacuationInstructionToBracelets)
    socket.on(SEND_TASK_TO_RESCUER, sendTaskToRescuer)
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