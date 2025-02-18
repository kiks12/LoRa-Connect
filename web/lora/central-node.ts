
// RECEIVING 

import { INSTRUCTION_TO_USER, START_LOCATION_TRANSMISSION_TO_TRU, TASK_TO_RESCUER } from "@/lora-tags";
import { loraEvents } from "./lora-setup";

export function locationFromUser() {
  //
}

export function sosFromRescuer() {
  //
}

export function sosFromUser() {
  //
}

export function taskAcknowledgementFromRescuer() {
  //
}

export function taskStatusUpdateFromRescuer() {
  //
}

export function urgencyUpdateFromUser() {
  //
}

export function locationFromRescuer() {
  //
}

// RECEIVING 


// TRANSMITTING

export function startLocationTransmissionToTRU(data: object) {
  loraEvents.emit(START_LOCATION_TRANSMISSION_TO_TRU, data)
}

export function instructionToUser(data: object) {
  loraEvents.emit(INSTRUCTION_TO_USER, data)
}

export function taskToRescuer(data: object) {
  loraEvents.emit(TASK_TO_RESCUER, data)
}

// TRANSMITTING
