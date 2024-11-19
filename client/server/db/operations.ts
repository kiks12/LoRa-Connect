import { client } from "@/prisma/prisma"

export const getOperations = () => {
  return client.operations.findMany() 
}