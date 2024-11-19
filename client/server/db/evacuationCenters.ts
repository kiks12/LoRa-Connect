import { client } from "@/prisma/prisma"

export const getEvacuationCenters = async () => {
  return await client.evacuationCenters.findMany()
}