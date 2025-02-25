
import socketio
from tags import *

sio = socketio.Client()


@sio.event
def connect():
    print("Connection established")


@sio.on(START_LOCATION_TRANSMISSION_TO_TRU_FOR_PY)
def start_location_transmission():
    print("START_LOCATION_TRANSMISSINO_TO_TRU_FOR_PY")


sio.connect("http://localhost:3000")

while True:
    sio.wait()
