"use server"

import { Bracelets } from "@prisma/client";
import { createBracelet as createBraceletDB, updateBracelet as updateBraceletDB} from "../db/bracelets";
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