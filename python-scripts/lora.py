
import threading
import asyncio
import socketio
from time import sleep
from payload import *
from SX127x.LoRa import *
from SX127x.board_config import BOARD
from tags import *
import functools

BOARD.setup()
sio = socketio.Client()


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

        sio.on(START_LOCATION_TRANSMISSION_TO_TRU_PY,
               functools.partial(self.start_location_transmission))
        sio.on(INSTRUCTION_TO_USER_PY,
               functools.partial(self.instruction_to_user))
        sio.on(TASK_TO_RESCUER_PY,
               functools.partial(self.task_to_rescuer))
        sio.on(OBSTACLE_TO_RESCUER_PY,
               functools.partial(self.obstacle_to_rescuer))

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

    def connect_to_socketio(self):
        """ Connect to the Socket.IO server and keep listening """
        sio.connect(self.ws_url)
        print(f"✅ Connected to Socket.IO server at {self.ws_url}")
        sys.stdout.flush()
        while True:
            sio.wait()  # Keeps the connection alive

    def start_socketio_listener(self):
        """ Runs the Socket.IO listener in a background thread """
        # asyncio.create_task(self.connect_to_socketio())
        print("Starting Websocket Listener...")
        thread = threading.Thread(target=self.connect_to_socketio, daemon=True)
        thread.start()

    def send_to_websocket(self, code, data):
        """ Sends a message to the Socket.IO server """
        message = {"data": data}
        sio.emit("SEND_TO_FRONTEND", message)
        print(f"📤 Sent via Socket.IO: {message}")

    def on_rx_done(self):
        self.clear_irq_flags(RxDone=1)
        payload = self.read_payload(nocheck=True)
        data = bytes(payload).decode("utf-8", "ignore")
        print("\nRECEIVED DATA: ", data)
        print("RSSI: ", self.get_rssi_value())
        source, dest, id, packet_type = self.get_uid_code_from_payload(data)
        if dest == TO_ALL or dest == TO_CENTRAL_NODE or dest == TO_RESCUERS_AND_CENTRAL_NODE:
            match packet_type:
                case "1":
                    asyncio.run(self.location_from_user(data))
                case "2":
                    asyncio.run(self.sos_from_user(data))
                case "6":
                    asyncio.run(self.location_from_rescuer(data))
                case "3":
                    asyncio.run(self.sos_from_rescuer(data))
                case "4":
                    asyncio.run(self.task_acknowledgement_from_rescuer(data))
                case "5":
                    asyncio.run(self.task_status_update_from_rescuer(data))
                case _:
                    print("default")
        else:
            self.send_message(data)

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

    def start(self):
        """ Starts both LoRa reception & WebSocket listener """
        print("Starting python server...")
        self.start_socketio_listener()

        print("🚀 LoRa & WebSocket Running...")
        self.reset_ptr_rx()
        self.set_mode(MODE.RXCONT)  # Start LoRa in receive mode
        self.print_information()
        # Keep running the LoRa listener forever
        try:
            while True:
                sleep(0.5)
                sys.stdout.flush()
        except KeyboardInterrupt:
            print("Stopping...")
            sys.stdout.flush()
            print()
            sys.stderr.write("KeyboardInterrupt\n")
        finally:
            sys.stdout.flush()
            self.set_mode(MODE.SLEEP)
            BOARD.teardown()

    """ LORA TRANSMISSION METHODS """

    def start_location_transmission(self):
        print(START_LOCATION_TRANSMISSION_TO_TRU_PY)
        self.send_message(start_location_transmission_to_tru())

    def instruction_to_user(self, instructions):
        print(INSTRUCTION_TO_USER_PY)
        evacuation_instructions = instructions.get(
            "evacuationCenterInstructions")
        for instruction in evacuation_instructions:
            self.send_message(instruction_to_user(instruction=instruction))
            sleep(0.5)

    def task_to_rescuer(self, tasks):
        print(TASK_TO_RESCUER_PY)
        for task in tasks:
            self.send_message(task_to_rescuer(task))

    def obstacle_to_rescuer(self, obstacles):
        print(TASK_TO_RESCUER_PY)
        for obstacle in obstacles:
            self.send_message(obstacle_to_rescuer(obstacle))

    """ LORA TRANSMISSION METHODS """

    """ LORA RECEIVING METHODS """

    def location_from_user(self, data):
        self.send_to_websocket(LOCATION_FROM_USER_PY, data)

    def sos_from_user(self, data):
        self.send_to_websocket(SOS_FROM_USER_PY, data)

    def location_from_rescuer(self, data):
        self.send_to_websocket(LOCATION_FROM_RESCUER_PY, data)

    def sos_from_rescuer(self, data):
        self.send_to_websocket(SOS_FROM_RESCUER_PY, data)

    def task_acknowledgement_from_rescuer(self, data):
        self.send_to_websocket(TASK_ACKNOWLEDGEMENT_FROM_RESCUER_PY, data)

    def task_status_update_from_rescuer(self, data):
        self.send_to_websocket(TASK_STATUS_UPDATE_FROM_RESCUER_PY, data)

    """ LORA RECEIVING METHODS """

    """ UTILITY FUNCTIONS """

    def get_uid_code_from_payload(self, payload):
        source = payload[0:4]
        dest = payload[5:8]
        id = payload[8:9]
        packet_type = payload[10]

        return [source, dest, id, packet_type]
    """ UTILITY FUNCTIONS """
