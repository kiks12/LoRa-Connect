"use server"

import { Owners } from "@prisma/client";
import { createOwner, updateOwner as updateOwnerDB } from "../db/owners";
import { setBraceletOwnerId } from "../db/bracelets";
import { revalidateTag } from "next/cache";
import { OWNERS_TAG } from "@/utils/tags";

export async function registerOwner({owner, braceletId} : {owner: Owners, braceletId: string}) {
  const result = await createOwner(owner)
  revalidateTag(OWNERS_TAG)
  if (!result) return {error: true, message: "There seems to be a problem registering owner. Please try again later."}
  const resultTwo = braceletId !== "" ? (await setBraceletOwnerId({braceletId, ownerId: result.ownerId})) : true

  if (resultTwo) return { error: false, message: "Successfully registered new owner to bracelet" }
  return {error: true, message: "There seems to be a problem registering owner. Please try again later."}
}

export async function updateOwner({owner}: {owner: Owners}) {
  const result = await updateOwnerDB(owner)
  revalidateTag(OWNERS_TAG)
  if (result) return {error: false, message: "Successfully updated owner information"}
  return {error: true, message: "There seems to be a problem updating owner information. Please try again later"}
}

export async function setOwnerBracelet({ownerId, braceletId}: {ownerId: number, braceletId: string}) {
  const result = await setBraceletOwnerId({braceletId, ownerId})
  revalidateTag(OWNERS_TAG)
  if (result) return { error: false, message: "Successfully set owner of bracelet" }
  return { error: true, message: "There seems to be a problem setting the owner of bracelet. Please try again later" }
}