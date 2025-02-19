
import RPi.GPIO as GPIO 
import time

DIO0_PIN = 4

GPIO.setmode(GPIO.BCM)
GPIO.setup(DIO0_PIN, GPIO.IN)

while GPIO.input(DIO0_PIN) == 0:
    print("Waiting for TX Done...")
    time.sleep(0.4)

print("TX COMPLETE")
