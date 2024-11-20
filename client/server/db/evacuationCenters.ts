import { client } from "@/prisma/client"

export const getEvacuationCenters = async () => {
  return await client.evacuationCenters.findMany()
}