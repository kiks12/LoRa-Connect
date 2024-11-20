"use server"

import { Bracelets } from "@prisma/client";
import { createBracelet as createBraceletDB } from "../db/bracelets";

export async function createBracelet(bracelet: Bracelets) {
  const result = await createBraceletDB({bracelet})
  if (result) return { error: false, message: "Successfully created bracelet" }
  return { error: true, message: "There seems to be a problem creating new bracelet. Please try again" }
}