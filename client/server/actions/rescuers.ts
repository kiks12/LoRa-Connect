import { setBraceletRescuerId } from "../db/bracelets"

export async function setRescuerBracelet({rescuerId, braceletId}: {rescuerId: number, braceletId: string}) {
  const result = await setBraceletRescuerId({braceletId, rescuerId})
  if (result) return { error: false, message: "Successfully set owner of bracelet" }
  return { error: true, message: "There seems to be a problem setting the owner of bracelet. Please try again later" }
}