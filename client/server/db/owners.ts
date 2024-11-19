import { client } from "@/prisma/prisma"

export const getOwners = async () => {
  return await client.owners.findMany()
}