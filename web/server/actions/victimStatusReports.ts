"use server"

import { VictimStatusReport } from "@prisma/client"
import {syncVictimStatusReports as syncVictimStatusReportsDB} from "../db/victimStatusReports"
import { revalidateTag } from "next/cache"
import { OPERATIONS_TAG } from "@/utils/tags"

export async function syncVictimStatusReports(newVictimStatusReports: VictimStatusReport[], existingVictimStatusReports: VictimStatusReport[]) {
  const result = await syncVictimStatusReportsDB({newVictimStatusReports, existingVictimStatusReports})
  revalidateTag(OPERATIONS_TAG)
  if (result) return {error: false, message: "Successfully synced victim status reports"}
  return {error: true, message: "There seems to be a problem syncing victim status reports. Please try again later."}

}