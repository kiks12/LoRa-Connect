"use server"

import { Bracelets } from "@prisma/client";
import { createBracelet as createBraceletDB, updateBracelet as updateBraceletDB, deleteBracelet as deleteBraceletDB} from "../db/bracelets";
import { revalidateTag } from "next/cache";
import { BRACELETS_TAG } from "@/utils/tags";

export async function createBracelet(bracelet: Bracelets) {
  const result = await createBraceletDB({bracelet})
  revalidateTag(BRACELETS_TAG)
  if (result) return { error: false, message: "Successfully created bracelet" }
  return { error: true, message: "There seems to be a problem creating new bracelet. Please try again" }
}

export async function updateBracelet(braceletId: string, bracelet: Bracelets) {
  const result = await updateBraceletDB({braceletId, bracelet})
  revalidateTag(BRACELETS_TAG)
  if (result) return { error: false, message: "Successfully updated bracelet information" }
  return { error: true, message: "There seems to be a problem updating bracelet information. Please try again later."}
}

export async function deleteBracelet(braceletId: string) {
  const result = await deleteBraceletDB({braceletId})
  revalidateTag(BRACELETS_TAG)
  if (result) return { error: false, message: "Successfully deleted bracelet record" }
  return { error: true, message: "There seems to be a problem deleting bracelet record. Please try again later" }
}