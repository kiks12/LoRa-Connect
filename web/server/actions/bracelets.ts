"use server"

import { Bracelets } from "@prisma/client";
import { createBracelet as createBraceletDB, updateBracelet as updateBraceletDB, deleteBracelet as deleteBraceletDB} from "../db/bracelets";
import { revalidateTag } from "next/cache";
import { BRACELETS_TAG } from "@/utils/tags";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

function braceletErrorHandling(error: any) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.message.includes("Unique constraint failed on the constraint: `PRIMARY`")) {
      return { error: true, message: "This Device ID is already registered" }
    }
    if (error.message.includes("Unique constraint failed on the constraint: `Bracelets_name_key`")) {
      return { error: true, message: "This Device Name is already used" }
    }
    if (error.message.includes("Unique constraint failed on the constraint: `Bracelets_macAddress_key`")) {
      return { error: true, message: "This Device Mac Address is already used" }
    }
  }
  return { error: true, message: "There seems to be a problem creating new bracelet. Please try again" }
}

export async function createBracelet(bracelet: Bracelets) {
  try {
    const result = await createBraceletDB({bracelet})
    revalidateTag(BRACELETS_TAG)
    if (result) return { error: false, message: "Successfully created bracelet" }
    return { error: true, message: "There seems to be a problem creating new bracelet. Please try again" }
  } catch(error) {
    return braceletErrorHandling(error);
  }
}

export async function updateBracelet(braceletId: string, bracelet: Bracelets) {
  try {
    const result = await updateBraceletDB({braceletId, bracelet})
    revalidateTag(BRACELETS_TAG)
    if (result) return { error: false, message: "Successfully updated bracelet information" }
    return { error: true, message: "There seems to be a problem updating bracelet information. Please try again later."}
  } catch (error) {
    return braceletErrorHandling(error);
  }
}

export async function deleteBracelet(braceletId: string) {
  try {
    const result = await deleteBraceletDB({braceletId})
    revalidateTag(BRACELETS_TAG)
    if (result) return { error: false, message: "Successfully deleted bracelet record" }
    return { error: true, message: "There seems to be a problem deleting bracelet record. Please try again later" }
  } catch (error) {
    return braceletErrorHandling(error);
  }
}