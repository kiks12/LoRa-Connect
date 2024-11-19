import { client } from "@/prisma/prisma"

export const getRescuers = async () => {
  return await client.rescuers.findMany()
}