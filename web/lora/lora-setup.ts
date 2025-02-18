
import EventEmitter from "events"
import spi, { SpiMessage } from "spi-device"
import rpio from "rpio"
import { INSTRUCTION_TO_USER, START_LOCATION_TRANSMISSION_TO_TRU, TASK_TO_RESCUER } from "@/lora-tags"

const NSS_PIN = 8 // Chip Select pin of LoRa
const RESET_PIN = 22 // Reset pin of LoRa
const DIO0_PIN = 17 // interrupt pin of LoRa
export const loraEvents = new EventEmitter()

const SLEEP_MODE = 0x80
const STANDBY_MODE = 0x81
const TRANSMITTING_MODE = 0x83 // TX Mode
const RECEIVING_CONTINOUS_MODE = 0x85
const RECEIVING_SINGLE_MODE = 0x86
const CAD_MODE = 0x87

rpio.open(NSS_PIN, rpio.OUTPUT, rpio.HIGH)
rpio.open(RESET_PIN, rpio.OUTPUT, rpio.HIGH)
rpio.open(DIO0_PIN, rpio.INPUT, rpio.PULL_DOWN)

export const loRaSPI = spi.open(0, 0, err => {
  if (err) throw err
  console.log("LoRa module SPI initialized")
})

export async function setupLoRa() {
  console.log("Configuring SX1278 for LoRa mode...");

  rpio.write(RESET_PIN, rpio.LOW);
  rpio.msleep(10);
  rpio.write(RESET_PIN, rpio.HIGH);
  rpio.msleep(10);

  await writeRegister(0x01, SLEEP_MODE); 
}

// Function to Write to SX1278 Registers
function writeRegister(register: number, value: number) : Promise<void> {
  return new Promise((resolve, reject) => {
      const message = Buffer.from([register | 0x80, value]);
      loRaSPI.transfer([message], (err) => {
          if (err) reject(err);
          resolve();
      });
  });
}

// Function to Read from SX1278 Registers
function readRegister(register: number) : Promise<number>{
  return new Promise((resolve, reject) => {
      const message = Buffer.from([register & 0x7F, 0x00]);
      loRaSPI.transfer([message], (err, data: SpiMessage) => {
          if (err) reject(err);
          resolve(data.length);
      });
  });
}

export async function sendMessage(message: string) {
  console.log(`Sending LoRa message: ${message}`);

  const messageBuffer = Buffer.from(message, "utf-8");

  await writeRegister(0x0D, 0x00); // Set FIFO TX Pointer
  for (const byte of messageBuffer) {
      await writeRegister(0x00, byte); // Write data to FIFO
  }

  await writeRegister(0x22, messageBuffer.length); // Set Payload Length
  await writeRegister(0x01, TRANSMITTING_MODE); // Switch to TX mode
}

export async function listenForMessages() {
  console.log("Listening for incoming LoRa messages...");

  rpio.poll(DIO0_PIN, async () => {
      const irqFlags = await readRegister(0x12); // Read RegIrqFlags

      if (irqFlags & 0x40) { // RX_DONE bit is set
        console.log("Received a LoRa packet!");

        await writeRegister(0x12, 0xFF); // Clear IRQ Flags

        const packetSize = await readRegister(0x13); // Get packet size
        console.log(`📏 Packet Size: ${packetSize} bytes`);

        const buffer = Buffer.alloc(packetSize + 1);
        buffer[0] = 0x00 | 0x7F; // Read from FIFO
        loRaSPI.transfer([buffer], (err, data) => {
            if (err) throw err;
            console.log(`📨 LoRa Data: ${data}`);

            // Emit an event when a message is received
            loraEvents.emit("messageReceived", data);
        });
      }
  }, rpio.POLL_HIGH);
}

loraEvents.on(START_LOCATION_TRANSMISSION_TO_TRU, (data) => {
  sendMessage("START SENDING")
})

loraEvents.on(INSTRUCTION_TO_USER, (data) => {
  sendMessage("INSTRUCTIONSSS")
})

loraEvents.on(TASK_TO_RESCUER, (data) => {
  sendMessage("TASKKKK TO RESCUER")
})

loraEvents.on("messageReceived", (data) => {
  console.log("Received Message: ", data);
})