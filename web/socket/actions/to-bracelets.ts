import { EvacuationInstruction } from "@/types"

export function sendTransmitLocationSignalToBracelets(arg: string, callback: () => void) {
  console.log("SEND TRANSMIT LOCATION SIGNAL VIA LORA")
  // Process signal to transmit 
}

export function sendEvacuationInstructionToBracelets(arg: object) {
  console.log("SEND EVACUATION INSTRUCTION VIA LORA")
  console.log(arg)
}

export function sendTaskToRescuer(arg: string, callback: () => void) {
  console.log("SEND TASK TO RESCUER VIA LORA")
  // send task to rescuer
}

