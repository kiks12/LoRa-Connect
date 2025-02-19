
from time import sleep
from SX127x.LoRa import *
from SX127x.board_config import BOARD

BOARD.setup()

class LoRaModule(LoRa):

    def __init__(self, verbose=False):
        super(LoRaModule, self).__init__(verbose)
        #self.set_mode(MODE.SLEEP)
        self.set_dio_mapping([1,0,0,0,0,0]) # [0,0,0,0,0,0] in RX, [1,0,0,0,0,0] in TX

    def start(self):
        self.reset_ptr_rx()
        self.set_mode(MODE.RXCONT)
        while True:
            sleep(0.5)
            rssi_value = self.get_rssi_value()
            status = self.get_modem_status()
            sys.stdout.flush()

    def on_rx_done(self):
        self.clear_irq_flags(RxDone=1)
        payload = self.read_payload(nocheck=True)
        data = bytes(payload).decode("utf-8", "ignore")

        self.set_mode(MODE.SLEEP)
        self.reset_ptr_rx()
        self.set_mode(MODE.RXCONT)

    def on_tx_done(self):
        #print("TX DONE IRQ FLAGS: ", hex(self.get_register(0x12)))
        #self.set_mode(MODE.STDBY)
        print()

    def send_message(self, message):
        self.set_register(0x0E, 0x00)
        self.set_register(0x0D, 0x00)

        for byte in message:
            self.set_register(0x00, ord(byte))

        self.set_register(0x22, len(message))
        self.set_register(0x01, 0x83)
        sleep(0.5)
        print("DURING TX, OpMode: ", hex(lora.get_register(0x01)))

        print(f"\nSending packet: {message}")
        
        while (self.get_register(0x12) & 0x08) == 0:
            sleep(0.1)
        
        print("Packet Sent...")
        print("TX DONE IRQ FLAGS: ", hex(self.get_register(0x12)))
        self.set_register(0x12, 0x08) # clear IRQ flags

        """
        print("\nSending packet...")
        self.set_mode(MODE.SLEEP)
        message = "Hello from Raspi"
        self.write_payload(list(bytearray(message, "utf-8")))
        self.set_mode(MODE.TX)
        sleep(5)

        print("Packet: ", message)
        print("Packet: ", list(bytearray(message, "utf-8")))
        print("Packet sent...")
        """

lora = LoRaModule(verbose=True)
lora.set_mode(MODE.STDBY)
lora.set_freq(433.0)
lora.set_bw(BW.BW250)
lora.set_coding_rate(CODING_RATE.CR4_5)
lora.set_pa_config(pa_select=1, max_power=0x04)
lora.set_spreading_factor(7)
lora.set_rx_crc(True)

print("LoRa initialized.")
print("SX1278 Version: ", hex(lora.get_register(0x42))) # Should be 0x12 
print("Modem Config: ", hex(lora.get_register(0x01))) # Should be 0x81 in standby mode
print("Long Range Config: ", hex(lora.get_register(0x01) & 0x80)) # Should be 0x80, 0x00 means it is in FSK mode
print("Power Config: ", hex(lora.get_register(0x09))) # Should be 0x8F or 0xCF
print("Frequency: ", lora.get_freq())
print("FrfMsb: ", hex(lora.get_register(0x06)))
print("FrfMid: ", hex(lora.get_register(0x07)))
print("FrfLsb: ", hex(lora.get_register(0x08)))
print("Spreading Factor: ", lora.get_register(0x1E) >> 4)
print("Bandwidth: ", lora.get_register(0x1D) >> 4)
print("Coding Rate: ", ((lora.get_register(0x1D) & 0x0E) >> 1) + 4)
print()

try:
    # RECEIVER
    #print("Listening to messages...")
    #lora.start()

    #TRANSMITTER
    while True:
        print("BEFORE TX, OpMode: ", hex(lora.get_register(0x01)))
        lora.send_message("Hello from Raspi")
        print("AFTER TX, OpMode: ", hex(lora.get_register(0x01)))

except KeyboardInterrupt:
    sys.stdout.flush()
    print()
    sys.stderr.write("KeyboardInterrupt\n")
finally:
    sys.stdout.flush()
    lora.set_mode(MODE.SLEEP)
    BOARD.teardown()

