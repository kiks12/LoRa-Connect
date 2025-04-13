"use server"

import { Users } from "@prisma/client";
import { createUser, updateUser as updateUserDB, deleteUser as deleteUserDB } from "../db/users";
import { setBraceletUserId } from "../db/bracelets";
import { revalidateTag } from "next/cache";
import { BRACELETS_TAG, USERS_TAG } from "@/utils/tags";

function userErrorHandling(error: any) {
  return {error: true, message: "There seems to be a problem registering user. Please try again later."}
}

export async function registerUser({user} : {user: Users}) {
  try {
    const result = await createUser(user)
    revalidateTag(USERS_TAG)
    revalidateTag(BRACELETS_TAG)
    if (result) return { error: false, message: "Successfully registered new user to bracelet" }
    return {error: true, message: "There seems to be a problem registering user. Please try again later."}
  } catch (error) {
    return userErrorHandling(error)
  }
}

export async function updateUser({user}: {user: Users}) {
  try {
    const result = await updateUserDB(user)
    revalidateTag(USERS_TAG)
    revalidateTag(BRACELETS_TAG)
    if (result) return {error: false, message: "Successfully updated user information"}
    return {error: true, message: "There seems to be a problem updating user information. Please try again later"}
  } catch (error) {
    return userErrorHandling(error)
  }
}

export async function setUserBracelet({userId, braceletId}: {userId: number, braceletId: string}) {
  try {
    const result = await setBraceletUserId({braceletId, userId})
    revalidateTag(BRACELETS_TAG)
    revalidateTag(USERS_TAG)
    if (result) return { error: false, message: "Successfully set user of bracelet" }
    return { error: true, message: "There seems to be a problem setting the user of bracelet. Please try again later" }
  } catch (error) {
    return userErrorHandling(error)
  }
}

export async function unassignUserBracelet({braceletId}: {braceletId: string}) {
  try {
    const result = await setBraceletUserId({braceletId, userId: null})
    revalidateTag(BRACELETS_TAG)
    revalidateTag(USERS_TAG)
    if (result) return { error: false, message: "Successfully unassigned device" }
    return { error: true, message: "There seems to be a problem unassigning the device. Please try again later" }
  } catch (error) {
    return userErrorHandling(error)
  }
}

export async function deleteUser({userId}: {userId: number}) {
  try {
    const result = await deleteUserDB(userId)
    revalidateTag(USERS_TAG)
    revalidateTag(BRACELETS_TAG)
    if (result) return { error: false, message: "Successfully deleted user record" }
    return { error: true, message: "There seems to be a problem deleting user. Please try again later" }
  } catch (error) {
    return userErrorHandling(error)
  }
}