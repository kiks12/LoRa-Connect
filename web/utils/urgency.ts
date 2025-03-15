import { RescueUrgency } from "@prisma/client";

export const NUMBER_TO_URGENCY : {[key: number]: RescueUrgency}= {
  0.2: RescueUrgency.LOW,
  0.5: RescueUrgency.MODERATE,
  1: RescueUrgency.SEVERE,
}