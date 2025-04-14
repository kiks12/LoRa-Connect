import { RescueUrgency } from "@prisma/client";

export const NUMBER_TO_URGENCY : {[key: number]: RescueUrgency}= {
  0.2: RescueUrgency.LOW,
  0.5: RescueUrgency.MODERATE,
  1: RescueUrgency.SEVERE,
}

export const URGENCY_TO_NUMBER: {[key: string]: number} = {
  "LOW": 0.2,
  "MODERATE": 0.5,
  "SEVERE": 1,
}

export const URGENCY_LORA_TO_DB : {[key: string]: number}= {
  "1": 0.2, 
  "2": 0.5,
  "3": 1
}