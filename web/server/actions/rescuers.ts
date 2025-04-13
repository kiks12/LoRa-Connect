"use server"

import { revalidateTag } from "next/cache"
import { setBraceletRescuerId } from "../db/bracelets"
import { BRACELETS_TAG, RESCUERS_TAG } from "@/utils/tags"
import { Rescuers } from "@prisma/client"
import { createRescuer, updateRescuer as updateRescuerDB, deleteRescuer as deleteRescuerDB } from "../db/rescuers"

function rescuerErrorHandling(error: any) {
  return { error: true, message: "There seems to be a problem setting the owner of bracelet. Please try again later" }
}

export async function setRescuerBracelet({rescuerId, braceletId}: {rescuerId: number, braceletId: string}) {
  try {
    const result = await setBraceletRescuerId({braceletId, rescuerId})
    revalidateTag(BRACELETS_TAG)
    revalidateTag(RESCUERS_TAG)
    if (result) return { error: false, message: "Successfully set rescuer owner of bracelet" }
    return { error: true, message: "There seems to be a problem setting the owner of bracelet. Please try again later" }
  } catch (error) {
    return rescuerErrorHandling(error)
  }
}

export async function registerRescuer({rescuer}: {rescuer: Rescuers}) {
  try {
    const result = await createRescuer(rescuer)
    revalidateTag(RESCUERS_TAG)
    revalidateTag(BRACELETS_TAG)
    if (result) return { error: false, message: "Successfully registered new rescuer" }
    return {error: true, message: "There seems to be a problem registering rescuer. Please try again later"}
  } catch (error) {
    return rescuerErrorHandling(error)
  }
}

export async function updateRescuer({rescuer}: {rescuer: Rescuers}) {
  try {
    const result = await updateRescuerDB({rescuer})
    revalidateTag(RESCUERS_TAG)
    revalidateTag(BRACELETS_TAG)
    if (result) return {error: false, message: "Successfully updated rescuer information"}
    return {error: true, message: "There seems to be a problem updating rescuer information. Please try again later"}
  } catch (error) {
    return rescuerErrorHandling(error)
  }
}

export async function deleteRescuer({rescuerId}: {rescuerId: number}) {
  try {
    const result = await deleteRescuerDB({rescuerId})
    revalidateTag(RESCUERS_TAG)
    revalidateTag(BRACELETS_TAG)
    if (result) return { error: false, message: "Successfully deleted rescuer record" }
    return { error: true, message: "There seems to be a problem deleting rescuer record. Please try again later" }
  } catch (error) {
    return rescuerErrorHandling(error)
  }
}