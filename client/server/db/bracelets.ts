import { client } from "@/prisma/prisma"
import { Bracelets } from "@prisma/client"

export const getBracelets = async () => {
  return await client.bracelets.findMany()
}

export const createBracelet = async ({bracelet}: {bracelet: Bracelets}) => {
  return await client.bracelets.create({
    data: bracelet
  })
}

export const updateBracelet = async ({bracelet}: {bracelet: Bracelets}) => {
  return await client.bracelets.update({
    data: bracelet,
    where: {
      braceletId: bracelet.braceletId
    }
  })
}

export const deleteBracelet = async ({bracelet}: {bracelet: Bracelets}) => {
  return await client.bracelets.delete({
    where: {
      braceletId: bracelet.braceletId
    }
  })
}