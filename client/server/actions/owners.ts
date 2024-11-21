"use server"

import { Owners } from "@prisma/client";
import { createOwner } from "../db/owners";
import { setBraceletOwnerId } from "../db/bracelets";

export async function registerOwner({owner, braceletId} : {owner: Owners, braceletId: string}) {
  const result = await createOwner(owner)
  if (!result) return {error: true, message: "There seems to be a problem registering owner. Please try again later."}
  const resultTwo = await setBraceletOwnerId({braceletId, ownerId: result.ownerId})

  if (resultTwo) return { error: false, message: "Successfully registered new owner to bracelet" }
  return {error: true, message: "There seems to be a problem registering owner. Please try again later."}
}

export async function setOwnerBracelet({ownerId, braceletId}: {ownerId: number, braceletId: string}) {
  const result = await setBraceletOwnerId({braceletId, ownerId})
  if (result) return { error: false, message: "Successfully set owner of bracelet" }
  return { error: true, message: "There seems to be a problem setting the owner of bracelet. Please try again later" }
}