
import RPi.GPIO as GPIO
import time

RST_PIN = 22

GPIO.setmode(GPIO.BCM)
GPIO.setup(RST_PIN, GPIO.OUT)

GPIO.output(RST_PIN, GPIO.LOW)
time.sleep(0.5)
GPIO.output(RST_PIN, GPIO.HIGH)
time.sleep(0.5)
print("LoRa module reset")
