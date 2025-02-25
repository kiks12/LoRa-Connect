
import threading
import asyncio
import socketio
from time import sleep
from payload import *
from SX127x.LoRa import *
from SX127x.board_config import BOARD
from tags import *

BOARD.setup()
sio = socketio.AsyncClient(logger=True, engineio_logger=True)


class LoRaModule(LoRa):

    def __init__(self, ws_url="http://localhost:3000", verbose=False):
        super(LoRaModule, self).__init__(verbose)

        self.ws_url = ws_url

        # self.set_mode(MODE.SLEEP)
        self.set_mode(MODE.STDBY)
        self.set_freq(433.0)
        self.set_bw(BW.BW250)
        self.set_coding_rate(CODING_RATE.CR4_5)
        self.set_pa_config(pa_select=1, max_power=0x04)
        self.set_spreading_factor(7)
        self.set_rx_crc(True)
       # [0,0,0,0,0,0] in RX, [1,0,0,0,0,0] in TX
        self.set_dio_mapping([0, 0, 0, 0, 0, 0])

        self.print_information()

    def start_location_transmission_to_tru_for_py(self, data):
        """ Handles messages received via Socket.IO """
        print(f"📩 Received from Socket.IO: {data}")
        self.send_message(data.get("message", ""))

    def print_information(self):
        print("LoRa initialized.")
        print("SX1278 Version: ", hex(self.get_register(0x42)))  # Should be 0x12
        # Should be 0x81 in standby mode
        print("Modem Config: ", hex(self.get_register(0x01)))
        # Should be 0x80, 0x00 means it is in FSK mode
        print("Long Range Config: ", hex(self.get_register(0x01) & 0x80))
        # Should be 0x8F or 0xCF
        print("Power Config: ", hex(self.get_register(0x09)))
        print("Frequency: ", self.get_freq())
        print("FrfMsb: ", hex(self.get_register(0x06)))
        print("FrfMid: ", hex(self.get_register(0x07)))
        print("FrfLsb: ", hex(self.get_register(0x08)))
        print("Spreading Factor: ", self.get_register(0x1E) >> 4)
        print("Bandwidth: ", self.get_register(0x1D) >> 4)
        print("Coding Rate: ", ((self.get_register(0x1D) & 0x0E) >> 1) + 4)
        print()

    async def connect_to_socketio(self):
        """ Connect to the Socket.IO server and keep listening """
        await sio.connect(self.ws_url)
        print(f"✅ Connected to Socket.IO server at {self.ws_url}")
        sys.stdout.flush()
        while True:
            await sio.wait()  # Keeps the connection alive

    async def start_socketio_listener(self):
        """ Runs the Socket.IO listener in a background thread """
        asyncio.create_task(self.connect_to_socketio())

    def send_to_websocket(self, code, data):
        """ Sends a message to the Socket.IO server """
        message = {"code": code, "data": data}
        sio.emit("SEND_TO_FRONTEND", message)
        print(f"📤 Sent via Socket.IO: {message}")

    def on_rx_done(self):
        self.clear_irq_flags(RxDone=1)
        payload = self.read_payload(nocheck=True)
        data = bytes(payload).decode("utf-8", "ignore")

        print(f"Received Data: {data}")
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.run_coroutine_threadsafe(
                self.send_to_websocket("LORA_MESSAGE", {"data": data}), loop)
        else:
            asyncio.run(self.send_to_websocket("LORA_MESSAGE", {"data": data}))

        self.set_mode(MODE.SLEEP)
        self.reset_ptr_rx()
        self.set_mode(MODE.RXCONT)

    def send_message(self, message):
        self.set_dio_mapping([1, 0, 0, 0, 0, 0])
        sleep(0.5)
        self.set_register(0x0E, 0x00)
        self.set_register(0x0D, 0x00)

        for byte in message:
            self.set_register(0x00, ord(byte))

        self.set_register(0x22, len(message))
        self.set_register(0x01, 0x83)
        sleep(0.5)
        print("DURING TX, OpMode: ", hex(self.get_register(0x01)))

        print(f"\nSending packet: {message}")

        while (self.get_register(0x12) & 0x08) == 0:
            sleep(0.1)

        print("Packet Sent...")
        print("TX DONE IRQ FLAGS: ", hex(self.get_register(0x12)))
        self.set_register(0x12, 0x08)  # clear IRQ flags
        sleep(0.5)
        self.set_dio_mapping([0, 0, 0, 0, 0, 0])

    async def start(self):
        """ Starts both LoRa reception & WebSocket listener """
        await self.start_socketio_listener()

        print("🚀 LoRa & WebSocket Running...")
        self.set_mode(MODE.RXCONT)  # Start LoRa in receive mode

        # Keep running the LoRa listener forever
        try:
            while True:
                sleep(0.5)
        except KeyboardInterrupt:
            print("Stopping...")
            sys.stdout.flush()
            print()
            sys.stderr.write("KeyboardInterrupt\n")
        finally:
            sys.stdout.flush()
            self.set_mode(MODE.SLEEP)
            BOARD.teardown()

    @sio.on(START_LOCATION_TRANSMISSION_TO_TRU_FOR_PY)
    async def start_location_transmission(self):
        print("START_LOCATION_TRANSMISSINO_TO_TRU_FOR_PY")
        sys.stdout.flush()
        self.send_message(start_location_transmission_to_tru())

    @sio.on(INSTRUCTION_TO_USER_FOR_PY)
    async def instruction_to_user(self):
        print("INSTRUCTION_TO_USER")

    @sio.on(TASK_TO_RESCUER_FOR_PY)
    async def task_to_rescuer(self):
        print("INSTRUCTION_TO_USER")

# lora = LoRaModule(verbose=True)
# lora.set_mode(MODE.STDBY)
# lora.set_freq(433.0)
# lora.set_bw(BW.BW250)
# lora.set_coding_rate(CODING_RATE.CR4_5)
# lora.set_pa_config(pa_select=1, max_power=0x04)
# lora.set_spreading_factor(7)
# lora.set_rx_crc(True)

# print("LoRa initialized.")
# print("SX1278 Version: ", hex(lora.get_register(0x42)))  # Should be 0x12
# # Should be 0x81 in standby mode
# print("Modem Config: ", hex(lora.get_register(0x01)))
# # Should be 0x80, 0x00 means it is in FSK mode
# print("Long Range Config: ", hex(lora.get_register(0x01) & 0x80))
# print("Power Config: ", hex(lora.get_register(0x09)))  # Should be 0x8F or 0xCF
# print("Frequency: ", lora.get_freq())
# print("FrfMsb: ", hex(lora.get_register(0x06)))
# print("FrfMid: ", hex(lora.get_register(0x07)))
# print("FrfLsb: ", hex(lora.get_register(0x08)))
# print("Spreading Factor: ", lora.get_register(0x1E) >> 4)
# print("Bandwidth: ", lora.get_register(0x1D) >> 4)
# print("Coding Rate: ", ((lora.get_register(0x1D) & 0x0E) >> 1) + 4)
# print()

# try:
#     # RECEIVER
#     # print("Listening to messages...")
#     # lora.start()

#     # TRANSMITTER
#     while True:
#         print("BEFORE TX, OpMode: ", hex(lora.get_register(0x01)))
#         lora.send_message("Hello from Raspi")
#         print("AFTER TX, OpMode: ", hex(lora.get_register(0x01)))

# except KeyboardInterrupt:
#     sys.stdout.flush()
#     print()
#     sys.stderr.write("KeyboardInterrupt\n")
# finally:
#     sys.stdout.flush()
#     lora.set_mode(MODE.SLEEP)
#     BOARD.teardown()
