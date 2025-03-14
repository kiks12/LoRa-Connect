
from uids import *
from tags import *


""" PAYLOAD CREATION """


def start_location_transmission_to_tru():
    return f"{TO_RESCUERS_AND_USERS}{START_LOCATION_TRANSMISSION_TO_TRU}"


def instruction_to_user(instruction: dict):
    braceletUid = instruction.get("braceletId")
    evacuationCenter = instruction.get("evacuationCenter")
    message = instruction.get("message")
    return f"{braceletUid}{INSTRUCTION_TO_USER}{evacuationCenter}-{message}"


def task_to_rescuer(task):
    braceletUid = task.get("braceletId")
    username = task.get("username")
    userLat = task.get("userLatitude")
    userLong = task.get("userLongitude")
    numberOfVictims = task.get("numberOfVictims")
    urgency = task.get("urgency")
    evacuationCenter = task.get("evacuationCenter")
    return f"{braceletUid}{TASK_TO_RESCUER}{username}-{userLat}-{userLong}-{numberOfVictims}-{urgency}-{evacuationCenter}"


""" PAYLOAD CREATION """
