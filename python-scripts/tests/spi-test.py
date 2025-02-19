

import spidev

spi = spidev.SpiDev()
spi.open(0,0)
spi.max_speed_hz = 5000000

def read_register(addr):
    return spi.xfer2([addr & 0x7E, 0])[1]

print("LoRa Version: ", hex(read_register(0x42))) # Should be 0x12 for SX1278
