import { Prisma } from "@prisma/client";

export type OwnerWithBracelet = Prisma.OwnersGetPayload<{
  include: {
    bracelet: true
  }
}>

export type RescuerWithBracelet = Prisma.RescuersGetPayload<{
  include: {
    bracelet: true
  }
}>

export declare module "@mapbox/mbtiles" {
  interface GetInfoCallbackResult {
    basename: string
    id: string
    filesize: number
    minzoom?: number
    maxzoom?: number
    center?: number[]
    bounds?: number[]
    scheme: string
    [key: string]: string | number | number[] | undefined
  }
  type GetTileCallback = (
    ...args:
      | [Error, undefined, undefined]
      | [null, Buffer, Record<string, string>]
  ) => void
  export default class MBTiles {
    constructor(
      uri: string,
      callback?: (error: Error, result: Record<string, string>) => void
    )
    getInfo(
      callback: (error: Error | null, info?: GetInfoCallbackResult) => void
    ): void
    getTile(z: number, x: number, y: number, callback: GetTileCallback): void
  }
}