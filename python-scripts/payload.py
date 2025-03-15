
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


"""
TASK TO RESCUER PAYLOAD FROM SERVER 

  {
    missionId: '312152025',
    userLat: 15.13317932882476,
    userLong: 120.5975928777052,
    userId: 3,
    user: {
      userId: 3,
      createdAt: '2025-03-02T13:59:17.904Z',
      name: 'Trial Dummy Sample UPDATED',
      numberOfMembersInFamily: 7,
      address: 'SAMPLE ADDRESS DUMMY UPDATED',
      bracelet: [Object],
      showing: false
    },
    userBraceletId: 'XUSR0003',
    urgency: 1,
    status: 'ASSIGNED',
    teamId: 1,
    team: {
      teamId: 1,
      createdAt: '2025-03-02T14:08:44.912Z',
      name: 'Team 1',
      rescuers: [Array],
      showing: false
    },
    teamBraceletId: 'XRES0001',
    coordinates: [
      [Array], [Array], [Array], [Array],
      [Array], [Array], [Array], [Array],
      [Array], [Array], [Array], [Array],
      [Array], [Array], [Array], [Array],
      [Array], [Array], [Array], [Array],
      [Array], [Array], [Array], [Array],
      [Array], [Array], [Array], [Array],
      [Array], [Array], [Array], [Array],
      [Array], [Array], [Array], [Array],
      [Array], [Array], [Array], [Array],
      [Array], [Array], [Array]
    ],
    distance: 2512.785,
    time: 191066
  }
"""


def task_to_rescuer(task):
    missionId = task.get("missionId")
    braceletUid = task.get("teamBraceletId")
    username = task.get("user").get("name")
    userLat = task.get("userLat")
    userLong = task.get("userLong")
    numberOfVictims = task.get("numberOfVictims")
    status = 0
    match task.get("status"):
        case "ASSIGNED":
            status = 1
        case "PENDING":
            status = 2
        case "CANCELED":
            status = 3
        case "FAILED":
            status = 4
        case "COMPLETE":
            status = 5
    urgency = task.get("urgency")

    return f"{braceletUid}{TASK_TO_RESCUER}{missionId}-{username}-{userLat}-{userLong}-{numberOfVictims}-{status}-{urgency}"


""" PAYLOAD CREATION """
