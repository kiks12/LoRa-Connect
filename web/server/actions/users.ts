"use server"

import { Users } from "@prisma/client";
import { createUser, updateUser as updateUserDB, deleteUser as deleteUserDB } from "../db/users";
import { setBraceletUserId } from "../db/bracelets";
import { revalidateTag } from "next/cache";
import { BRACELETS_TAG, USERS_TAG } from "@/utils/tags";

export async function registerUser({user, braceletId} : {user: Users, braceletId: string}) {
  const result = await createUser(user)
  if (!result) return {error: true, message: "There seems to be a problem registering user. Please try again later."}
  const resultTwo = braceletId !== "" ? (await setBraceletUserId({braceletId, userId: result.userId})) : true
  revalidateTag(USERS_TAG)
  revalidateTag(BRACELETS_TAG)
  if (resultTwo) return { error: false, message: "Successfully registered new user to bracelet" }
  return {error: true, message: "There seems to be a problem registering user. Please try again later."}
}

export async function updateUser({user}: {user: Users}) {
  const result = await updateUserDB(user)
  revalidateTag(USERS_TAG)
  revalidateTag(BRACELETS_TAG)
  if (result) return {error: false, message: "Successfully updated user information"}
  return {error: true, message: "There seems to be a problem updating user information. Please try again later"}
}

export async function setUserBracelet({userId, braceletId}: {userId: number, braceletId: string}) {
  const result = await setBraceletUserId({braceletId, userId})
  revalidateTag(BRACELETS_TAG)
  revalidateTag(USERS_TAG)
  if (result) return { error: false, message: "Successfully set user of bracelet" }
  return { error: true, message: "There seems to be a problem setting the user of bracelet. Please try again later" }
}

export async function deleteUser({userId}: {userId: number}) {
  const result = await deleteUserDB(userId)
  revalidateTag(USERS_TAG)
  revalidateTag(BRACELETS_TAG)
  if (result) return { error: false, message: "Successfully deleted user record" }
  return { error: true, message: "There seems to be a problem deleting user. Please try again later" }
}