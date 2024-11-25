"use server"

import { EvacuationCenters } from "@prisma/client";
import { revalidateTag } from "next/cache";
import {createEvacuationCenter as createEvacuationCenterDB, updateEvacuationCenter as updateEvacuationCenterDB, deleteEvacuationCenter as deleteEvacuationCenterDB} from "../db/evacuationCenters";
import { EVACUATION_CENTERS_TAG } from "@/utils/tags";

export async function createEvacuationCenter(evacuationCenter: EvacuationCenters) {
  const result = await createEvacuationCenterDB({evacuationCenter})
  revalidateTag(EVACUATION_CENTERS_TAG)
  if (result) return { error: false, message: "Successfully created evacuation center" }
  return { error: true, message: "There seems to be a problem creating new evacuation center. Please try again" }
}

export async function updateEvacuationCenter(evacuationCenter: EvacuationCenters) {
  const result = await updateEvacuationCenterDB({evacuationCenter})
  revalidateTag(EVACUATION_CENTERS_TAG)
  if (result) return { error: false, message: "Successfully updated evacuation center information" }
  return { error: true, message: "There seems to be a problem updating evacuation center information. Please try again later."}
}

export async function deleteEvacuationCenter(evacuationId: number) {
  const result = await deleteEvacuationCenterDB({evacuationId})
  revalidateTag(EVACUATION_CENTERS_TAG)
  if (result) return { error: false, message: "Successfully deleted evacuation center record" }
  return { error: true, message: "There seems to be a problem deleting evacuation center record. Please try again later" }
}