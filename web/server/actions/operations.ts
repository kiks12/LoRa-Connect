"use server"

import { Operations } from "@prisma/client"
import {updateOperation as updateOperationDB, deleteOperation as deleteOperationDB} from "../db/operations"
import { revalidateTag } from "next/cache"
import { OPERATIONS_TAG } from "@/utils/tags"

function operationErrorHandling(error: any) {
  return {error: true, message: "There seems to be a problem updating operation information. Please try again later."}
}

export async function updateOperation(operation: Operations) {
  try {
    const result = await updateOperationDB({operation})
    revalidateTag(OPERATIONS_TAG)
    if (result) return {error: false, message: "Successfully updated operation information"}
    return {error: true, message: "There seems to be a problem updating operation information. Please try again later."}
  } catch (error) {
    return operationErrorHandling(error)
  }
}

export async function deleteOperation(operationId: string) {
  try {
    const result = await deleteOperationDB({operationId})
    revalidateTag(OPERATIONS_TAG)
    if (result) return {error: false, message: "Successfully deleted operation"}
    return {error: true, message: "There seems to be a problem deleting operation. Please try again later."}
  } catch (error) {
    return operationErrorHandling(error)
  }
}